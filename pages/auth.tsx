import PageLayout from "components/PageLayout";
import Button from "components/shared/Button";
import Input from "components/shared/Input";
import { appwrite } from "global/appwrite";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "styles/auth.module.css";

const Auth: NextPage = () => {
  const router = useRouter();

  const [formState, setFormState] = useState({
    email: "a",
    password: "a",
  });

  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const promise = appwrite.account.createSession(
      formState.email,
      formState.password
    );

    promise.then(
      function () {
        setError("");
        router.push("/");
      },
      function () {
        setError("Invalid Credentials");
      }
    );
  };

  // const createUser = () => {
  //   appwrite.account
  //     .create("unique()", "me@example.com", "password", "Jane Doe")
  //     .then(
  //       (response: any) => {
  //         console.log(response);
  //       },
  //       (error: any) => {
  //         console.log(error);
  //       }
  //     );
  // };

  return (
    <>
      <Head>
        <title>Login/Signup</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageLayout>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className="form-group">
            <Input
              label="Email"
              type="text"
              id="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <Input
              label="Password"
              type="password"
              id="password"
              name="password"
              value={formState.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className="form-group">
            <Button type="submit">Log In</Button>
          </div>
        </form>
      </PageLayout>
    </>
  );
};

export default Auth;
