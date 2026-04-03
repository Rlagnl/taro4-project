import { PropsWithChildren } from 'react';
import '@/app.scss';

interface IAppProps extends PropsWithChildren {}

const App: React.FC<IAppProps> = (props: IAppProps) => {
  const { children } = props;

  return children;
};

export default App;
