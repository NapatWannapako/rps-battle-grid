import React from 'react';
import { useGame } from '../../pages/Game/GameContext';
import { PLAYER_SELF, PLAYER_OPPONENT } from '../../models/gameModel';
import './SetupBoard.css'; // import ไฟล์ css

export default function SetupBoard() {
  const {
    pieces,
    setPieces,
    BOARD_SIZE,
    setPhase,
    setupPlayerTurn,
    setSetupPlayerTurn,
  } = useGame();

  const unplacedPieces = pieces.filter(
    p => p.owner === setupPlayerTurn && p.position.x === -1
  );

  const placePiece = (x, y) => {
    const isPlayerSelf = setupPlayerTurn === PLAYER_SELF;

    if (unplacedPieces.length === 0) return;
    if (isPlayerSelf && y < BOARD_SIZE - 3) return;
    if (!isPlayerSelf && y >= 3) return;

    const pieceToPlace = unplacedPieces[0];
    const newPieces = pieces.map(p =>
      p.id === pieceToPlace.id ? { ...p, position: { x, y } } : p
    );
    setPieces(newPieces);
  };

  const onNext = () => {
    if (unplacedPieces.length === 0) {
      if (setupPlayerTurn === PLAYER_SELF) {
        setSetupPlayerTurn(PLAYER_OPPONENT);
      } else {
        setPhase('play');
      }
    } else {
      alert('ยังวางหมากไม่ครบ 6 ตัว');
    }
  };

  return (
    <>  <div className="setupboard-wrapper">

      <p>
        {setupPlayerTurn === PLAYER_SELF
          ? 'Player 1: วางหมากฝั่งล่าง (แถว 3 ล่างสุด)'
          : 'Player 2: วางหมากฝั่งบน (แถว 3 บนสุด)'}
      </p>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 50px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 50px)`,
        }}
      >
        {[...Array(BOARD_SIZE)].map((_, y) =>
          [...Array(BOARD_SIZE)].map((_, x) => {
            const occupiedPiece = pieces.find(
              p => p.position.x === x && p.position.y === y
            );

            // เลือก class สำหรับ background
            let cellBgClass = 'cell-default';
            if (setupPlayerTurn === PLAYER_SELF) {
              if (y >= BOARD_SIZE - 3) cellBgClass = 'cell-self-row';
            } else {
              if (y < 3) cellBgClass = 'cell-opponent-row';
            }

            const isInRange =
              setupPlayerTurn === PLAYER_SELF
                ? y >= BOARD_SIZE - 3
                : y < 3;

            return (
              <div
                key={`${x}-${y}`}
                className={`cell ${cellBgClass}`}
                style={{ cursor: isInRange && !occupiedPiece ? 'pointer' : 'default' }}
                onClick={() => {
                  if (isInRange && !occupiedPiece) placePiece(x, y);
                }}
              >
                {occupiedPiece && (
                  <div className="piece-text">
                    {occupiedPiece.role[0].toUpperCase()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <button className="button-next" onClick={onNext}>
        {setupPlayerTurn === PLAYER_SELF ? 'สลับให้ Player 2' : 'เริ่มเล่น'}
      </button>  </div>
    </>
  );
}
