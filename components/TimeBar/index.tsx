import React, { useEffect, useRef } from "react";
import styles from "./TimeBar.module.css";

type Props = {
  onEnd?: () => void;
};

const TimeBar = ({ onEnd }: Props) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;

    const cb = () => {
      if (onEnd) onEnd();
    };
    if (el) {
      el.addEventListener("animationend", cb);
    }

    return () => {
      if (el) el.removeEventListener("animationend", cb);
    };
  }, []);

  return (
    <div className={styles.progressbar}>
      <div ref={innerRef} className={styles.inner}></div>
    </div>
  );
};

export default TimeBar;
