import { AppProps } from 'next/app';
import { PromiseProvider } from '../libs/promiseState';

const App = ({ Component }: AppProps) => {
  return (
    <PromiseProvider>
      <Component />
    </PromiseProvider>
  );
};
export default App;
