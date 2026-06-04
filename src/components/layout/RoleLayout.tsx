import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store/useAppStore';

interface RoleLayoutProps {
  children: React.ReactNode;
}

export const RoleLayout: React.FC<RoleLayoutProps> = ({ children }) => {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Navbar />
      <main
        className="transition-all duration-300 pt-16"
        style={{ marginLeft: sidebarOpen ? 240 : 64 }}
      >
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
