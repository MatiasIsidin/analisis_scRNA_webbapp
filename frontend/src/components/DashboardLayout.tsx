import { ReactNode } from 'react';
import { Database, Activity, FileText, Settings, ExternalLink, Menu } from 'lucide-react';
import type { ModelInfo, HealthStatus } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  modelInfo: ModelInfo | null;
  health: HealthStatus | null;
}

export default function DashboardLayout({ children, modelInfo, health }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-dashboard-bg overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col shadow-xl z-20 flex-shrink-0">
        
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-active/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold tracking-wide text-sm">scRNA Classifier</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-text/70 mb-3">
              Análisis
            </p>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 bg-sidebar-active text-white rounded-md transition-colors">
                <Activity className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium">Clasificador XGBoost</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-hover rounded-md transition-colors opacity-50 cursor-not-allowed" title="Próximamente">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Historial de Reportes</span>
              </a>
            </nav>
          </div>

          {/* Model Status (Moved from Main Area) */}
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-text/70 mb-3 flex items-center justify-between">
              Estado del Modelo
              {health?.status === 'ok' ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </p>
            <div className="bg-sidebar-hover/50 rounded-lg p-4 border border-sidebar-active/30 text-xs space-y-3">
              
              <div className="flex justify-between items-center">
                <span className="text-sidebar-text/80">Modelo</span>
                <span className="text-white font-medium">{modelInfo?.model || 'Cargando...'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sidebar-text/80">Estado</span>
                <span className="text-white font-medium">{modelInfo?.status || '-'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sidebar-text/80">Accuracy</span>
                <span className="text-emerald-400 font-medium">
                  {modelInfo ? `${(modelInfo.accuracy * 100).toFixed(1)}%` : '-'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sidebar-text/80">F1 Macro</span>
                <span className="text-white font-medium">
                  {modelInfo ? `${(modelInfo.f1_macro * 100).toFixed(1)}%` : '-'}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Links */}
        <div className="p-4 border-t border-sidebar-active/30">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-sm text-sidebar-text hover:text-white hover:bg-sidebar-hover rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              API Docs
            </span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden h-16 bg-white border-b border-dashboard-border flex items-center px-4 shrink-0">
          <Menu className="w-6 h-6 text-slate-500" />
          <span className="ml-3 font-semibold text-slate-800">scRNA Classifier</span>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
            {children}
          </div>
        </div>
      </main>
      
    </div>
  );
}
