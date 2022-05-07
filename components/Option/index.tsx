import React from "react";
import { postData } from "utils/api";

type Props = {
  roomId: string;
  questionId: string;
  option: string;
  refreshAuth: () => Promise<string>;
};

const Option = ({ roomId, questionId, option, refreshAuth }: Props) => {
  const markAnswer = (updatedJwt?: string) => {
    postData(
      "/api/saveResponse",
      {
        roomId: roomId,
        questionId: questionId,
        response: option,
        timeStamp: Date.now(),
      },
      updatedJwt
        ? {
            jwt: updatedJwt,
          }
        : undefined
    ).then((res) => {
      if (res.authExpired) {
        // Refresh auth and retry request
        refreshAuth().then(markAnswer);
      }
    });
  };

  return <button onClick={() => markAnswer()}>{option}</button>;
};

export default Option;
