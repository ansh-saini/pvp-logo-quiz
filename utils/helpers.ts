import { ParsedRoom, Room } from "./models";

export type SafeKeys = "p1" | "p2";

export const parseRoomState = (rawState: Room): ParsedRoom => ({
  ...rawState,
  gameState: JSON.parse(rawState.gameState),
  p1: JSON.parse(rawState.p1),
  p2: JSON.parse(rawState.p2),
});

export const filterPlayerDataKeys = (room: ParsedRoom) => {
  return Object.keys(room).filter((key) => key.length === 2 && key[0] === "p");
};

export const getPlayerIndex = (room: ParsedRoom, playerId: string) => {
  return `p${room.players.indexOf(playerId) + 1}` as SafeKeys;
};
