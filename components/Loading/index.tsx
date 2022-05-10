import PageLayout from "components/PageLayout";
import React from "react";
import styles from "./Loading.module.css";

type Props = { children?: React.ReactNode };

const Loading = ({ children = <h1>Loading</h1> }: Props) => {
  return (
    <PageLayout>
      <div className={styles.root}>
        {children}
        <div className="large loading-ring"></div>
      </div>
    </PageLayout>
  );
};

export default Loading;
