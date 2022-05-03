import clsx from "clsx";
import Logo from "components/Logo";
import React from "react";
import styles from "./PageLayout.module.css";

type Props = {
  children: React.ReactNode;
  classes?: Record<"content", string>;
};

const PageLayout = ({ children, classes }: Props) => {
  return (
    <>
      <Logo className={styles.logoPosition} />
      <div className={styles.container}>
        <div className={clsx(styles.content, classes?.content)}>{children}</div>
      </div>
    </>
  );
};

export default PageLayout;
