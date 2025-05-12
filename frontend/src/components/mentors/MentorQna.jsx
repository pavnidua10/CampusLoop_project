
import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { API_URL } from "../../config";

const MentorQna = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/qna/questions`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [user.token]);

  const handleSubmitAnswer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/qna/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          answer,
          questionId: selectedQuestion._id,
        }),
      });

      const updated = await res.json();
      setQuestions((prev) =>
        prev.map((q) => (q._id === updated._id ? updated : q))
      );
      setSelectedQuestion(null);
      setAnswer("");
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Unanswered Questions</h1>

      {questions.length === 0 ? (
        <p>No questions to show.</p>
      ) : (
        questions.map((q) => (
          <div key={q._id} className="border p-4 rounded mb-4 bg-white shadow">
            <p className="text-gray-800 font-medium">{q.question}</p>
            
            {!q.answer && (
              <button
                onClick={() => setSelectedQuestion(q)}
                className="mt-2 bg-green-500 text-white px-4 py-1 rounded"
              >
                Answer
              </button>
            )}
          </div>
        ))
      )}

      {selectedQuestion && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Answer the question:</h2>
          <p className="mb-2">{selectedQuestion.question}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows="4"
            className="w-full p-2 border rounded"
            placeholder="Type your answer here..."
          ></textarea>
          <button
            onClick={handleSubmitAnswer}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
};

export default MentorQna;
