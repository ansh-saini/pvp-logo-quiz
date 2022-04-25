import { Models, Query } from "appwrite";
import ClientScores from "components/ClientScores";
import Option from "components/Option";
import Result from "components/Results";
import { appwrite, Collections } from "global/appwrite";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "styles/Room.module.css";
import { API, postData } from "utils/api";
import { getPlayerIndex, parseRoomState } from "utils/helpers";
import { ParsedRoom, Room as RoomType } from "utils/models";

type Props = {};

type Account = Models.User<Models.Preferences>;

const Room = (props: Props) => {
  const router = useRouter();
  const { code } = router.query;

  const [room, setRoom] = useState<ParsedRoom | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (!room || !account) return;

    const playerIndex = getPlayerIndex(room, account.$id);
    const questions = Object.keys(room.gameState);
    const responses = room[playerIndex];

    if (responses && Object.keys(responses).length === questions.length) {
      console.log("Game Over");
      setGameOver(true);
    }
  }, [room, account]);

  useEffect(() => {
    let unSubscribe = () => {};

    const joinRoom = async (account: Account) => {
      if (!code || !account) return;

      return postData(`/api/joinRoom/${code}`, {
        userId: account.$id,
      });
    };

    const getAccount = () => {
      return new Promise<Account>(async (resolve) => {
        const res = await API.account.get();
        if (res.isOK) {
          setAccount(res.data);
          resolve(res.data);
        } else {
          router.push("/auth");
        }
      });
    };

    const getRoom = async (account: Account) => {
      if (!code || !account) return;
      console.log("Get Room called");

      try {
        const res = await appwrite.database.listDocuments<RoomType>(
          Collections.Room,
          [Query.equal("code", code)]
        );
        const room = res.documents[0];
        if (!room) {
          console.error("Room not found");

          joinRoom(account)
            .then(() => getRoom(account))
            .catch(console.error);
          return;
        }

        setRoom(parseRoomState(room));

        unSubscribe = onGameStateChange(room.$id);
      } catch (e: any) {
        console.log(e, "ASD");
        if (e.response?.data) {
          console.log(e.response);
        }
      }
    };

    if (router.isReady && code) {
      getAccount().then(getRoom);
    }

    return () => {
      unSubscribe();
    };
  }, [code, router]);

  const onGameStateChange = (roomId: string) => {
    const slug = `collections.${Collections.Room}.documents.${roomId}`;
    return appwrite.subscribe<RoomType>(slug, (response) => {
      // console.log("Detected game state change, re-rendering", response);
      setRoom(parseRoomState(response.payload));
    });
  };

  if (!room || !account) return <h1>Loading</h1>;

  const playerIndex = getPlayerIndex(room, account.$id);

  const questions = Object.entries(room.gameState);
  const responses = room[playerIndex];

  const currentQuestion = questions.find(([questionId]) => {
    return !responses?.[questionId];
  });

  if (gameOver && !currentQuestion) {
    return (
      <>
        <Head>
          <title>Results | {room.code}</title>
        </Head>

        <Result roomId={room.$id} />
      </>
    );
  }

  if (!currentQuestion) {
    return (
      <>
        <Head>
          <title>Room | {room.code}</title>
        </Head>

        <h1>Could not fetch questions. Sry.</h1>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Room | {room.code}</title>
      </Head>
      {/* <TimeBar /> */}

      <div className={styles.container}>
        <h1 style={{ marginBottom: 48 }}>Room Code: {room.code}</h1>

        <div className={styles.gameArea}>
          <div>
            <ClientScores
              room={room}
              playerId={account.$id}
              currentQuestionId={currentQuestion[0]}
              isSelf
            />
          </div>
          {currentQuestion ? (
            <div className={styles.question}>
              {(() => {
                const [questionId, question] = currentQuestion;

                return (
                  <>
                    <img src={question.image} alt="" width="80px" height={80} />
                    <div className={styles.options}>
                      {question.options.map((option) => {
                        const response = responses?.[questionId];

                        return (
                          <Option
                            userId={account.$id}
                            roomId={room.$id}
                            questionId={questionId}
                            option={option}
                            isMarked={response?.response === option}
                            key={`${questionId}-${option}`}
                          />
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <h3>Loading Question</h3>
          )}

          {room.players
            .filter((id) => id !== account.$id)
            .map((playerId) => (
              <div key={playerId}>
                <ClientScores
                  room={room}
                  playerId={playerId}
                  currentQuestionId={currentQuestion[0]}
                />
              </div>
            ))}

          {/* {questions.map(([questionId, question]) => (
            <div key={questionId}>
              <img src={question.image} alt="" width="80px" height={80} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {question.options.map((option) => {
                  const response = responses?.[questionId];

                  return (
                    <button
                      key={option}
                      onClick={() => markAnswer(questionId, option)}
                      style={
                        response?.response === option
                          ? { border: "2px solid purple" }
                          : {}
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))} */}
        </div>
      </div>
    </>
  );
};

export default Room;
