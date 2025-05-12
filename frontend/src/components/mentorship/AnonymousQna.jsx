
import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { API_URL } from "../../config";

const AnonymousQna = () => {
  const { user } = useAuth();
  const [newQuestion, setNewQuestion] = useState("");
  const [success, setSuccess] = useState(false);
  const [myQuestions, setMyQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("ask");

 
  const fetchMyQuestions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/qna/my-questions`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setMyQuestions(data);
    } catch (error) {
      console.error("Error fetching your questions:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchMyQuestions();
    }
  }, [activeTab]);

  // Handle new question submission
  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/qna/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ question: newQuestion }),
      });

      if (res.ok) {
        setSuccess(true);
        setNewQuestion("");
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl text-white font-bold mb-6 text-center">Anonymous Q&A with Mentors</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("ask")}
          className={`py-2 px-4 rounded ${
            activeTab === "ask" ? "bg-blue-600 text-white" : "bg-black"
          }`}
        >
          Ask a Question
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`py-2 px-4 rounded ${
            activeTab === "view" ? "bg-blue-600 text-white" : "bg-black"
          }`}
        >
          View Answers
        </button>
      </div>

      {/* Ask Tab */}
      {activeTab === "ask" && (
        <div>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows="4"
            className="w-full p-3 border rounded"
            placeholder="Type your question here..."
          ></textarea>
          <button
            onClick={handleAskQuestion}
            className="mt-3 bg-blue-600 text-white py-2 px-4 rounded"
          >
            Submit Question
          </button>
          {success && <p className="text-green-500 mt-2">Question submitted!</p>}
        </div>
      )}

      {/* View Tab */}
      {activeTab === "view" && (
        <div>
          {myQuestions.length === 0 ? (
            <p className="text-gray-600">You haven’t asked any questions yet.</p>
          ) : (
            myQuestions.map((q) => (
              <div
                key={q._id}
                className="border p-4 mb-4 rounded bg-white shadow-sm"
              >
                <p className="font-medium text-black">Q: {q.question}</p>
                <p className="mt-2 text-blue-500" >
                  <strong>A:</strong>{" "}
                  {q.answer ? (
                    q.answer
                  ) : (
                    <span className="text-red-500 italic">Not answered yet</span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AnonymousQna;

