import { useRouter } from "next/router";
import React from "react";

type Props = {};

const Room = (props: Props) => {
  const router = useRouter();
  const { code } = router.query;

  return <div>Room Code: {code}</div>;
};

export default Room;
