import React from 'react';
export const BOARD_SIZE = 6;
export const PLAYER_SELF = 'self';
export const PLAYER_OPPONENT = 'opponent';

export const ROLES = ['rock', 'paper', 'scissors'];

// โครงสร้างหมากแต่ละตัว
export function createPiece(id, role, owner, x = -1, y = -1) {
  return {
    id,
    role,
    owner,
    position: { x, y },
    isAlive: true,
    isRevealed: false,
  };
}