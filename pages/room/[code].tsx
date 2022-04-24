import { Models, Query } from "appwrite";
import ClientScores from "components/ClientScores";
import TimeBar from "components/TimeBar";
import { appwrite, Collections } from "global/appwrite";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { API, postData } from "utils/api";
import { getPlayerIndex, parseRoomState } from "utils/helpers";
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
    let unSubscribe = () => {};

    const joinRoom = async () => {
      if (!code || !account) return;

      return postData(`/api/joinRoom/${code}`, {
        userId: account.$id,
      });
    };

    const getRoom = async () => {
      console.log("Get Room called");
      if (!code) return;

      try {
        const res = await appwrite.database.listDocuments<RoomType>(
          Collections.Room,
          [Query.equal("code", code)]
        );
        const room = res.documents[0];
        if (!room) {
          console.error("Room not found");

          joinRoom().then(getRoom);
          return;
        }

        setRoom(parseRoomState(room));

        unSubscribe = onGameStateChange(room.$id);
      } catch (e: any) {
        console.log(e);
        if (e.response?.data) {
          console.log(e.response);
        }
      }
    };

    if (router.isReady && code) {
      getRoom();
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

  const markAnswer = async (questionId: string, option: string) => {
    if (!account) return;

    postData("/api/saveResponse", {
      roomId: room.$id,
      playerId: account.$id,
      questionId: questionId,
      response: option,
    });
  };

  const questions = Object.entries(room.gameState);
  const responses = room[playerIndex];

  return (
    <>
      <Head>
        <title>Room | {room.code}</title>
      </Head>
      <main>
        <TimeBar />
        <ClientScores room={room} currentPlayer={account.$id} />

        <h1>Room Code: {room.code}</h1>

        <div>
          {questions.map(([questionId, question]) => (
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
          ))}
        </div>
      </main>
    </>
  );
};

export default Room;
