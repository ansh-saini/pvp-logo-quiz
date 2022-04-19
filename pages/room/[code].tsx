import { Query } from "appwrite";
import { appwrite, Collections } from "global/appwrite";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

type Props = {};

const Room = (props: Props) => {
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    let unsub = () => {};

    const getRoom = async () => {
      if (!code) return;

      const res = await appwrite.database.listDocuments(Collections.Room, [
        Query.equal("code", code),
      ]);
      console.log(res);

      unsub = onGameStateChange(res.documents[0].$id);
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

  return <div>Room Code: {code}</div>;
};

export default Room;
