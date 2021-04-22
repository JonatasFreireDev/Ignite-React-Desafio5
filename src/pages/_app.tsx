import { AppProps } from 'next/app';
import '../styles/globals.scss';
import styles from './home.module.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
