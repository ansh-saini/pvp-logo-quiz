import { ParsedRoom, Room } from "./models";

export const parseRoomState = (rawState: Room): ParsedRoom => ({
  ...rawState,
  gameState: JSON.parse(rawState.gameState),
  p1: JSON.parse(rawState.p1),
  p2: JSON.parse(rawState.p2),
});

export const filterPlayerDataKeys = (room: ParsedRoom) => {
  return Object.keys(room).filter((key) => key.length === 2 && key[0] === "p");
};
