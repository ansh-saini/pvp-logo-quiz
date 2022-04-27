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
        <div className={styles.stats}>
          {result.map((d) => (
            <div key={d.player}>
              <p>
                Player: <span>{d.player}</span>
              </p>
              <p>
                Score: <span>{Math.round(d.score)}</span>
              </p>
              <p>
                Correct Answers:{" "}
                <span>
                  {d.correct}/{d.totalAnswered}
                </span>
              </p>
              <p>
                Time Taken:{" "}
                <span>{Math.round(d.totalTime / 1000)} seconds</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;
