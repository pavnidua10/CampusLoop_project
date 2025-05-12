import { Route, Routes, Navigate } from "react-router-dom";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { AuthContextProvider ,useAuth} from "./Context/AuthContext";
import { ChatContextProvider } from './Context/ChatContext';
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
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch(`${API_URL}/api/auth/me`,{
					credentials:"include",
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
	console.log("authUser in app.jsx:", authUser);  
	return (
		<AuthContextProvider authUser={authUser}>
			<ChatContextProvider>
			<div className="flex max-w-6xl mx-auto">
				{authUser && <Sidebar />}
				<div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
					<Routes>
						<Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
						<Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
						<Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
						<Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
						<Route path="/profile" element={authUser ? <Navigate to={`/profile/${authUser.username}`} /> : <Navigate to="/login"/>}/>
						<Route path="/profile/:username" element={authUser ?  <ProfilePage />: <Navigate to="/login" /> } />
						<Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
                        <Route path="/chat/:chatId" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />

                       <Route path="/search" element={<SearchPage />} />

						<Route path="/mentorship" element={<MentorshipPage />} />
						<Route path="/mentorship/chat/:id" element={<MentorshipChatInterface />} />
						<Route path="/mentor/:mentorId" element={authUser ? <MentorPage /> : <Navigate to="/login" />} />
					</Routes>
				</div>
				{authUser && <RightPanel />}
			</div>
			<Toaster />
			</ChatContextProvider>
		</AuthContextProvider>
	);
}

export default App;

