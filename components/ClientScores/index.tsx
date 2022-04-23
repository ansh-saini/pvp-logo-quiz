import React from "react";
import { filterPlayerDataKeys } from "utils/helpers";
import { ParsedRoom } from "utils/models";

type Props = { room: ParsedRoom; currentPlayer: string };

type SafeKeys = "p1" | "p2";

const ClientScores = ({ room, currentPlayer }: Props) => {
  const playerIndex = `p${room.players.indexOf(currentPlayer) + 1}` as SafeKeys;

  return (
    <div>
      <h1>ClientScores</h1>

      {filterPlayerDataKeys(room).map((player) => {
        const data = room[player as SafeKeys];
        if (!data) return null;

        const answered = Object.keys(data).length;
        const correct = Object.values(data).filter(
          ({ isCorrect }) => isCorrect
        ).length;

        return (
          <p key={player}>
            {player === playerIndex ? "You" : player} Answered: {answered} (
            {correct} Correct)
          </p>
        );
      })}
    </div>
  );
};

export default ClientScores;
