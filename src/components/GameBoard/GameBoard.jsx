import React, { useState, useEffect } from "react";
import { useGame,initialPieces  } from "../../pages/Game/GameContext";
import { resolveBattle } from "../../features/game/gameLogic";
import "./GameBoard.css";
import { PLAYER_SELF, PLAYER_OPPONENT } from "../../models/gameModel";

export default function GameBoard() {
const {
  pieces,
  setPieces,
  BOARD_SIZE,
  currentPlayer,
  setCurrentPlayer,
  selectedPiece,
  setSelectedPiece,
  phase,
  setPhase,
  setupPlayerTurn,
  setSetupPlayerTurn,
} = useGame();

const resetGame = () => {
  setPieces(initialPieces);
  setSelectedPiece(null);
  setCurrentPlayer(PLAYER_SELF);
  setPhase('setup');
  setSetupPlayerTurn(PLAYER_SELF);
  setWinner(null);
};

  const [winner, setWinner] = React.useState(null);

  // เก็บช่อง valid moves ที่ piece ที่เลือกเดินไปได้
  const [validMoves, setValidMoves] = useState([]);

  // ฟังก์ชันช่วยเช็คว่ามีหมากขวางไหมในแนวตรง
  function isPathClearHorizontal(y, x1, x2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let cx = minX + 1; cx < maxX; cx++) {
      if (pieces.some((p) => p.position.x === cx && p.position.y === y))
        return false;
    }
    return true;
  }
  function isPathClearVertical(x, y1, y2) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let cy = minY + 1; cy < maxY; cy++) {
      if (pieces.some((p) => p.position.x === x && p.position.y === cy))
        return false;
    }
    return true;
  }

  // ฟังก์ชันหา valid moves ของ selectedPiece
  const getValidMoves = (piece) => {
    if (!piece) return [];
    const moves = [];
    const { position, role, owner } = piece;
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]; // 4 ทิศ

    if (role === "paper") {
      // เดินแบบเรือ (เดินตรงตามแถวหรือคอลัมน์หลายช่อง)
      // ลองเดินไปในแต่ละทิศทางจนเจอหมากหรือขอบบอร์ด
      for (const [dx, dy] of directions) {
        let nx = position.x + dx;
        let ny = position.y + dy;
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          // ถ้ามีหมากขวาง, หยุด
          if (pieces.some((p) => p.position.x === nx && p.position.y === ny))
            break;
          moves.push({ x: nx, y: ny });
          nx += dx;
          ny += dy;
        }
        // ถ้ามีหมากตรงปลายทางที่เป็นคู่ต่อสู้ ก็เดินไปโจมตีได้
        const lastX = nx;
        const lastY = ny;
        const target = pieces.find(
          (p) => p.position.x === lastX && p.position.y === lastY
        );
        if (target && target.owner !== owner) {
          moves.push({ x: lastX, y: lastY });
        }
      }
    } else if (role === "scissors") {
      // เดินแบบม้า (knight move)
      const knightMoves = [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ];
      for (const [dx, dy] of knightMoves) {
        const nx = position.x + dx;
        const ny = position.y + dy;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          const target = pieces.find(
            (p) => p.position.x === nx && p.position.y === ny
          );
          if (!target || target.owner !== owner) {
            moves.push({ x: nx, y: ny });
          }
        }
      }
    } else if (role === "rock") {
      // เดินแบบเบี้ย เดินหน้า 1 ช่อง
      let nx = position.x;
      let ny = owner === "self" ? position.y - 1 : position.y + 1;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        const target = pieces.find(
          (p) => p.position.x === nx && p.position.y === ny
        );
        if (!target || target.owner !== owner) {
          moves.push({ x: nx, y: ny });
        }
      }
    }

    return moves;
  };

  // อัพเดต validMoves ทุกครั้งที่ selectedPiece หรือ pieces เปลี่ยน
  useEffect(() => {
    setValidMoves(getValidMoves(selectedPiece));
  }, [selectedPiece, pieces]);

  const onSelectPiece = (piece) => {
    if (piece.owner !== currentPlayer) return;
    setSelectedPiece(piece);
  };
  const checkWinner = (pieces) => {
    const selfPieces = pieces.filter((p) => p.owner === "self");
    const opponentPieces = pieces.filter((p) => p.owner === "opponent");

    if (selfPieces.length === 0 && opponentPieces.length === 0) {
      return "draw"; // เสมอ
    } else if (selfPieces.length === 0) {
      return "opponent"; // ฝ่ายตรงข้ามชนะ
    } else if (opponentPieces.length === 0) {
      return "self"; // ผู้เล่นชนะ
    }
    return null; // ยังไม่มีใครชนะ
  };

  const onMove = (x, y) => {
    if (!selectedPiece) return;

    const { position, role, owner } = selectedPiece;
    const dx = x - position.x;
    const dy = y - position.y;

    // เช็คว่า (x,y) อยู่ใน validMoves
    if (!validMoves.some((m) => m.x === x && m.y === y)) return;

    const target = pieces.find((p) => p.position.x === x && p.position.y === y);

    // ห้ามเดินทับตัวเอง
    if (target && target.owner === owner) return;

    let newPieces = pieces.filter((p) => p.id !== selectedPiece.id);
    if (target && target.owner !== owner) {
      const winner = resolveBattle(role, target.role);
      if (winner === "attacker") {
        newPieces = newPieces.filter((p) => p.id !== target.id);
        newPieces.push({
          ...selectedPiece,
          position: { x, y },
          isRevealed: true,
        });
      } else if (winner === "defender") {
        // attacker หายไป ไม่ต้องเพิ่ม
      } else {
        // draw: ลบทั้งคู่
        newPieces = newPieces.filter((p) => p.id !== target.id);
      }
    } else {
      newPieces.push({ ...selectedPiece, position: { x, y } });
    }

    setPieces(newPieces);
    setSelectedPiece(null);
    const gameWinner = checkWinner(newPieces);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setCurrentPlayer(currentPlayer === "self" ? "opponent" : "self");
    }

    // setSelectedPiece(null);
    // setCurrentPlayer(currentPlayer === 'self' ? 'opponent' : 'self');
  };

  // ฟังก์ชันสร้างไอคอน piece
  const renderPieceIcon = (piece) => {
    if (piece.owner === "opponent" && !piece.isRevealed) {
      return <div className="piece-icon unknown">?</div>;
    }
    
    return (
      <div className={`piece-icon role-${piece.role} owner-${piece.owner}`}>
      </div>
    );
  };

  return (
    <div className="gameboard-container">
      <p className="current-player">
        ผู้เล่น: {currentPlayer === "self" ? "คุณ" : "ฝ่ายตรงข้าม"}
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
            const piece = pieces.find(
              (p) => p.position.x === x && p.position.y === y
            );
            const isSelected =
              selectedPiece &&
              selectedPiece.position.x === x &&
              selectedPiece.position.y === y;
            const canMoveHere = validMoves.some((m) => m.x === x && m.y === y);
            const isPointer =
              (piece && piece.owner === currentPlayer) ||
              (!piece && selectedPiece);

            return (
              <div
                key={`${x}-${y}`}
                className={`board-cell
                  ${piece ? (piece.owner === "self" ? "self" : "opponent") : ""}
                  ${isSelected ? "selected" : ""}
                  ${canMoveHere ? "can-move" : ""}
                  ${isPointer ? "pointer" : ""}
                `}
                onClick={() => {
                  if (piece && piece.owner === currentPlayer) {
                    onSelectPiece(piece);
                  } else {
                    onMove(x, y);
                  }
                }}
              >
                {piece && renderPieceIcon(piece)}
              </div>
            );
          })
        )}
      </div>
      {winner && (
  <div className="game-winner-dialog">
    <div className="dialog-content">
      <h2>
        {winner === "draw"
          ? "เกมเสมอ!"
          : winner === "self"
          ? "คุณชนะ!"
          : "ฝ่ายตรงข้ามชนะ!"}
      </h2>
      <button onClick={resetGame}>เริ่มเกมใหม่</button>
    </div>
  </div>
)}

    </div>
  );
}