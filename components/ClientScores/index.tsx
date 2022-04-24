import React from "react";
import { filterPlayerDataKeys, getPlayerIndex, SafeKeys } from "utils/helpers";
import { ParsedRoom } from "utils/models";

type Props = { room: ParsedRoom; currentPlayer: string };

const ClientScores = ({ room, currentPlayer }: Props) => {
  const playerIndex = getPlayerIndex(room, currentPlayer);

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
