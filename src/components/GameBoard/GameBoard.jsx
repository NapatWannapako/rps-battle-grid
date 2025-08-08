import React from 'react';
import { useGame } from '../../pages/Game/GameContext';
import { resolveBattle } from '../../features/game/gameLogic';
import './GameBoard.css';

export default function GameBoard() {
  const {
    pieces,
    setPieces,
    BOARD_SIZE,
    currentPlayer,
    setCurrentPlayer,
    selectedPiece,
    setSelectedPiece,
  } = useGame();

  const onSelectPiece = (piece) => {
    if (piece.owner !== currentPlayer) return;
    setSelectedPiece(piece);
  };
const onMove = (x, y) => {
  if (!selectedPiece) return;

  const { position, role, owner } = selectedPiece;
  const dx = x - position.x;
  const dy = y - position.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // ห้ามเดินออกนอกบอร์ด
  if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;

  // ตรวจเป้าหมาย
  const target = pieces.find(p => p.position.x === x && p.position.y === y);

  // ห้ามเดินทับตัวเอง
  if (target && target.owner === owner) return;

  // ฟังก์ชันช่วยเช็คว่ามีหมากขวางไหมในแนวตรง
  function isPathClearHorizontal(y, x1, x2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let cx = minX + 1; cx < maxX; cx++) {
      if (pieces.some(p => p.position.x === cx && p.position.y === y)) return false;
    }
    return true;
  }
  function isPathClearVertical(x, y1, y2) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let cy = minY + 1; cy < maxY; cy++) {
      if (pieces.some(p => p.position.x === x && p.position.y === cy)) return false;
    }
    return true;
  }

  // กติกาการเดินตาม role
  let validMove = false;

  if (role === 'paper') {
    // เดินแบบเรือ: เดินแนวตั้งหรือแนวนอนหลายช่อง
    if (dx === 0 && dy !== 0) {
      validMove = isPathClearVertical(position.x, position.y, y);
    } else if (dy === 0 && dx !== 0) {
      validMove = isPathClearHorizontal(position.y, position.x, x);
    }
  } else if (role === 'scissors') {
    // เดินแบบม้า (knight): L-shape 2+1
    if (
      (absDx === 2 && absDy === 1) ||
      (absDx === 1 && absDy === 2)
    ) {
      validMove = true;
    }
  } else if (role === 'rock') {
    // เดินแบบเบี้ย: เดิน 1 ช่องตรงไปข้างหน้า (ฝั่ง self เดินขึ้น - ฝั่ง opponent เดินลง)
    if (dx === 0) {
      if (owner === 'self' && dy === -1) {
        validMove = true;
      } else if (owner === 'opponent' && dy === 1) {
        validMove = true;
      }
    }
  }

  if (!validMove) return;

  // เริ่ม move / battle logic เหมือนเดิม
  let newPieces = pieces.filter(p => p.id !== selectedPiece.id);
  if (target && target.owner !== owner) {
    const winner = resolveBattle(role, target.role);
    if (winner === 'attacker') {
      newPieces = newPieces.filter(p => p.id !== target.id);
      newPieces.push({ ...selectedPiece, position: { x, y }, isRevealed: true });
    } else if (winner === 'defender') {
      // attacker หายไป ไม่ต้องเพิ่ม
    } else {
      // draw: ลบทั้งคู่
      newPieces = newPieces.filter(p => p.id !== target.id);
    }
  } else {
    newPieces.push({ ...selectedPiece, position: { x, y } });
  }

  setPieces(newPieces);
  setSelectedPiece(null);
  setCurrentPlayer(currentPlayer === 'self' ? 'opponent' : 'self');
};

//   const onMove = (x, y) => {
//     if (!selectedPiece) return;

//     const dx = Math.abs(selectedPiece.position.x - x);
//     const dy = Math.abs(selectedPiece.position.y - y);
//     if (dx + dy !== 1) return; // เดินแค่ช่องติดกัน

//     const target = pieces.find(p => p.position.x === x && p.position.y === y);

//     if (target && target.owner === currentPlayer) return; // ห้ามเดินทับตัวเอง

//     let newPieces = pieces.filter(p => p.id !== selectedPiece.id);
//     let battleResolved = false;

//     if (target && target.owner !== currentPlayer) {
//       battleResolved = true;
//       const winner = resolveBattle(selectedPiece.role, target.role);
//       if (winner === 'attacker') {
//         newPieces = newPieces.filter(p => p.id !== target.id);
//         newPieces.push({ ...selectedPiece, position: { x, y }, isRevealed: true });
//       } else if (winner === 'defender') {
//         // attacker หายไป ไม่ต้องทำอะไร
//       } else {
//         newPieces = newPieces.filter(p => p.id !== target.id);
//       }
//     } else {
//       newPieces.push({ ...selectedPiece, position: { x, y } });
//     }

//     setPieces(newPieces);
//     setSelectedPiece(null);
//     setCurrentPlayer(currentPlayer === 'self' ? 'opponent' : 'self');
//   };

  return (
    <div className="gameboard-container">
      <p className="current-player">
        ผู้เล่น: {currentPlayer === 'self' ? 'คุณ' : 'ฝ่ายตรงข้าม'}
      </p>
      <div
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 50px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 50px)`,
        }}
      >
        {[...Array(BOARD_SIZE)].map((_, y) =>
          [...Array(BOARD_SIZE)].map((_, x) => {
            const piece = pieces.find(p => p.position.x === x && p.position.y === y);
            const isSelected =
              selectedPiece &&
              selectedPiece.position.x === x &&
              selectedPiece.position.y === y;
            const isPointer =
              (piece && piece.owner === currentPlayer) ||
              (!piece && selectedPiece);

            return (
              <div
                key={`${x}-${y}`}
                className={`board-cell
                  ${piece ? (piece.owner === 'self' ? 'self' : 'opponent') : ''}
                  ${isSelected ? 'selected' : ''}
                  ${isPointer ? 'pointer' : ''}
                `}
                onClick={() => {
                  if (piece && piece.owner === currentPlayer) {
                    onSelectPiece(piece);
                  } else {
                    onMove(x, y);
                  }
                }}
              >
                {piece
                  ? piece.owner === 'self' || piece.isRevealed
                    ? piece.role[0].toUpperCase()
                    : '❓'
                  : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
