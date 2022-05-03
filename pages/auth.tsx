import PageLayout from "components/PageLayout";
import Button from "components/shared/Button";
import Input from "components/shared/Input";
import { appwrite } from "global/appwrite";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "styles/auth.module.css";
import { API } from "utils/api";

enum MODE {
  LOGIN,
  SIGNUP,
}

const Auth: NextPage = () => {
  const router = useRouter();

  const [mode, setMode] = useState(MODE.LOGIN);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const res = await API.account.get();
      if (res.isOK) {
        router.replace("/");
      }
    };

    if (router.isReady) checkAuth();
  }, [router]);

  const handleChange = (e: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (isSignUpMode) {
      createUser(createSession);
    } else {
      createSession();
    }
  };

  const createSession = () => {
    const promise = appwrite.account.createSession(
      formState.email,
      formState.password
    );

    promise.then(
      function () {
        setError("");
        router.push("/");
      },
      function (e) {
        if (e.response?.message) setError(e.response.message);
        else setError("Invalid Credentials");
      }
    );
  };

  const createUser = (onSuccess: () => void) => {
    const { email, password, name } = formState;

    return appwrite.account.create("unique()", email, password, name).then(
      (response: any) => {
        onSuccess();
      },
      (e: any) => {
        if (e.response?.message) setError(e.response.message);
      }
    );
  };

  const isSignUpMode = mode === MODE.SIGNUP;

  return (
    <>
      <Head>
        <title>{isSignUpMode ? "Signup" : "Login"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageLayout>
        <form className={styles.form} onSubmit={handleSubmit}>
          {isSignUpMode && (
            <div className="form-group">
              <Input
                label="Name"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <Input
              label="Email"
              type="email"
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
            <Button type="submit">{isSignUpMode ? "Sign Up" : "Log In"}</Button>
            <Button
              type="button"
              color="danger"
              onClick={() => {
                setMode(isSignUpMode ? MODE.LOGIN : MODE.SIGNUP);
              }}
              style={{ marginTop: 8 }}
            >
              {isSignUpMode
                ? "Already have an account?"
                : "Don't Have an account?"}
            </Button>
          </div>
        </form>
      </PageLayout>
    </>
  );
};

export default Auth;
