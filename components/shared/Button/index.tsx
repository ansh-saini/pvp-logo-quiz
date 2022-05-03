import clsx from "clsx";
import React from "react";
import styles from "./Button.module.css";

type Props = {
  children: React.ReactNode;
  dense?: boolean;
  color?: "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  dense = false,
  color,
  children,
  className,
  ...props
}: Props) => {
  return (
    <button
      className={clsx(styles.root, className, {
        [styles["Button-danger"]]: color === "danger",
        [styles["Button-dense"]]: dense,
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
