import { Query } from "appwrite";
import ClientScores from "components/ClientScores";
import Loading from "components/Loading";
import Lobby from "components/Lobby";
import Option from "components/Option";
import PageLayout from "components/PageLayout";
import Result from "components/Results";
import TimeBar from "components/TimeBar";
import { appwrite, Collections } from "global/appwrite";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import styles from "styles/Room.module.css";
import { API, getData, postData } from "utils/api";
import { JWT_KEY } from "utils/config";
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

  const imageRef = useRef<HTMLImageElement>(null);

  const [loading, setLoading] = useState(false);

  const [room, setRoom] = useState<ParsedRoom | null>(null);
  const [invalidRoom, setInvalidRoom] = useState<boolean>(false);
  const [gameOverForSelf, setGameOverForSelf] = useState<boolean>(false);

  const [players, setPlayers] = useState<Players>({});
  const [account, setAccount] = useState<Account | null>(null);

  const [startTimer, setStartTimer] = useState(0);

  const generateAuth = () =>
    appwrite.account.createJWT().then((res) => {
      localStorage.setItem(JWT_KEY, res.jwt);
      return res.jwt;
    });

  useEffect(() => {
    if (!room || !account) return;

    const playerIndex = getPlayerIndex(room, account.$id);
    const questions = Object.keys(room.gameState);
    const responses = room[playerIndex];

    if (responses && Object.keys(responses).length === questions.length) {
      setGameOverForSelf(true);
    }
  }, [room, account]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (startTimer > 0) setStartTimer((p) => p - 1);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [startTimer]);

  useEffect(() => {
    let unSubscribe = () => {};

    const joinRoom = async (account: Account) => {
      if (!code || !account) return;

      const jwt = localStorage.getItem(JWT_KEY);

      return postData(
        `/api/joinRoom/${code}`,
        {
          userId: account.$id,
        },
        jwt
          ? {
              jwt,
            }
          : undefined
      );
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
              if (res.authExpired) {
                generateAuth().then(() => location.reload());
                return;
              }

              if (res.roomNotFound) {
                setInvalidRoom(true);
                return;
              }
              if (res.roomFull) {
                return;
              }

              getRoom(account);
              if (res.started) {
                setStartTimer(3);
              }
              if (res.joined) {
                return;
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
        console.error(e);
        if (e.response?.data) {
          console.error(e.response);
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

  useEffect(() => {
    if (!localStorage.getItem(JWT_KEY)) {
      generateAuth();
    }
  }, []);

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

        const playerData = parsedRoom[playerIndex];
        if (playerData && prevState)
          if (
            Object.keys(playerData).length <
            Object.keys(prevState[playerIndex] || {}).length
          ) {
            return { ...parsedRoom, [playerIndex]: prevState[playerIndex] };
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

  if (!room || !account) return <Loading />;

  const playerIndex = getPlayerIndex(room, account.$id);

  const questions = Object.entries(room.gameState);
  const responses = room[playerIndex];

  const currentQuestion = questions.find(([questionId]) => {
    return !responses?.[questionId];
  });

  const updateLocalState = (data: {
    response: string;
    questionId: string;
    isCorrect: null;
    timeStamp: number;
    isSkipped: boolean;
  }) => {
    setRoom((prevState) => {
      if (!currentQuestion || !prevState) return prevState;

      return {
        ...prevState,
        [playerIndex]: {
          ...prevState[playerIndex],
          [data.questionId]: {
            ...data,
          },
        },
      };
    });
  };

  if (startTimer) {
    return (
      <Loading>
        <Head>
          <title>
            Starting in {startTimer}... | {room.code}
          </title>
        </Head>

        <h1>All players have joined.</h1>
        <h1>
          Starting in <span className={styles.timer}>{startTimer}</span>
        </h1>
      </Loading>
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
      <Loading>
        <h1>Calculating Results</h1>
        <h1>Waiting for other players to finish the game</h1>
      </Loading>
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

  const [questionId] = currentQuestion;

  const markAnswer = (
    option: string,
    updatedJwt?: string,
    isSkipped = false
  ) => {
    const data = {
      response: option,
      questionId,
      isCorrect: null,
      timeStamp: Date.now(),
      isSkipped,
    };
    updateLocalState(data);

    setLoading(true);
    postData(
      "/api/saveResponse",
      {
        roomId: room.$id,
        questionId: data.questionId,
        response: data.response,
        timeStamp: data.timeStamp,
      },
      updatedJwt
        ? {
            jwt: updatedJwt,
          }
        : undefined
    ).then((res) => {
      if (res.authExpired) {
        // Refresh auth and retry request
        generateAuth().then((jwt) => markAnswer(option, jwt));
        return;
      }
      setLoading(false);
    });
  };

  const onTimerEnd = () => {
    markAnswer("", undefined, true);
  };

  const retryLoadingImage = () => {
    setLoading(true);
    const el = imageRef.current;
    if (el) {
      const originalSrc = el.src;
      el.src = "";
      setTimeout(() => {
        console.log("Re-setting img src");
        el.src = originalSrc;
        setLoading(false);
      }, 100);
    }
  };

  return (
    <PageLayout classes={{ content: styles.pageLayoutContent }}>
      <Head>
        <title>Room | {room.code}</title>
      </Head>

      {loading ? (
        // To prevent layout shifting
        <div style={{ height: 28 }}></div>
      ) : (
        <TimeBar questionId={questionId} onEnd={onTimerEnd} />
      )}

      <div className={styles.container}>
        <div className={styles.gameArea}>
          <div className={styles.hideOnMobile}>
            <ClientScores
              playerNames={players}
              room={room}
              playerId={account.$id}
              currentQuestionId={questionId}
              isSelf
            />
          </div>
          {currentQuestion ? (
            <div className={styles.question}>
              {(() => {
                const [questionId, question] = currentQuestion;

                if (loading) {
                  return (
                    <>
                      <div className={styles.imgContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif"
                          alt=""
                          style={{
                            maxWidth: 250,
                            maxHeight: 250,
                          }}
                          width="auto"
                          height="auto"
                        />
                      </div>
                      <div className={styles.options}>
                        {question.options.map((option) => {
                          return (
                            <Option
                              disabled={loading}
                              markAnswer={markAnswer}
                              option="Loading"
                              key={`${questionId}-${option}`}
                            />
                          );
                        })}
                      </div>
                    </>
                  );
                }
                return (
                  <>
                    <div className={styles.imgContainer}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={imageRef}
                        onError={retryLoadingImage}
                        src={question.image}
                        alt=""
                        style={{
                          maxWidth: 250,
                          maxHeight: 250,
                        }}
                        width="auto"
                        height="auto"
                      />
                    </div>
                    <div className={styles.options}>
                      {question.options.map((option) => {
                        return (
                          <Option
                            disabled={loading}
                            markAnswer={markAnswer}
                            option={option}
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

          <div className={styles.hideOnMobile}>
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
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Room;
