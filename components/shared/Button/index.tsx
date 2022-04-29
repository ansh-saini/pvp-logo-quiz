import clsx from "clsx";
import React from "react";
import styles from "./Button.module.css";

type Props = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, className, ...props }: Props) => {
  return (
    <button className={clsx(styles.root, className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
