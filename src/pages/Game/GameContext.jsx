import React, { createContext, useContext, useState } from 'react';
import { createPiece, PLAYER_SELF, PLAYER_OPPONENT, BOARD_SIZE, ROLES } from '../../models/gameModel';

const GameContext = createContext(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('❌ useGame() must be used inside <GameProvider>.');
  }
  return context;
}

export const initialPieces = [];

for (let i = 0; i < 6; i++) {
  const role = ROLES[Math.floor(i / 2)];
  initialPieces.push(createPiece(`self_${i}`, role, PLAYER_SELF));
  initialPieces.push(createPiece(`opponent_${i}`, role, PLAYER_OPPONENT));
}
export function GameProvider({ children }) {


  const [pieces, setPieces] = useState(initialPieces);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_SELF);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [phase, setPhase] = useState('setup');

  // ✅ เพิ่มตรงนี้
  const [setupPlayerTurn, setSetupPlayerTurn] = useState(PLAYER_SELF);

  const value = {
    pieces,
    setPieces,
    currentPlayer,
    setCurrentPlayer,
    selectedPiece,
    setSelectedPiece,
    phase,
    setPhase,
    setupPlayerTurn,
    setSetupPlayerTurn,
    BOARD_SIZE,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
