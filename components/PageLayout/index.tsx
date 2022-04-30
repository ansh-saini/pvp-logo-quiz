import Logo from "components/Logo";
import React from "react";
import styles from "./PageLayout.module.css";

type Props = {
  children: React.ReactNode;
};

const PageLayout = ({ children }: Props) => {
  return (
    <>
      <Logo className={styles.logoPosition} />
      <div className={styles.container}>
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
};

export default PageLayout;
