import PageLayout from "components/PageLayout";
import Button from "components/shared/Button";
import Input from "components/shared/Input";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import styles from "styles/Home.module.css";
import { API, postData } from "utils/api";
import { useInstructions } from "utils/hooks/useInstructions";
import { Account } from "utils/models";

const Home: NextPage = () => {
  const router = useRouter();

  const [showTextField, setShowTextField] = useState(false);
  const { showInstructions, toggleInstructions } = useInstructions();

  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [account, setAccount] = useState<Account | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const createRoom = async () => {
    if (!account) return;

    setLoading(true);

    try {
      const res = await postData("/api/createRoom", {
        owner: account.$id,
      });
      router.push(`/room/${res.code}`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
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

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();

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
        <form className={styles.main} onSubmit={joinRoom}>
          <h1>Welcome {account?.name}!</h1>
          <Button type="button" onClick={createRoom} loading={loading}>
            Create Room
          </Button>

          {showTextField && (
            <Input
              required
              ref={inputRef}
              placeholder="Enter room code"
              className={styles.input}
              onChange={(e) => {
                setCode(e.target.value);
              }}
              classes={{ input: styles.inputInput }}
            />
          )}

          <Button type="submit">Join Room</Button>
          <Button color="danger" type="button" onClick={logout}>
            Logout
          </Button>
        </form>
      )}
    </PageLayout>
  );
};

export default Home;
