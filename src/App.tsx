import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';

const router = createBrowserRouter(routes);

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
