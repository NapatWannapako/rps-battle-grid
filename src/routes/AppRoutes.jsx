import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home.jsx';
import About from '../pages/About/About.jsx';
import NotFound from '../pages/NotFound/NotFound.jsx';
import Game from '../pages/Game/Game.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
