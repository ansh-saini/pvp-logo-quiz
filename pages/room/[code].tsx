import { Query } from "appwrite";
import ClientScores from "components/ClientScores";
import Lobby from "components/Lobby";
import Option from "components/Option";
import PageLayout from "components/PageLayout";
import Result from "components/Results";
import TimeBar from "components/TimeBar";
import { appwrite, Collections } from "global/appwrite";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "styles/Room.module.css";
import { API, getData, postData } from "utils/api";
import { getPlayerIndex, parseRoomState } from "utils/helpers";
import { Account, ParsedRoom, Players, Room as RoomType } from "utils/models";

const getPlayers = async (code: string, room: ParsedRoom) => {
  const res = await getData(`/api/players/${code}`);
  for (const [k, v] of Object.entries(res.data)) {
    const playerIndex = getPlayerIndex(room, k);
    res.data[playerIndex] = v;
  }
  return res.data;
};

const Room = () => {
  const router = useRouter();
  const { code } = router.query;

  const [room, setRoom] = useState<ParsedRoom | null>(null);
  const [invalidRoom, setInvalidRoom] = useState<boolean>(false);
  const [gameOverForSelf, setGameOverForSelf] = useState<boolean>(false);

  const [players, setPlayers] = useState<Players>({});
  const [account, setAccount] = useState<Account | null>(null);

  const [startTimer, setStartTimer] = useState(0);

  useEffect(() => {
    if (!room || !account) return;

    const playerIndex = getPlayerIndex(room, account.$id);
    const questions = Object.keys(room.gameState);
    const responses = room[playerIndex];

    if (responses && Object.keys(responses).length === questions.length) {
      console.log("Game Over");
      setGameOverForSelf(true);
    }
  }, [room, account]);

  useEffect(() => {
    setTimeout(() => {
      if (startTimer > 0) setStartTimer((p) => p - 1);
    }, 1000);
  }, [startTimer]);

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
            .then((res) => {
              if (res.roomNotFound) {
                setInvalidRoom(true);
                return;
              }
              if (res.joined) {
                setInvalidRoom(true);
                return;
              }
              if (res.roomFull) {
                setInvalidRoom(true);
                return;
              }
              getRoom(account);
              if (res.started) {
                setStartTimer(3);
              }
            })
            .catch(console.error);
          return;
        }

        const parsedRoom = parseRoomState(room);
        setPlayers(await getPlayers(parsedRoom.code, parsedRoom));
        setRoom(parsedRoom);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, router]);

  const updatePlayers = async (room: ParsedRoom) => {
    setPlayers(await getPlayers(room.code, room));
  };

  const onGameStateChange = (roomId: string) => {
    const slug = `collections.${Collections.Room}.documents.${roomId}`;
    return appwrite.subscribe<RoomType>(slug, (response) => {
      // console.log("Detected game state change, re-rendering", response);
      setRoom((prevState) => {
        if (
          prevState?.status === "lobby" &&
          response.payload.status === "started"
        ) {
          setStartTimer(3);
        }

        const parsedRoom = parseRoomState(response.payload);

        if (prevState?.players.length !== response.payload.players.length) {
          updatePlayers(parsedRoom);
        }

        return parsedRoom;
      });
    });
  };

  if (invalidRoom) {
    return (
      <PageLayout>
        <h1>Looks like this room does not exist.</h1>
        <h1>Check your room code.</h1>
      </PageLayout>
    );
  }

  if (!room || !account) return <h1>Loading</h1>;

  const playerIndex = getPlayerIndex(room, account.$id);

  const questions = Object.entries(room.gameState);
  const responses = room[playerIndex];

  const currentQuestion = questions.find(([questionId]) => {
    return !responses?.[questionId];
  });

  const onTimerEnd = () => {
    if (currentQuestion) {
      postData("/api/saveResponse", {
        roomId: room.$id,
        playerId: account.$id,
        questionId: currentQuestion[0],
        isSkipped: true,
        timeStamp: Date.now(),
      });
    }
  };

  if (startTimer) {
    return (
      <PageLayout>
        <Head>
          <title>
            Starting in {startTimer}... | {room.code}
          </title>
        </Head>

        <h1>All players have joined.</h1>
        <h1>
          Starting in <span className={styles.timer}>{startTimer}</span>
        </h1>
      </PageLayout>
    );
  }

  if (room.status === "lobby") {
    return <Lobby room={room} />;
  }

  if (gameOverForSelf && room.status === "completed") {
    return <Result room={room} playerNames={players} />;
  }

  if (gameOverForSelf) {
    return (
      <PageLayout>
        <h1>Calculating Results</h1>
        <h1>Waiting for other players to finish the game</h1>
      </PageLayout>
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
    <PageLayout>
      <Head>
        <title>Room | {room.code}</title>
      </Head>
      <TimeBar questionId={currentQuestion[0]} onEnd={onTimerEnd} />

      <div className={styles.container}>
        <div className={styles.gameArea}>
          <div>
            <ClientScores
              playerNames={players}
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
                    <div className={styles.imgContainer}>
                      <img src={question.image} alt="" width={80} height={80} />
                    </div>
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
                  playerNames={players}
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
    </PageLayout>
  );
};

export default Room;
