import PageLayout from "components/PageLayout";
import type { NextPage } from "next";
import Head from "next/head";

const NotFoundPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>404</title>
      </Head>

      <PageLayout>
        <h1>Looks like there&apos;s nothing here.</h1>
        <h1>Make sure the URL is correct.</h1>
      </PageLayout>
    </>
  );
};

export default NotFoundPage;
