
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: searchResults = [] } = useQuery({
    queryKey: ["userSearch", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await fetch(`/api/users/search?query=${searchTerm}`);
      const data = await res.json();
      return data.users;
    },
    enabled: !!searchTerm.trim(),
  });

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search users by name or username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 rounded-xl bg-gray-800 text-white placeholder-black-400 focus:outline-none"
      />

      {searchResults.length > 0 && (
        <ul className="mt-6 space-y-4">
          {searchResults.map((user) => (
            <li key={user._id}>
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 transition rounded-xl p-3"
              >
                <img
                  src={user.profilePic || "/avatar-placeholder.png"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-600"
                />
                <div className="text-white">
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {searchTerm && searchResults.length === 0 && (
        <p className="text-center text-gray-400 mt-6">No users found.</p>
      )}
    </div>
  );
};

export default SearchPage;
