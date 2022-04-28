import Head from "next/head";
import React from "react";
import { ParsedRoom } from "utils/models";
import styles from "./Lobby.module.css";

type Props = { room: ParsedRoom };

const Lobby = ({ room }: Props) => {
  return (
    <>
      <Head>
        <title>Lobby | {room.code}</title>
      </Head>

      <div className={styles.container}>
        <h1>
          Please wait while the other players join. Share room code. {room.code}
        </h1>
        <button>Join game</button>
      </div>
    </>
  );
};

export default Lobby;
