import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "./Result.module.css";

type Props = { roomId: string };

type Result = {
  player: string;
  correct: number;
  totalAnswered: number;
  totalTime: number;
  score: number;
};

const Result = ({ roomId }: Props) => {
  const router = useRouter();

  const [result, setResult] = useState<Result[] | null>(null);

  const winner = result ? result[0] : null;

  useEffect(() => {
    fetch(`/api/result/?roomId=${roomId}`)
      .then((res) => res.json())
      .then((res) => setResult(res.data));
  }, []);

  if (!result) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {winner && <h1>Winner is: {winner.player}</h1>}

        <h1>Stats</h1>
        {/* <pre>{JSON.stringify(result, null, 2)}</pre> */}
        <div className={styles.stats}>
          {result.map((d) => (
            <div key={d.player}>
              <p>Player: {d.player}</p>
              <p>Score: {d.score}</p>
              <p>
                Correct Answers: {d.correct}/{d.totalAnswered}
              </p>
              <p>Time Taken: {d.totalTime}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;
