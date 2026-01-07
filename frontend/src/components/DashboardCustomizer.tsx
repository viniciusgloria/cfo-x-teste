import { useState, createElement, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, GripVertical, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { Clock, FileText, Calendar, Plus, MessageSquare, Users, Target, MessageCircle, TrendingUp, Briefcase, UsersRound, Settings, Edit3, BarChart, FileBarChart2 } from 'lucide-react';
import { Button } from './ui/Button';

const iconMap: Record<string, any> = {
  Clock,
  Plus,
  Calendar,
  MessageSquare,
  TrendingUp,
  FileText,
  Users,
  Target,
  MessageCircle,
  Briefcase,
  UsersRound,
  Settings,
  Edit3,
  BarChart,
  FileBarChart2,
};

import type { Widget } from '../store/dashboardStore';

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: Widget[];
  onToggleWidget: (id: string) => void;
  onReorderWidgets: (widgets: Widget[]) => void;
  previewMode?: boolean;
}

export function DashboardCustomizer({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onReorderWidgets,
}: DashboardCustomizerProps) {

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'indice': true,
    'acoes-rapidas': true,
    'cards': true,
  });

  // Sempre ordenar widgets pelo campo 'order' antes de renderizar e manipular
  const orderedWidgets = [...widgets].sort((a, b) => {
    // Agrupar por seção, depois por ordem
    if (a.section !== b.section) {
      const sectionOrder: Record<string, number> = {
        'indice': 0,
        'acoes-rapidas': 1,
        'cards': 2,
      };
      return (sectionOrder[a.section] || 999) - (sectionOrder[b.section] || 999);
    }
    return a.order - b.order;
  });

  // Agrupar widgets por seção (sem remover duplicatas, cada widget tem um ID único)
  const widgetsBySection = {
    'indice': orderedWidgets.filter(w => w.section === 'indice'),
    'acoes-rapidas': orderedWidgets.filter(w => w.section === 'acoes-rapidas'),
    'cards': orderedWidgets.filter(w => w.section === 'cards'),
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDragStart = (e: React.DragEvent, section: string, index: number) => {
    setDraggedIndex(index);
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, section: string, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedSection !== section || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, section: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedSection === null || draggedSection !== section || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDraggedSection(null);
      return;
    }

    // Obter apenas widgets da seção
    const sectionWidgets = [...widgetsBySection[section as keyof typeof widgetsBySection]];
    
    // Reordenar dentro da seção
    const [removed] = sectionWidgets.splice(draggedIndex, 1);
    sectionWidgets.splice(index, 0, removed);

    // Atualizar order apenas da seção
    const updatedSectionWidgets = sectionWidgets.map((w, idx) => ({ ...w, order: idx }));

    // Reconstruir o array completo
    const newWidgets = orderedWidgets.map(w => {
      const updated = updatedSectionWidgets.find(us => us.id === w.id);
      return updated || w;
    });
    
    onReorderWidgets(newWidgets);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedSection(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedSection(null);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Sidebar à direita */}
      <div 
        className="fixed top-0 right-0 h-screen w-96 bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Personalizar Dashboard
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* SEÇÃO: ÍNDICE */}
            <div>
              <button
                onClick={() => toggleSection('indice')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown 
                    size={18}
                    className={`transition-transform ${expandedSections['indice'] ? 'rotate-0' : '-rotate-90'}`}
                  />
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Índice</h3>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400">{widgetsBySection['indice'].length} widget(s)</span>
              </button>
              
              {expandedSections['indice'] && (
                <div className="mt-2 space-y-2">
                  {widgetsBySection['indice'].map((widget, index) => {
                    const Icon = iconMap[widget.icon];
                    const isDragging = draggedIndex === index && draggedSection === 'indice';
                    const isDragOver = dragOverIndex === index && draggedSection === 'indice';
                    const isVisible = widget.enabled;

                    return (
                      <div 
                        key={widget.id} 
                        className="relative"
                        onDragEnter={(e) => handleDragEnter(e, 'indice', index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'indice', index)}
                        style={{
                          transition: 'transform 0.2s cubic-bezier(.4,2,.3,1)',
                        }}
                      >
                        <div
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, 'indice', index)}
                          onDragEnd={handleDragEnd}
                          className={`p-3 cursor-move hover:shadow-lg transition-all bg-white dark:bg-gray-700 border-2 rounded-lg ${
                            isDragging
                              ? 'opacity-30 border-blue-500 scale-95 shadow-xl' 
                              : isDragOver && draggedIndex !== null
                                ? 'border-blue-400 scale-105'
                                : isVisible
                                  ? 'border-green-300 dark:border-green-600 shadow-sm hover:border-green-400'
                                  : 'border-gray-200 dark:border-gray-600 opacity-50 hover:opacity-70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical
                              size={20}
                              className={`flex-shrink-0 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                            />
                            <div
                              className={`p-2 ${widget.color} rounded flex-shrink-0 ${!isVisible && 'opacity-50'}`}
                            >
                              {Icon && createElement(Icon, { size: 18, className: 'text-white' })}
                            </div>
                            <span className={`text-sm font-medium flex-1 min-w-0 truncate ${
                              isVisible
                                ? 'text-gray-800 dark:text-gray-100' 
                                : 'text-gray-400 dark:text-gray-500 line-through'
                            }`}>
                              {widget.label}
                            </span>

                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWidget(widget.id);
                              }}
                              className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                                isVisible
                                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20 bg-green-50 border border-green-200' 
                                  : 'hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200'
                              }`}
                              title={isVisible ? 'Clique para OCULTAR este widget' : 'Clique para MOSTRAR este widget'}
                            >
                              {isVisible ? (
                                <Eye size={18} className="text-green-600" />
                              ) : (
                                <EyeOff size={18} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEÇÃO: AÇÕES RÁPIDAS */}
            <div>
              <button
                onClick={() => toggleSection('acoes-rapidas')}
                className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown 
                    size={18}
                    className={`transition-transform ${expandedSections['acoes-rapidas'] ? 'rotate-0' : '-rotate-90'}`}
                  />
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">Ações Rápidas</h3>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">{widgetsBySection['acoes-rapidas'].length} widget(s)</span>
              </button>
              
              {expandedSections['acoes-rapidas'] && (
                <div className="mt-2 space-y-2">
                  {widgetsBySection['acoes-rapidas'].map((widget, index) => {
                    const Icon = iconMap[widget.icon];
                    const isDragging = draggedIndex === index && draggedSection === 'acoes-rapidas';
                    const isDragOver = dragOverIndex === index && draggedSection === 'acoes-rapidas';
                    const isVisible = widget.enabled;

                    return (
                      <div 
                        key={widget.id} 
                        className="relative"
                        onDragEnter={(e) => handleDragEnter(e, 'acoes-rapidas', index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'acoes-rapidas', index)}
                        style={{
                          transition: 'transform 0.2s cubic-bezier(.4,2,.3,1)',
                        }}
                      >
                        <div
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, 'acoes-rapidas', index)}
                          onDragEnd={handleDragEnd}
                          className={`p-3 cursor-move hover:shadow-lg transition-all bg-white dark:bg-gray-700 border-2 rounded-lg ${
                            isDragging
                              ? 'opacity-30 border-blue-500 scale-95 shadow-xl' 
                              : isDragOver && draggedIndex !== null
                                ? 'border-blue-400 scale-105'
                                : isVisible
                                  ? 'border-green-300 dark:border-green-600 shadow-sm hover:border-green-400'
                                  : 'border-gray-200 dark:border-gray-600 opacity-50 hover:opacity-70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical
                              size={20}
                              className={`flex-shrink-0 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                            />
                            <div
                              className={`p-2 ${widget.color} rounded flex-shrink-0 ${!isVisible && 'opacity-50'}`}
                            >
                              {Icon && createElement(Icon, { size: 18, className: 'text-white' })}
                            </div>
                            <span className={`text-sm font-medium flex-1 min-w-0 truncate ${
                              isVisible
                                ? 'text-gray-800 dark:text-gray-100' 
                                : 'text-gray-400 dark:text-gray-500 line-through'
                            }`}>
                              {widget.label}
                            </span>

                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWidget(widget.id);
                              }}
                              className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                                isVisible
                                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20 bg-green-50 border border-green-200' 
                                  : 'hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200'
                              }`}
                              title={isVisible ? 'Clique para OCULTAR este widget' : 'Clique para MOSTRAR este widget'}
                            >
                              {isVisible ? (
                                <Eye size={18} className="text-green-600" />
                              ) : (
                                <EyeOff size={18} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEÇÃO: CARDS */}
            <div>
              <button
                onClick={() => toggleSection('cards')}
                className="w-full flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown 
                    size={18}
                    className={`transition-transform ${expandedSections['cards'] ? 'rotate-0' : '-rotate-90'}`}
                  />
                  <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Cards</h3>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">{widgetsBySection['cards'].length} widget(s)</span>
              </button>
              
              {expandedSections['cards'] && (
                <div className="mt-2 space-y-2">
                  {widgetsBySection['cards'].map((widget, index) => {
                    const Icon = iconMap[widget.icon];
                    const isDragging = draggedIndex === index && draggedSection === 'cards';
                    const isDragOver = dragOverIndex === index && draggedSection === 'cards';
                    const isVisible = widget.enabled;

                    return (
                      <div 
                        key={widget.id} 
                        className="relative"
                        onDragEnter={(e) => handleDragEnter(e, 'cards', index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'cards', index)}
                        style={{
                          transition: 'transform 0.2s cubic-bezier(.4,2,.3,1)',
                        }}
                      >
                        <div
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, 'cards', index)}
                          onDragEnd={handleDragEnd}
                          className={`p-3 cursor-move hover:shadow-lg transition-all bg-white dark:bg-gray-700 border-2 rounded-lg ${
                            isDragging
                              ? 'opacity-30 border-blue-500 scale-95 shadow-xl' 
                              : isDragOver && draggedIndex !== null
                                ? 'border-blue-400 scale-105'
                                : isVisible
                                  ? 'border-green-300 dark:border-green-600 shadow-sm hover:border-green-400'
                                  : 'border-gray-200 dark:border-gray-600 opacity-50 hover:opacity-70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical
                              size={20}
                              className={`flex-shrink-0 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                            />
                            <div
                              className={`p-2 ${widget.color} rounded flex-shrink-0 ${!isVisible && 'opacity-50'}`}
                            >
                              {Icon && createElement(Icon, { size: 18, className: 'text-white' })}
                            </div>
                            <span className={`text-sm font-medium flex-1 min-w-0 truncate ${
                              isVisible
                                ? 'text-gray-800 dark:text-gray-100' 
                                : 'text-gray-400 dark:text-gray-500 line-through'
                            }`}>
                              {widget.label}
                            </span>

                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWidget(widget.id);
                              }}
                              className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                                isVisible
                                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20 bg-green-50 border border-green-200' 
                                  : 'hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200'
                              }`}
                              title={isVisible ? 'Clique para OCULTAR este widget' : 'Clique para MOSTRAR este widget'}
                            >
                              {isVisible ? (
                                <Eye size={18} className="text-green-600" />
                              ) : (
                                <EyeOff size={18} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} fullWidth>
            Concluir
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
