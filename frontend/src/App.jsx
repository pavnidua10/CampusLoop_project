import {Route,Routes,Navigate} from "react-router-dom"
import HomePage from "./pages/home/homePage"
import SignUpPage from "./pages/auth/signup/signUpPage"
import LoginPage from "./pages/auth/login/loginPage"
import Sidebar from "./components/common/Sidebar"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import LoadingSpinner from "./components/common/LoadingSpinner"

import {Toaster} from 'react-hot-toast';
import { useQuery } from "@tanstack/react-query"
function App() {
  const {data:authUser,isLoading}=useQuery({
    queryKey:['authUser'], // we can refer to this query key later 
    queryFn:async()=>{
      try{
        const res=await fetch("/api/auth/me");
        const data=await res.json();
        if(data.error) return null;
        if(!res.ok){
          throw new Error(data.error || "something went wrong")
        }
        console.log("authUser is here",data);
        return data;
      }catch(error){
        throw new Error(error)
      }
    },
    retry:false,
  });
  if(isLoading){
    return(
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg'></LoadingSpinner>
      </div>
    )
  }

  return (
    <>
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar></Sidebar>}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
				<Route path='/signup' element={!authUser?<SignUpPage />:<Navigate to="/"/>} />
				<Route path='/login' element={!authUser?<LoginPage />:<Navigate to="/"/>} />
        <Route path='/notifications' element={authUser?<NotificationPage/>:<Navigate to="/login"/>} />
        <Route path='/profile/:username' element={authUser?<ProfilePage />: <Navigate to="/login"/>} />
			</Routes>
      {authUser && <RightPanel></RightPanel>}
      <Toaster></Toaster>
		</div>
    </>
  )
}

export default App
