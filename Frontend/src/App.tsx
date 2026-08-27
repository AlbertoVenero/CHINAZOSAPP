// App.tsx
import { RootLayout } from '@/layouts/RootLayout';
import { Router } from './Router';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/login/LoginPage';

function App() {
  const { isAuthenticated, isGuest, loading } = useAuth();
  
  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-default-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado ni es invitado, mostrar login
  if (!isAuthenticated && !isGuest) {
    return <LoginPage />;
  }

  return (
    <Router>
      <RootLayout />
    </Router>
  );
}

export default App;