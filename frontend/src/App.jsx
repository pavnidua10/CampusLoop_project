import { useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { AuthContextProvider } from "./Context/AuthContext";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "./config";

import HomePage from "./pages/home/homePage";
import SignUpPage from "./pages/auth/signup/signUpPage";
import LoginPage from "./pages/auth/login/loginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ChatPage from "./pages/chat/ChatPage";
import MentorshipPage from "./pages/Mentorship/MentorshipPage";
import MentorshipChatInterface from "./components/mentorship/MentorshipChatInterface";
import MentorPage from "./pages/Mentorship/MentorPage";
import SearchPage from "./pages/search/SearchPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContextProvider authUser={authUser}>
  
      {authUser && (
        <button
          className="fixed top-4 left-4 z-50 md:hidden p-2 rounded bg-gray-800 text-white"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
     
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto min-h-screen bg-gray-950">
    
        {authUser && (
          <div
            className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{ background: sidebarOpen ? "rgba(0,0,0,0.5)" : "transparent" }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Sidebar overlay"
          >
            <div
              className="w-64 h-full bg-gray-900 shadow-lg p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="mb-4 text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
             
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Sidebar />
            </div>
          </div>
        )}

        {authUser && (
          <aside className="hidden md:flex md:flex-col md:w-64 border-r border-gray-800 bg-gray-900">
            <Sidebar />
          </aside>
        )}

        
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={authUser ? <Navigate to={`/profile/${authUser.username}`} /> : <Navigate to="/login" />} />
            <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
            <Route path="/chat/:chatId" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/mentorship" element={<MentorshipPage />} />
            <Route path="/mentorship/chat/:id" element={<MentorshipChatInterface />} />
            <Route path="/mentor/:mentorId" element={authUser ? <MentorPage /> : <Navigate to="/login" />} />
          </Routes>

          
          {isChatPage && authUser && (
            <div className="block md:hidden px-4">
              <RightPanel />
            </div>
          )}
        </main>

        
        {authUser && (
          <aside className="hidden lg:flex lg:flex-col lg:w-80 border-l border-gray-800 bg-gray-900">
            <RightPanel />
          </aside>
        )}
      </div>

      <Toaster />
    </AuthContextProvider>
  );
}

export default App;
