import { Models, Query } from "appwrite";
import { appwrite, Collections } from "global/appwrite";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { API } from "utils/api";
import { ParsedRoom, Room as RoomType } from "utils/models";

type Props = {};

const Room = (props: Props) => {
  const router = useRouter();
  const { code } = router.query;

  const [room, setRoom] = useState<ParsedRoom | null>(null);
  const [account, setAccount] =
    useState<Models.User<Models.Preferences> | null>(null);

  useEffect(() => {
    const getAccount = async () => {
      const res = await API.account.get();
      if (res.isOK) {
        setAccount(res.data);
      }
    };

    getAccount();
  }, []);

  useEffect(() => {
    let unsub = () => {};

    const getRoom = async () => {
      if (!code) return;

      const res = await appwrite.database.listDocuments<RoomType>(
        Collections.Room,
        [Query.equal("code", code)]
      );
      const room = res.documents[0];
      if (!room) {
        throw new Error("Room not found");
      }

      setRoom({ ...room, gameState: JSON.parse(room.gameState) });

      unsub = onGameStateChange(room.$id);
    };
    if (router.isReady && code) {
      getRoom();
    }

    return unsub;
  }, [code, router]);

  const onGameStateChange = (roomId: string) => {
    const slug = `collections.${Collections.Room}.documents.${roomId}`;
    return appwrite.subscribe<RoomType>(slug, (response) => {
      console.log("Detected game state change, re-rendering", response);
      setRoom({
        ...response.payload,
        gameState: JSON.parse(response.payload.gameState),
      });
    });
  };

  if (!room || !account) return <h1>Loading</h1>;

  const markAnswer = async (questionId: string, option: string) => {
    if (!account) return;

    // const question = room.gameState[questionId]
    // question.response[account.$id] = {
    //   value: option
    // }

    // Move this logic to server side and calculate isCorrect.
    // Also remove write access to this document for security reasons.
    // Else, people can just hit the API and change response of other user.
    try {
      const res = await appwrite.database.updateDocument<RoomType>(
        Collections.Room,
        room?.$id,
        {
          gameState: JSON.stringify({
            ...room.gameState,
            [questionId]: {
              ...room.gameState[questionId],
              response: {
                ...room.gameState[questionId].response,
                [account.$id]: {
                  value: option,
                },
              },
            },
          }),
        }
      );

      console.log("Update success", res);
    } catch (e) {
      console.error(e);
    }
  };

  const questions = Object.entries(room.gameState);

  return (
    <>
      <Head>
        <title>Room | {room.code}</title>
      </Head>
      <main>
        <h1>Room Code: {room.code}</h1>

        <div>
          {questions.map(([questionId, question]) => (
            <div key={questionId}>
              <img src={question.image} alt="" width="80px" height={80} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {question.options.map((option) => {
                  const response = question.response;

                  return (
                    <button
                      key={option}
                      onClick={() => markAnswer(questionId, option)}
                      style={
                        response && response[account.$id]?.value === option
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
          ))}
        </div>
      </main>
    </>
  );
};

export default Room;
