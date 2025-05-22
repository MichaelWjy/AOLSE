import './App.css';
import React from 'react';
import HomePage from './Component/JSX/homePage';
import Login from './Component/JSX/Login';
import Register from './Component/JSX/CreateAccount';
import Forgot from './Component/JSX/ForgotPass'
import Reset from './Component/JSX/ResetPass'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/forgot' element={<Forgot />} />
        <Route path='/register' element={<Register />} />
        <Route path='/home' element={<HomePage />} />
        <Route path="/reset-password/:token" element={<Reset />} />
      </Routes>
    </Router>
  );
}

export default App;
