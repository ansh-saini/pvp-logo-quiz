import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Props = { roomId: string };

const Result = ({ roomId }: Props) => {
  const router = useRouter();

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/result/?roomId=${roomId}`)
      .then((res) => res.json())
      .then((res) => setResult(res));
  }, []);

  return (
    <>
      <h1>Result</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <button onClick={() => router.push("/")}>Back to homepage</button>
    </>
  );
};

export default Result;
