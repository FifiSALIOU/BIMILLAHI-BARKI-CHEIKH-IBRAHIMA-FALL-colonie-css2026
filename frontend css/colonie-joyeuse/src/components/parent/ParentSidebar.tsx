import React from 'react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { LayoutDashboard } from 'lucide-react';
import logo from '@/assets/logo.png';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function ParentSidebar({ currentPage, onNavigate }: Props) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!collapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <img src={logo} alt="CSS" className="w-10 h-10 object-contain" />
              <div>
                <p className="font-display font-bold text-sm text-sidebar-foreground">Espace Parent</p>
                <p className="text-xs text-sidebar-foreground/60">Colonie 2026</p>
              </div>
            </div>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onNavigate('dashboard')} isActive={currentPage === 'dashboard'} tooltip="Accueil">
                  <LayoutDashboard className="w-4 h-4" />
                  {!collapsed && <span>Accueil</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
