import PageLayout from "components/PageLayout";
import Button from "components/shared/Button";
import Input from "components/shared/Input";
import { appwrite } from "global/appwrite";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styles from "styles/Home.module.css";
import { API, postData } from "utils/api";

const Home: NextPage = () => {
  const router = useRouter();

  const [showTextField, setShowTextField] = useState(false);
  const [code, setCode] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  // const createUser = () => {
  //   appwrite.account
  //     .create("unique()", "me@example.com", "password", "Jane Doe")
  //     .then(
  //       (response) => {
  //         console.log(response);
  //       },
  //       (error) => {
  //         console.log(error);
  //       }
  //     );
  // };

  const createRoom = async () => {
    const account = await appwrite.account.get();

    try {
      const res = await postData("/api/createRoom", {
        owner: account.$id,
      });
      console.log(res);
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
      if (!res.isOK) {
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
    <PageLayout>
      <Head>
        <title>PvP Logo Quiz</title>
        <meta name="description" content="PvP Logo Quiz" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <button onClick={logout}>Click me to logout</button> */}
      <main className={styles.main}>
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
    </PageLayout>
  );
};

export default Home;
