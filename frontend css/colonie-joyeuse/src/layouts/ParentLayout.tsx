import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ParentSidebar } from '@/components/parent/ParentSidebar';
import ParentDashboard from '@/components/parent/ParentDashboard';
import { LogOut } from 'lucide-react';

export default function ParentLayout() {
  const { parent, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!parent) return null;

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ParentSidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{parent.prenom} {parent.nom}</p>
                <p className="text-xs text-muted-foreground">{parent.service}</p>
              </div>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 bg-background overflow-auto">
            <ParentDashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
