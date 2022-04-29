import clsx from "clsx";
import React from "react";
import styles from "./Input.module.css";

type Props = {
  children?: React.ReactNode;
  label?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ children, className, label, ...props }: Props) => {
  return (
    <div className={clsx(styles.root, className)}>
      {label && (
        <label htmlFor={props.name} className={styles.label}>
          {label}
        </label>
      )}
      <input className={styles.input} {...props}>
        {children}
      </input>
    </div>
  );
};

export default Input;
