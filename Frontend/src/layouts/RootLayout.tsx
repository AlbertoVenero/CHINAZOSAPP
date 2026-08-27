// layouts/RootLayout.tsx
import { TopBar } from '@/components/navigation/TopBar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { Router } from '@/Router';
import { Content } from '@/components/Content';

export const RootLayout = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <Content />
        </div>
        <MobileBottomNav />
      </div>
    </Router>
  );
};