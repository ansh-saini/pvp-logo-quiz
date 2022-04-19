import { Query } from "appwrite";
import { appwrite, Collections } from "global/appwrite";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ParsedRoom, Room } from "utils/models";

type Props = {};

const Room = (props: Props) => {
  const router = useRouter();
  const { code } = router.query;

  const [room, setRoom] = useState<ParsedRoom | null>(null);

  useEffect(() => {
    let unsub = () => {};

    const getRoom = async () => {
      if (!code) return;

      const res = await appwrite.database.listDocuments<Room>(
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
    return appwrite.subscribe(slug, (response) => {
      console.log("Detected game state change, re-rendering", response);
    });
  };

  if (!room) return <h1>Loading</h1>;

  const questions = Object.entries(room.gameState);

  return (
    <main>
      <h1>Room Code: {room.code}</h1>

      <div>
        {questions.map(([questionId, question]) => (
          <div key={questionId}>
            <img src={question.image} alt="" width="80px" height={80} />
          </div>
        ))}
      </div>
    </main>
  );
};

export default Room;
