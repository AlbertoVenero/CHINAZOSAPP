// src/components/Content.tsx
import { useNavigation } from '@/Router';
import { NuevoPage, HistorialPage, VotacionPage, SicariosPage, GanadoresPage } from '@/pages';

// Definimos solo las rutas internas (sin login)
type InternalRouteKey = 'nuevo' | 'historial' | 'votacion' | 'sicarios' | 'ganadores';

const routeComponents: Record<InternalRouteKey, () => JSX.Element> = {
  nuevo: NuevoPage,
  historial: HistorialPage,
  votacion: VotacionPage,
  sicarios: SicariosPage,
  ganadores: GanadoresPage,
};

export const Content = () => {
  const { currentRoute } = useNavigation();
  
  // Si la ruta es 'login', no mostramos nada (el Router ya maneja el login)
  if (currentRoute === 'login') {
    return null;
  }
  
  // Verificamos que la ruta sea válida
  const esRutaInterna = (ruta: string): ruta is InternalRouteKey => {
    return ruta in routeComponents;
  };
  
  if (!esRutaInterna(currentRoute)) {
    return <div>Página no encontrada</div>;
  }
  
  const ComponenteActual = routeComponents[currentRoute];
  return <ComponenteActual />;
};