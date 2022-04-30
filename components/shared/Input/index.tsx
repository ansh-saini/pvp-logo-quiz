import clsx from "clsx";
import React, { forwardRef } from "react";
import styles from "./Input.module.css";

type Props = {
  children?: React.ReactNode;
  label?: string;
  classes?: {
    input?: string;
  };
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef(
  ({ children, classes, className, label, ...props }: Props, ref) => {
    return (
      <div className={clsx(styles.root, className)}>
        {label && (
          <label htmlFor={props.name} className={styles.label}>
            {label}
          </label>
        )}
        <input
          // @ts-expect-error Can't seem to fix this
          ref={ref}
          className={clsx(styles.input, classes?.input)}
          {...props}
        >
          {children}
        </input>
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
