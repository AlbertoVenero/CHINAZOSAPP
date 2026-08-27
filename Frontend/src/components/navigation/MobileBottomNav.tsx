// components/navigation/MobileBottomNav.tsx
import { Button } from '@nextui-org/react';
import { NAV_ITEMS } from '@/config/navigation';
import { useNavigation } from '@/Router';
import { useAuth } from '@/contexts/AuthContext';

export const MobileBottomNav = () => {
  const { currentRoute, navigateTo } = useNavigation();
  const { isAuthenticated } = useAuth();

  // ✅ Filtrar items según autenticación
  const itemsFiltrados = NAV_ITEMS.filter(item => {
    // Si el item requiere autenticación, solo visible para usuarios autenticados
    if (item.requiresAuth) {
      return isAuthenticated;
    }
    // Si no requiere autenticación, visible para todos
    return true;
  });

  return (
    <div className="flex-shrink-0 bg-background border-t border-divider pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {itemsFiltrados.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.key;
          return (
            <Button
              key={item.key}
              variant="light"
              className={`flex flex-col items-center gap-0 h-auto min-w-0 px-1 py-1 flex-1 ${
                isActive ? 'text-primary' : 'text-default-500'
              }`}
              onPress={() => navigateTo(item.key as any)}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-[8px] sm:text-[10px] font-medium mt-0.5 text-center leading-tight">
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};