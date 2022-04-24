import { useRouter } from "next/router";
import React, { useEffect } from "react";

type Props = {};

const Result = (props: Props) => {
  const router = useRouter();

  useEffect(() => {
    // Fetch result API call
  }, []);

  return (
    <>
      <h1>Result</h1>
      <button onClick={() => router.push("/")}>Back to homepage</button>
    </>
  );
};

export default Result;
