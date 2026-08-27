// config/navigation.ts
import {
  ChartBarIcon,
  BeakerIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, path: '/' },
  { key: 'medicamentos', label: 'Medicamentos', icon: BeakerIcon, path: '/medicamentos' },
  { key: 'inventario', label: 'Inventario', icon: ClipboardDocumentListIcon, path: '/inventario' },
  { key: 'configuracion', label: 'Configuración', icon: Cog6ToothIcon, path: '/configuracion' },
];