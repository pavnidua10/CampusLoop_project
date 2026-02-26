import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useFollow from "../../hooks/useFollow";
import { API_URL } from "../../config";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { follow, isPending } = useFollow();

  // 🔍 Search Query
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["userSearch", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await fetch(
        `${API_URL}/api/users/search?query=${searchTerm}`,
        { credentials: "include" }
      );
      const data = await res.json();
      return data.users;
    },
    enabled: !!searchTerm.trim(),
  });

  // ⭐ Suggested Users (shown when no search term)
  const { data: suggestedUsers = [], isLoading: isLoadingSuggestions } =
    useQuery({
      queryKey: ["suggestedUsers"],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/api/users/suggested`, {
          credentials: "include",
        });
        const data = await res.json();
        return data;
      },
      enabled: !searchTerm.trim(),
    });

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6">
          Discover Students
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by username, college, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
        </div>

        {/* When Searching */}
        {searchTerm && (
          <div className="mt-8 space-y-4">
            {isSearching && (
              <p className="text-center text-gray-400">Searching...</p>
            )}

            {!isSearching && searchResults.length === 0 && (
              <p className="text-center text-gray-400">
                No users found.
              </p>
            )}

            {searchResults.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user.username}`}
                className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition p-4 rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.profilePic || "/avatar-placeholder.png"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-sm text-gray-400">
                      @{user.username}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      🎓 {user.college} • 📘 {user.course}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    follow(user._id);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 rounded-full text-sm hover:brightness-110 transition"
                >
                  {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                </button>
              </Link>
            ))}
          </div>
        )}

        {/* Suggested Section */}
        {!searchTerm && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">
              Suggested Connections
            </h2>

            {isLoadingSuggestions && (
              <p className="text-gray-400">Loading suggestions...</p>
            )}

            <div className="grid gap-4">
              {suggestedUsers.map((user) => (
                <Link
                  key={user._id}
                  to={`/profile/${user.username}`}
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition p-4 rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={user.profileImg || "/avatar-placeholder.png"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-sm text-gray-400">
                        @{user.username}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        🎓 {user.college} • 📘 {user.course}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 rounded-full text-sm hover:brightness-110 transition"
                  >
                    {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
