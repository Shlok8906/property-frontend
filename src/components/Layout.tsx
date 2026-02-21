import { Header } from './Header';
import { FloatingChatbot } from './FloatingChatbot';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <FloatingChatbot />
    </div>
  );
}
