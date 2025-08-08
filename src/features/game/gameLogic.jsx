import React from "react";
// import ROLES from "/my-react16-app/src/models/gameModel"
import { ROLES } from "../../models/gameModel";
// src/features/game/gameLogic.js

export function resolveBattle(attackerRole, defenderRole) {
  if (attackerRole === defenderRole) return 'draw';
  if (
    (attackerRole === 'rock' && defenderRole === 'scissors') ||
    (attackerRole === 'scissors' && defenderRole === 'paper') ||
    (attackerRole === 'paper' && defenderRole === 'rock')
  ) return 'attacker';
  return 'defender';
}

// ฟังก์ชันตรวจสอบสถานะเกมว่าใครชนะหรือเสมอ
export function checkGameOver(pieces) {
  const selfPieces = pieces.filter(p => p.owner === 'self');
  const opponentPieces = pieces.filter(p => p.owner === 'opponent');

  const selfHasPieces = selfPieces.length > 0;
  const opponentHasPieces = opponentPieces.length > 0;

  if (!selfHasPieces && !opponentHasPieces) return 'draw';
  if (!selfHasPieces) return 'opponent';
  if (!opponentHasPieces) return 'self';

  return null; // เกมยังไม่จบ
}


export function isValidMove(selectedPiece, targetPos, pieces) {
  // ตัวอย่าง: เดินได้ช่องรอบ ๆ เท่านั้น (ข้างบน ล่าง ซ้าย ขวา)
  const dx = Math.abs(selectedPiece.position.x - targetPos.x);
  const dy = Math.abs(selectedPiece.position.y - targetPos.y);
  if (dx + dy !== 1) return false;

  // หลีกเลี่ยงเดินไปช่องที่ตัวเองครอบครอง
  const target = pieces.find(
    (p) =>
      p.position.x === targetPos.x &&
      p.position.y === targetPos.y &&
      p.owner === selectedPiece.owner
  );
  if (target) return false;

  return true;
}