import React from "react";

type Props = {
  option: string;
  markAnswer: (option: string) => void;
  disabled: boolean;
};

const Option = ({ disabled, option, markAnswer }: Props) => {
  return (
    <button disabled={disabled} onClick={() => markAnswer(option)}>
      {option}
    </button>
  );
};

export default Option;
