import React from 'react';
import { GameProvider, useGame } from './GameContext';
import SetupBoard from '../../components/SetupBoard/SetupBoard';
import GameBoard from '../../components/GameBoard/GameBoard';
import './Game.css'; // import css ที่สร้างใหม่

function GameInner() {
  const { phase } = useGame();
  return phase === 'setup' ? <SetupBoard /> : <GameBoard />;
}

export default function Game() {
  return (
    <GameProvider>
      <div className="game-container">
        <h1 className="game-title">Roshambo Chess</h1>
        <GameInner />
      </div>
    </GameProvider>
  );
}
