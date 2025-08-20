import React, { useState } from "react";
import { useGame } from "../../pages/Game/GameContext";
import { PLAYER_SELF, PLAYER_OPPONENT } from "../../models/gameModel";
import "./SetupBoard.css";

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
    (p) => p.owner === setupPlayerTurn && p.position.x === -1
  );
  const [selectedUnplacedPiece, setSelectedUnplacedPiece] = useState(null);

  // Popup ให้ Player 2 กดยืนยันก่อนเริ่มวาง
  const [showP2Confirm, setShowP2Confirm] = useState(false);

  const placePiece = (x, y) => {
    if (!selectedUnplacedPiece) {
      alert("กรุณาเลือกตัวหมากก่อนวาง");
      return;
    }

    const isPlayerSelf = setupPlayerTurn === PLAYER_SELF;

    if (isPlayerSelf && y < BOARD_SIZE - 3) return;
    if (!isPlayerSelf && y >= 3) return;

    const newPieces = pieces.map((p) =>
      p.id === selectedUnplacedPiece.id ? { ...p, position: { x, y } } : p
    );
    setPieces(newPieces);
    setSelectedUnplacedPiece(null);
  };

  const removePiece = (x, y) => {
    const pieceToRemove = pieces.find(
      (p) =>
        p.position.x === x && p.position.y === y && p.owner === setupPlayerTurn
    );
    if (!pieceToRemove) return;

    const newPieces = pieces.map((p) =>
      p.id === pieceToRemove.id ? { ...p, position: { x: -1, y: -1 } } : p
    );
    setPieces(newPieces);
  };

  const onNext = () => {
    if (unplacedPieces.length === 0) {
      if (setupPlayerTurn === PLAYER_SELF) {
        // เปิด popup ให้ Player 2 ยืนยัน ก่อนสลับตาวาง
        setShowP2Confirm(true);
      } else {
        // Player 2 วางเสร็จ เริ่มเล่นได้เลย
        setShowP2Confirm(true);
      }
    } else {
      alert("ยังวางหมากไม่ครบ 6 ตัว");
    }
  };

  // ระหว่าง popup ขึ้น ให้ซ่อนหมาก Player 1
  const shouldHideAllPieces = showP2Confirm;

  return (
    <>
      <div className="setupboard-wrapper">
        <p>
          {setupPlayerTurn === PLAYER_SELF ? "วางหมากในพื้นที่ของคุณ" : "วางหมากในพื้นที่ของคุณ"}
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
                (p) => p.position.x === x && p.position.y === y
              );

              // เลือก background ตามฝั่งวาง
              let cellBgClass = "cell-default";
              if (setupPlayerTurn === PLAYER_SELF) {
                if (y >= BOARD_SIZE - 3) cellBgClass = "cell-self-row";
              } else {
                if (y < 3) cellBgClass = "cell-opponent-row";
              }

              const isInRange =
                setupPlayerTurn === PLAYER_SELF ? y >= BOARD_SIZE - 3 : y < 3;

              // ตัดสินใจว่าจะโชว์ชิ้นหรือซ่อน
              let pieceNode = null;
              if (occupiedPiece) {
                const isOwnerTurn = occupiedPiece.owner === setupPlayerTurn;
                let shouldHide = !isOwnerTurn; // ปกติ: ซ่อนอีกฝั่ง

                // ถ้า popup โชว์อยู่ → ซ่อนทุกหมาก
                if (shouldHideAllPieces) {
                  shouldHide = true;
                }
                pieceNode = shouldHide ? (
                  <div className="piece-icon unknown">?</div>
                ) : (
                  <div
                    className={`piece-icon role-${occupiedPiece.role.toLowerCase()}`}
                  ></div>
                );
              }

              return (
                <div
                  key={`${x}-${y}`}
                  className={`cell ${cellBgClass}`}
                  style={{
                    cursor: isInRange && !occupiedPiece ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (occupiedPiece) {
                      if (occupiedPiece.owner === setupPlayerTurn) {
                        removePiece(x, y);
                      }
                    } else {
                      if (isInRange) placePiece(x, y);
                    }
                  }}
                >
                  {pieceNode}
                </div>
              );
            })
          )}
        </div>

        <button className="button-next" onClick={onNext}>
          {setupPlayerTurn === PLAYER_SELF ? "สลับให้ Player 2" : "เริ่มเล่น"}
        </button>

        <div className="unplaced-pieces">
          {unplacedPieces.map((piece) => (
            <button
              key={piece.id}
              onClick={() => setSelectedUnplacedPiece(piece)}
              className={`piece-select-button ${selectedUnplacedPiece?.id === piece.id ? "selected" : ""
                }`}
            >
              <div
                className={`piece-icon role-${piece.role.toLowerCase()}`}
              ></div>
            </button>
          ))}
        </div>
      </div>

      {/* Popup ให้ Player 2 ยืนยันก่อนเริ่มวาง + ซ่อนหมาก Player 1 ระหว่าง popup */}
      {showP2Confirm && (
        <div className="game-winner-dialog">
          <div className="dialog-content">
            {setupPlayerTurn === PLAYER_SELF ? (
              <>
                <h2>ถึงคิว Player 2</h2>
                <p>กรุณากด “เริ่มวางหมาก” เพื่อเริ่มวางของคุณ</p>
                <button
                  onClick={() => {
                    setShowP2Confirm(false);
                    setSetupPlayerTurn(PLAYER_OPPONENT);
                  }}
                >
                  เริ่มวางหมาก
                </button>
              </>
            ) : (
              <>
                <h2>เริ่มเล่นเกม</h2>
                <p>เกมจะเริ่มจาก Player 1</p>
                <button
                  onClick={() => {
                    setShowP2Confirm(false);
                    setPhase("play");
                    // GameBoard จะจัดการ popup "เริ่มเดินหมาก" ต่อเอง
                  }}
                >
                  เริ่มเล่น
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
