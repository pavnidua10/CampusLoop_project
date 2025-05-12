

import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";

const MentorDashboard = ({ mentorId }) => {
  const [mentees, setMentees] = useState([]);
  const [resources, setResources] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        if (!mentorId) return;
        const res = await fetch(`${API_URL}/api/mentor/${mentorId}/mentees`);
        const data = await res.json();
        setMentees(data.mentees);
      } catch (err) {
        console.error("Failed to fetch mentees", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/mentor/my-resources", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Failed to fetch resources", err);
      }
    };

    fetchMentees();
    fetchResources();
  }, [mentorId]);

  const handleFileUpload = async () => {
    if (!file) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/mentorResources/upload-resource`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setResources((prev) => [...prev, data]);
      setFile(null);
      alert("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload error");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800">Your Mentees</h2>

      {mentees.length === 0 ? (
        <p className="text-gray-600">No mentees assigned yet.</p>
      ) : (
        <ul className="grid gap-4">
          {mentees.map((mentee) => (
            <li key={mentee._id} className="bg-white shadow p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <img
                  src={mentee.profileImg || "/avatar-placeholder.png"}
                  alt="mentee"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mentee.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">@{mentee.username}</p>
                  <p className="text-sm text-gray-600 mt-1">{mentee.bio}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* File Upload Section */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Share a Resource
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <input
            type="file"
            className="file-input file-input-bordered file-input-sm w-full sm:max-w-xs"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            className="btn btn-sm btn-accent w-full sm:w-auto"
            onClick={handleFileUpload}
          >
            Upload
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2 text-gray-700">
            Previously Shared Resources
          </h4>
          {resources.length === 0 ? (
            <p className="text-sm text-gray-500">No resources uploaded yet.</p>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              {resources.map((r) => (
                <li key={r._id}>
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {r.fileName}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
