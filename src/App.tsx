import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { orderBy, sampleSize, cloneDeep, shuffle } from 'lodash';
// import logo from './logo.svg';
import Setup from './pages/setup'
import Alonable from './pages/alonable'
import Board from './pages/board'
import './App.css';

interface Player {
  name: string
  isAlonable: boolean
}

interface Court {
  red: string[]
  blue: string[]
}

interface Round {
  courts: Court[]
  rest: string[]
}

const MAX_PLAYER_PER_COURT = 4

enum Pages {
  PlayerSetup,
  AlonableSetup,
  Board
}

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="alonable" element={<Alonable />} />
        <Route path="board" element={<Board />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
