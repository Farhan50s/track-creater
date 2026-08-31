import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './features/auth/context/AuthContext';

const router = createBrowserRouter(routes);

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
