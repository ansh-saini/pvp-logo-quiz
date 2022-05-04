import type { AppProps } from "next/app";
import Head from "next/head";
import "styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>PvP Logo Quiz</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="PvP Logo Quiz" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
