import PageLayout from "components/PageLayout";
import Button from "components/shared/Button";
import Input from "components/shared/Input";
import Head from "next/head";
import React, { useRef, useState } from "react";
import { ParsedRoom } from "utils/models";
import styles from "./Lobby.module.css";

type Props = { room: ParsedRoom };

const Lobby = ({ room }: Props) => {
  const inputRef = useRef<HTMLInputElement>();
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    setCopied(true);
    navigator.clipboard.writeText(room.code);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <PageLayout>
      <Head>
        <title>Lobby | {room.code}</title>
      </Head>
      <h1>Please wait while the other players join.</h1>

      <h1>Share room code</h1>

      <Input ref={inputRef} value={room.code} className={styles.input} />
      <Button onClick={copyText}>
        {copied ? "Copied!" : "Click to copy code"}
      </Button>
    </PageLayout>
  );
};

export default Lobby;
