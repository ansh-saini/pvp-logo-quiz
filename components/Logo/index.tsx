import clsx from "clsx";
import React from "react";
import styles from "./Logo.module.css";

type Props = { className?: string };

const Logo = ({ className }: Props) => {
  return (
    <p className={clsx(styles.root, className)}>
      <span>LOGO</span>
      <span>QUIZ</span>
    </p>
  );
};

export default Logo;
