// src/config/navigation.ts
import { 
  PlusCircleIcon, 
  TrophyIcon, 
  UserGroupIcon,
  ClockIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';

export interface NavItem {
  key: string;
  label: string;
  icon: any;
  path: string;
  requiresAuth?: boolean; // ✅ Nuevo: si requiere autenticación
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'historial',
    label: 'Historial',
    icon: ClockIcon,
    path: '/historial',
    requiresAuth: false // ✅ Invitados pueden ver
  },
  {
    key: 'votacion',
    label: 'Votación',
    icon: HandThumbUpIcon,
    path: '/votacion',
    requiresAuth: false // ✅ Invitados pueden ver
  },
  {
    key: 'nuevo',
    label: 'Nuevo',
    icon: PlusCircleIcon,
    path: '/nuevo',
    requiresAuth: true // ✅ Solo usuarios autenticados
  },
  {
    key: 'ganadores',
    label: 'Ganadores',
    icon: TrophyIcon,
    path: '/ganadores',
    requiresAuth: false // ✅ Invitados pueden ver
  },
  {
    key: 'sicarios',
    label: 'Sicarios',
    icon: UserGroupIcon,
    path: '/sicarios',
    requiresAuth: true // ✅ Solo usuarios autenticados
  }
];