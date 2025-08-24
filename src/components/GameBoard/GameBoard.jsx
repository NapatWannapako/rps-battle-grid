import React, { useState, useEffect } from "react";
import { useGame, initialPieces } from "../../pages/Game/GameContext";
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

  const [winner, setWinner] = React.useState(null);

  // Popup “เริ่มเดินหมาก” ให้ฝั่งถัดไปกดยืนยันก่อนเริ่ม
  const [showTurnGate, setShowTurnGate] = useState(false);
  const [gatePlayer, setGatePlayer] = useState(null); // 'self' | 'opponent'

  // Popup ผลการต่อสู้
  const [battleResult, setBattleResult] = useState(null); // 'win' | 'lose' | 'draw' | null

  // เก็บช่อง valid moves ของตัวที่เลือก
  const [validMoves, setValidMoves] = useState([]);

  const resetGame = () => {
    setPieces(initialPieces);
    setSelectedPiece(null);
    setCurrentPlayer(PLAYER_SELF);
    setPhase("setup");
    setSetupPlayerTurn(PLAYER_SELF);
    setWinner(null);
    setShowTurnGate(false);
    setGatePlayer(null);
    setBattleResult(null);
  };

  // ซ่อนชิ้นหมากถ้า:
  // - ไม่ใช่ของผู้เล่นปัจจุบัน
  // - หรือชิ้นนั้นยังไม่ถูกเผย isRevealed
  // - หรือกำลังแสดง popup (ป้องกันเห็นตัวหมากก่อนส่งตา)
  const isPieceVisible = (piece) => {
    if (showTurnGate || battleResult) return false; // ซ่อนทั้งหมดระหว่าง popup
    if (piece.owner === currentPlayer) return true;
    if (piece.isRevealed) return true;
    return false;
  };

  // ตัวช่วยเช็คทางแนวตรง (ปัจจุบันยังไม่ได้ใช้ใน logic เดินเฉพาะบางตัว)
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

  // หา valid moves ตาม role
  const getValidMoves = (piece) => {
    if (!piece) return [];
    const moves = [];
    const { position, role, owner } = piece;
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    if (role === "paper") {
      for (const [dx, dy] of directions) {
        let nx = position.x + dx;
        let ny = position.y + dy;
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (pieces.some((p) => p.position.x === nx && p.position.y === ny))
            break;
          moves.push({ x: nx, y: ny });
          nx += dx;
          ny += dy;
        }
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
      const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dx, dy] of directions) {
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
    }

    return moves;
  };

  useEffect(() => {
    setValidMoves(getValidMoves(selectedPiece));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPiece, pieces]);

  const onSelectPiece = (piece) => {
    if (showTurnGate || battleResult) return; // ห้ามทำอะไรระหว่าง popup
    if (piece.owner !== currentPlayer) return;
    setSelectedPiece(piece);
  };

  const checkWinner = (ps) => {
    const selfPieces = ps.filter((p) => p.owner === "self");
    const opponentPieces = ps.filter((p) => p.owner === "opponent");

    if (selfPieces.length === 0 && opponentPieces.length === 0) {
      return "draw";
    } else if (selfPieces.length === 0) {
      return "opponent";
    } else if (opponentPieces.length === 0) {
      return "self";
    }

    // 🔥 กรณีพิเศษ: เหลือกันคนละ 1 ตัว → ตัดสินทันที
    if (selfPieces.length === 1 && opponentPieces.length === 1) {
      const selfRole = selfPieces[0].role;
      const oppRole = opponentPieces[0].role;
      if (selfRole === oppRole) return "draw";
      if (
        (selfRole === "rock" && oppRole === "scissors") ||
        (selfRole === "scissors" && oppRole === "paper") ||
        (selfRole === "paper" && oppRole === "rock")
      ) {
        return "self";
      } else {
        return "opponent";
      }
    }

    return null;
  };


  const onMove = (x, y) => {
    if (showTurnGate || battleResult) return; // ระหว่าง popup ห้ามเดิน
    if (!selectedPiece) return;

    const { position, role, owner } = selectedPiece;

    // ต้องอยู่ใน validMoves
    if (!validMoves.some((m) => m.x === x && m.y === y)) return;

    const target = pieces.find((p) => p.position.x === x && p.position.y === y);

    // ห้ามเดินทับตัวเอง
    if (target && target.owner === owner) return;

    let newPieces = pieces.filter((p) => p.id !== selectedPiece.id);
    let thisBattleResult = null; // 'win' | 'lose' | 'draw' | null

    if (target && target.owner !== owner) {
      const rb = resolveBattle(role, target.role);
      if (rb === "attacker") {
        newPieces = newPieces.filter((p) => p.id !== target.id);
        newPieces.push({
          ...selectedPiece,
          position: { x, y },
          isRevealed: true,
        });
        thisBattleResult = "win";
      } else if (rb === "defender") {
        // attacker หายไป
        thisBattleResult = "lose";
      } else {
        // draw: ลบทั้งคู่
        newPieces = newPieces.filter((p) => p.id !== target.id);
        thisBattleResult = "draw";
      }
    } else {
      newPieces.push({ ...selectedPiece, position: { x, y } });
    }

    setPieces(newPieces);
    setSelectedPiece(null);

    const gameWinner = checkWinner(newPieces);
    if (gameWinner) {
      setWinner(gameWinner);
      return;
    }

    const nextPlayer = currentPlayer === "self" ? "opponent" : "self";

    // ถ้ามีการต่อสู้ ให้แสดงผลการต่อสู้ก่อน
    if (thisBattleResult) {
      setBattleResult(thisBattleResult);
      // หลังจากผู้ใช้กดตกลงในผลการต่อสู้ ค่อยเปิด gate ของเทิร์นถัดไป
      // (ดูในปุ่มของ popup ด้านล่าง)
    } else {
      // ไม่มีการต่อสู้ เปิด popup gate ให้ฝั่งถัดไปกดยืนยันเริ่ม
      setGatePlayer(nextPlayer);
      setShowTurnGate(true);
    }
  };

  const renderPieceIcon = (piece) => {
    if (!isPieceVisible(piece)) {
      return <div className="piece-icon unknown">?</div>;
    }

    return (
      <div className={`piece-icon role-${piece.role} owner-${piece.owner}`}>
        {/* icon ถูกวาดด้วย CSS */}
      </div>
    );
  };

  return (
    <div className="gameboard-container">
      <p className="current-player">
        ผู้เล่นที่กำลังเดิน: {currentPlayer === "self" ? "Player 1" : "Player 2"}
      </p>

      {/* ป้าย Player 2 ด้านบน */}
      <div className="player-label top-label">Player 2</div>

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
                ${isSelected ? "selected" : ""}
                ${canMoveHere ? "can-move" : ""}
                ${isPointer ? "pointer" : ""}
              `}
                onClick={() => {
                  if (showTurnGate || battleResult) return;
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

      {/* ป้าย Player 1 ด้านล่าง */}
      <div className="player-label bottom-label">Player 1</div>

      {/* Winner / Popup อื่น ๆ ด้านล่างเหมือนเดิม */}
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

      {battleResult && (
        <div className="game-winner-dialog">
          <div className="dialog-content">
            <h2>
              {battleResult === "win"
                ? "คุณชนะการต่อสู้!"
                : battleResult === "lose"
                  ? "คุณแพ้การต่อสู้!"
                  : "การต่อสู้เสมอ"}
            </h2>
            <button
              onClick={() => {
                setBattleResult(null);
                const nextPlayer =
                  currentPlayer === "self" ? "opponent" : "self";
                setGatePlayer(nextPlayer);
                setShowTurnGate(true);
              }}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {showTurnGate && (
        <div className="game-winner-dialog">
          <div className="dialog-content">
            <h2>เริ่มเดินหมาก</h2>
            <p>ถึงคิว {gatePlayer === "self" ? "Player 1" : "Player 2"}</p>
            <button
              onClick={() => {
                setCurrentPlayer(gatePlayer);
                setShowTurnGate(false);
                setGatePlayer(null);
              }}
            >
              เริ่มเทิร์น
            </button>
          </div>
        </div>
      )}
    </div>
  );

}
