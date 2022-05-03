import PageLayout from "components/PageLayout";
import Button from "components/shared/Button";
import Input from "components/shared/Input";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styles from "styles/Home.module.css";
import { API, postData } from "utils/api";
import { useInstructions } from "utils/hooks/useInstructions";
import { Account } from "utils/models";

const Home: NextPage = () => {
  const router = useRouter();

  const [showTextField, setShowTextField] = useState(false);
  const { showInstructions, toggleInstructions } = useInstructions();

  const [code, setCode] = useState("");
  const [account, setAccount] = useState<Account | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const createRoom = async () => {
    if (!account) return;

    try {
      const res = await postData("/api/createRoom", {
        owner: account.$id,
      });
      router.push(`/room/${res.code}`);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    const res = await API.account.deleteSession("current");
    if (res.isOK) {
      router.replace("/auth");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const res = await API.account.get();
      if (res.isOK) {
        setAccount(res.data);
      } else {
        // Navigate to login
        router.replace("/auth");
      }
    };

    if (router.isReady) checkAuth();
  }, [router]);

  const joinRoom = () => {
    if (code) {
      router.push(`/room/${code}`);
      return;
    }

    if (!showTextField) {
      setShowTextField(true);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <PageLayout classes={{ content: styles.pageLayoutContent }}>
      <Head>
        <title>PvP Logo Quiz</title>
        <meta name="description" content="PvP Logo Quiz" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.sideButtons}>
        <Button dense onClick={toggleInstructions}>
          {showInstructions ? "Understood :)" : "How to play?"}
        </Button>
      </div>

      {showInstructions ? (
        <main className={styles.instructions}>
          <h1>How to play?</h1>

          <ul>
            <li>
              Every game has 10 questions. You will be presented with the
              questions one by one.
            </li>
            <li>
              You must answer the question before the 3 second timer runs out.
              Otherwise the question will be marked as skipped and you will not
              get any points for it.
            </li>
            <li>
              The player to get the most correct answers with least amount of
              time wins the game.
            </li>
          </ul>
        </main>
      ) : (
        <main className={styles.main}>
          <h1>Welcome {account?.name}!</h1>
          <Button onClick={createRoom}>Create Room</Button>

          {showTextField && (
            <Input
              ref={inputRef}
              placeholder="Enter room code"
              className={styles.input}
              onChange={(e) => {
                setCode(e.target.value);
              }}
              classes={{ input: styles.inputInput }}
            />
          )}

          <Button onClick={joinRoom}>Join Room</Button>
          <Button color="danger" onClick={logout}>
            Logout
          </Button>
        </main>
      )}
    </PageLayout>
  );
};

export default Home;
