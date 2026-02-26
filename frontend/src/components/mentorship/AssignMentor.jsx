const MentorCard = ({ mentor, onSelect }) => {
  return (
    <div className="mentor-card border p-4 rounded shadow-md flex flex-col items-center space-y-2">
      <img
        src={mentor.profileImg || "/avatar-placeholder.png"}
        alt={mentor.fullName || "Mentor"}
        className="rounded-full w-20 h-20 object-cover"
      />
      <h3 className="text-lg font-semibold">{mentor.fullName}</h3>
      <p className="text-sm text-gray-600 text-center">{mentor.bio}</p>
      <button
        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => onSelect(mentor._id)}
      >
        Select Mentor
      </button>
    </div>
  );
};

export default MentorCard;

