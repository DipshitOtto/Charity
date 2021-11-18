import React from 'react';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/pages/Home';
import ComingSoon from './components/pages/ComingSoon';

function App() {
  return (
    <>
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' exact element={<Home />} />
        <Route path='/templates' exact element={<ComingSoon />} />
        <Route path='/progress' exact element={<ComingSoon />} />
        <Route path='/statistics' exact element={<ComingSoon />} />
        <Route path='/signup' exact element={<ComingSoon />} />
      </Routes>
      <Footer />
    </Router>
    </>
  );
}

export default App;