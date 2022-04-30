import clsx from "clsx";
import React from "react";
import styles from "./Button.module.css";

type Props = {
  children: React.ReactNode;
  color?: "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ color, children, className, ...props }: Props) => {
  return (
    <button
      className={clsx(styles.root, className, {
        [styles["Button-danger"]]: color === "danger",
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
