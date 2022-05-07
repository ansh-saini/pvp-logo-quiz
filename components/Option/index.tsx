import React from "react";
import { postData } from "utils/api";

type Props = {
  userToken: string;
  roomId: string;
  questionId: string;
  option: string;
  isMarked: boolean;
};

const Option = ({ userToken, roomId, questionId, option, isMarked }: Props) => {
  const markAnswer = () => {
    postData(
      "/api/saveResponse",
      {
        roomId: roomId,
        questionId: questionId,
        response: option,
        timeStamp: Date.now(),
      },
      {
        jwt: userToken,
      }
    );
  };

  return (
    <button
      onClick={() => markAnswer()}
      style={isMarked ? { border: "2px solid purple" } : {}}
    >
      {option}
    </button>
  );
};

export default Option;
