import clsx from "clsx";
import React, { useCallback, useEffect } from "react";
import styles from "./TimeBar.module.css";

type Props = {
  onEnd?: () => void;
  questionId: string;
};

const barId = "TimeBar-progress";
const containerId = "TimeBar-container";

const TimeBar = ({ onEnd, questionId }: Props) => {
  const cb = useCallback(() => {
    const node = document.getElementById(containerId);
    if (node) {
      const el = node.cloneNode(true);
      (el as HTMLDivElement).setAttribute("id", containerId);

      (el.firstChild as HTMLDivElement)?.setAttribute("id", barId);

      const onAnimationEnd = function () {
        if (onEnd) onEnd();
        cb();
      };
      el.firstChild?.addEventListener("animationend", onAnimationEnd);
      node.parentNode?.replaceChild(el, node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEnd]);

  useEffect(() => {
    cb();
  }, [cb, questionId]);

  return (
    <div className={styles.root}>
      <div className={styles.progressbar} id={containerId}>
        <div id={barId} className={clsx(styles.inner, styles.red)} />
        <div className={clsx(styles.inner, styles.orange)} />
        <div className={clsx(styles.inner, styles.yellow)} />
        <div className={clsx(styles.inner, styles.green)} />
        <div className={clsx(styles.inner, styles.blue)} />
        <div className={clsx(styles.inner, styles.purple)} />
      </div>

      {/* <Button onClick={cb}>Reset</Button> */}
    </div>
  );
};

export default TimeBar;
