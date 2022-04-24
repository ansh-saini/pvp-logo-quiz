import clsx from "clsx";
import React, { useState } from "react";
import { filterPlayerDataKeys, getPlayerIndex, SafeKeys } from "utils/helpers";
import { ParsedRoom } from "utils/models";
import styles from "./ClientScores.module.css";
type Props = { room: ParsedRoom; currentPlayer: string };

const ClientScores = ({ room, currentPlayer }: Props) => {
  const playerIndex = getPlayerIndex(room, currentPlayer);

  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep((p) => (p === 5 ? 1 : p + 1));
  };

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

      <ul className={styles.steps}>
        {[1, 2, 3, 4].map((i) => (
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
            <span className={styles["step__label"]}>Step {i}</span>
          </li>
        ))}
      </ul>

      <button onClick={nextStep}>Next Step</button>
    </div>
  );
};

export default ClientScores;
