import clsx from "clsx";
import React from "react";
import { getPlayerIndex } from "utils/helpers";
import { ParsedRoom } from "utils/models";
import styles from "./ClientScores.module.css";

type Props = {
  room: ParsedRoom;
  playerId: string;
  isSelf?: boolean;
  currentQuestionId: string;
};

const ClientScores = ({
  room,
  playerId: playerId,
  currentQuestionId,
  isSelf = false,
}: Props) => {
  const playerIndex = getPlayerIndex(room, playerId);

  // console.log({ playerId, playerIndex });

  const questions = Object.keys(room.gameState);

  const playerData = room[playerIndex] || {};
  // const step = Math.max(Object.keys(playerData).indexOf(currentQuestionId), 0);
  const step = Object.keys(playerData).length;

  // const answered = Object.keys(playerData).length;
  // const correct = Object.values(playerData).filter(
  //   ({ isCorrect }) => isCorrect
  // ).length;

  return (
    <div className={styles.container}>
      {/* {filterPlayerDataKeys(room).map((player) => {
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
      })} */}

      <h1>{isSelf ? "You" : playerId}</h1>

      <ul className={styles.steps}>
        {questions.map((_, i) => (
          <li
            className={clsx(styles.step, {
              [styles["step--active"]]: step === i,
              [styles["step--complete"]]: step > i,
              [styles["step--incomplete"]]: step < i,
              [styles["step--inactive"]]: step !== i,
            })}
            key={i}
          >
            <span className={styles["step__icon"]}></span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientScores;
