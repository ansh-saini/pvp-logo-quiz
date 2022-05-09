import type { AppProps } from "next/app";
import Head from "next/head";
import "styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* <!-- Primary Meta Tags --> */}
        <title>PvP Logo Quiz</title>
        <link rel="icon" href="/favicon.ico" />

        <meta name="title" content="PvP Logo Quiz" />
        <meta name="description" content="Play Logo Quiz with Friends!" />

        {/* <!-- Open Graph / Facebook --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pvp-logo-quiz.vercel.app/" />
        <meta property="og:title" content="PvP Logo Quiz" />
        <meta
          property="og:description"
          content="Play Logo Quiz with Friends!"
        />
        <meta property="og:image" content="/Cover.png" />

        {/* <!-- Twitter --> */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://pvp-logo-quiz.vercel.app/"
        />
        <meta property="twitter:title" content="PvP Logo Quiz" />
        <meta
          property="twitter:description"
          content="Play Logo Quiz with Friends!"
        />
        <meta property="twitter:image" content="/Cover.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
