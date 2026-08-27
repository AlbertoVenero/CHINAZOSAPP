// src/Router.tsx
import { useState, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/login/LoginPage';

type RouteKey = 'nuevo' | 'historial' | 'votacion' | 'sicarios' | 'ganadores' | 'login';

interface NavigationContextType {
  currentRoute: RouteKey;
  navigateTo: (route: RouteKey) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a Router');
  }
  return context;
};

export const Router = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isGuest } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<RouteKey>('votacion');

  const navigateTo = (route: RouteKey) => {
    setCurrentRoute(route);
  };

  // Si no está autenticado ni es invitado, mostrar login
  if (!isAuthenticated && !isGuest) {
    return <LoginPage />;
  }

  return (
    <NavigationContext.Provider value={{ currentRoute, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
};