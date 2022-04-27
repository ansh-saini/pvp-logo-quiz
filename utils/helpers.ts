import { ParsedRoom, Room } from "./models";

export type SafeKeys = "p1" | "p2";

export const parseRoomState = ({
  gameState,
  p1,
  p2,
  ...rawState
}: Room): ParsedRoom => ({
  ...rawState,
  gameState: gameState ? JSON.parse(gameState) : gameState,
  p1: p1 ? JSON.parse(p1) : p1,
  p2: p2 ? JSON.parse(p2) : p2,
});

export const filterPlayerDataKeys = (room: ParsedRoom) => {
  return Object.keys(room).filter(
    (key) => key.length === 2 && key[0] === "p"
  ) as SafeKeys[];
};

export const getPlayerIndex = (room: ParsedRoom, playerId: string) => {
  return `p${room.players.indexOf(playerId) + 1}` as SafeKeys;
};
