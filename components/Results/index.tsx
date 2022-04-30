import PageLayout from "components/PageLayout";
import Button from "components/shared/Button";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ParsedRoom, Players } from "utils/models";
import styles from "./Result.module.css";

type Props = { room: ParsedRoom; playerNames: Players };

type Result = {
  player: string;
  correct: number;
  totalAnswered: number;
  totalTime: number;
  score: number;
};

const Result = ({ room, playerNames }: Props) => {
  const { push } = useRouter();
  const [result, setResult] = useState<Result[] | null>(null);

  const winner = result ? result[0] : null;

  useEffect(() => {
    fetch(`/api/result/?roomId=${room.$id}`)
      .then((res) => res.json())
      .then((res) => setResult(res.data));
  }, []);

  if (!result) return null;

  return (
    <PageLayout>
      <Head>
        <title>Results | {room.code}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          {winner && (
            <h1>
              Winner is:{" "}
              <span className={styles.rotateColorsAnimation}>
                {playerNames[winner.player]}
              </span>
            </h1>
          )}

          <h1>Stats</h1>
          <div className={styles.stats}>
            {result.map((d) => (
              <div key={d.player}>
                <p>
                  Player: <span>{playerNames[d.player]}</span>
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

        <Button
          onClick={() => {
            push("/");
          }}
        >
          Play Again
        </Button>
      </div>
    </PageLayout>
  );
};

export default Result;
