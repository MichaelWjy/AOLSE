import logo from './logo.svg';
import './App.css';
import React from 'react';
import HomePage from './Component/homePage';
import Login  from './Component/Login';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
  <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
    </Routes>
  </Router>
  );
}

export default App;
