import QnA from "../models/anonymousQuestion.js";
export const askQuestion = async (req, res) => {
  const { question } = req.body;

  try {
    const newQuestion = await QnA.create({
      question,
      askedBy: req.user._id,
    });
    res.status(200).json(newQuestion);
  } catch (error) {
    console.error("Error in asking question:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};


export const getQuestions = async (req, res) => {
  try {
    const questions = await QnA.find({ answeredBy: null })
      .populate("askedBy", "fullName")
      .sort({ createdAt: -1 }); 
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error in fetching questions:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// Answer a question (Mentor)
export const answerQuestion = async (req, res) => {
  const { answer, questionId } = req.body;

  try {
    const question = await QnA.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found!" });
    }

    if (question.answeredBy) {
      return res.status(400).json({ error: "Question already answered!" });
    }

    question.answer = answer;
    question.answeredBy = req.user._id;

    await question.save();
    res.status(200).json(question);
  } catch (error) {
    console.error("Error in answering question:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};


export const getMyQna = async (req, res) => {
  try {
    const myQuestions = await QnA.find({ askedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(myQuestions);
  } catch (error) {
    console.error("Error fetching mentee questions:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

