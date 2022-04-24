import React from "react";
import { postData } from "utils/api";

type Props = {
  userId: string;
  roomId: string;
  questionId: string;
  option: string;
  isMarked: boolean;
};

const Option = ({ userId, roomId, questionId, option, isMarked }: Props) => {
  const markAnswer = () => {
    postData("/api/saveResponse", {
      roomId: roomId,
      playerId: userId,
      questionId: questionId,
      response: option,
      timeStamp: Date.now(),
    });
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
