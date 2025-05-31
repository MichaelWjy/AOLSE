import './App.css';
import React from 'react';
import HomePage from './Component/JSX/homePage';
import Login  from './Component/JSX/Login';
import Register from './Component/JSX/CreateAccount';
import ProtectedRoute from "./Component/protectedRoute";
import Account from './Component/JSX/AccountPage'
import Forgot from './Component/JSX/ForgotPass'
import Reset from './Component/JSX/ResetPass'
import CustomerList from './Component/JSX/customerList';
import CustomerProfile from './Component/JSX/customerProfile';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useParams,HashRouter as Router, Routes, Route } from "react-router-dom";
import CompanyList from './Component/JSX/companyList';
import ChatRoom from './Component/JSX/ChatRoom';

function App() {
  const ChatRoomWrapper = () => {
    const { receiverId } = useParams();
    const userId = localStorage.getItem("userID");
    
    return <ChatRoom userId={userId} receiverId={receiverId} />;
  };
  return (
  <Router>
      <Routes>
        <Route path="/chat/:userId/:receiverId" element={<ChatRoomWrapper />} />
        <Route path="/customer/:id" element={<CustomerProfile />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/customer" element={<CustomerList/>} />
        <Route path="/company" element={<CompanyList/>} />
        <Route path='/' element={<Login />} />
        <Route path='/forgot' element={<Forgot />}/>
        <Route path='/register' element={<Register />}/>
        <Route path='/home' element={<HomePage />} />
        <Route path="/reset-password/:token" element={<Reset />} />
    </Routes>
  </Router>
  );
}

export default App;
