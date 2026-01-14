import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, GripVertical, Users } from 'lucide-react';
import { Cargo } from '../types';

interface HierarquiaSetorProps {
  cargos: Cargo[];
  onUpdateHierarquia: (cargoId: string, novosCargosPai: string[]) => void;
  onDragStartCargo: (cargoId: string) => void;
  onDragEndCargo: () => void;
  draggingCargoId: string | null;
}

interface CargoNode {
  cargo: Cargo;
  children: CargoNode[];
  level: number;
}

export function HierarquiaSetor({ cargos, onUpdateHierarquia, onDragStartCargo, onDragEndCargo, draggingCargoId }: HierarquiaSetorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [dragOverCargo, setDragOverCargo] = useState<string | null>(null);

  // Construir árvore hierárquica baseada nos cargosPai
  const buildHierarquiaTree = useCallback((): CargoNode[] => {
    const processed = new Set<string>();

    const buildNode = (cargo: Cargo, level: number = 0): CargoNode => {
      processed.add(cargo.id);
      const children: CargoNode[] = [];

      // Encontrar cargos que têm este cargo como pai
      cargos.forEach(c => {
        if (c.cargosPai?.includes(cargo.id) && !processed.has(c.id)) {
          children.push(buildNode(c, level + 1));
        }
      });

      return { cargo, children, level };
    };

    const roots: CargoNode[] = [];

    // Encontrar cargos raiz (sem pais ou cujos pais não existem neste setor)
    cargos.forEach(cargo => {
      if (!processed.has(cargo.id)) {
        const hasValidParents = cargo.cargosPai?.some(parentId =>
          cargos.some(c => c.id === parentId)
        );

        if (!hasValidParents) {
          roots.push(buildNode(cargo));
        }
      }
    });

    return roots;
  }, [cargos]);

  const toggleExpanded = (cargoId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cargoId)) {
        newSet.delete(cargoId);
      } else {
        newSet.add(cargoId);
      }
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, cargoId: string) => {
    onDragStartCargo(cargoId);
    e.dataTransfer.effectAllowed = 'move';
    // garantir compatibilidade de DnD
    e.dataTransfer.setData('text/plain', cargoId);
  };

  const handleDragOver = (e: React.DragEvent, cargoId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCargo(cargoId);
  };

  const handleDragLeave = () => {
    setDragOverCargo(null);
  };

  const handleDrop = (e: React.DragEvent, targetCargoId: string) => {
    e.preventDefault();
    setDragOverCargo(null);

    if (!draggingCargoId || draggingCargoId === targetCargoId) {
      onDragEndCargo();
      return;
    }

    // Inverter: draggedCargo terá targetCargo como pai (targetCargo é o superior)
    const draggedCargo = cargos.find(c => c.id === draggingCargoId);
    if (draggedCargo) {
      // Adicionar targetCargo como pai de draggedCargo
      const novosCargosPai = Array.from(new Set([...(draggedCargo.cargosPai || []), targetCargoId]));
      onUpdateHierarquia(draggingCargoId, novosCargosPai);
    }

    onDragEndCargo();
  };

  const removeParentRelationship = (cargoId: string, parentId: string) => {
    const cargo = cargos.find(c => c.id === cargoId);
    if (cargo) {
      const novosCargosPai = cargo.cargosPai?.filter(id => id !== parentId) || [];
      onUpdateHierarquia(cargoId, novosCargosPai);
    }
  };

  const renderCargoNode = (node: CargoNode): React.ReactNode => {
    const { cargo, children, level } = node;
    const isExpanded = expandedNodes.has(cargo.id);
    const hasChildren = children.length > 0;
    const isDraggedOver = dragOverCargo === cargo.id;

    return (
      <div key={cargo.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
            isDraggedOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, cargo.id)}
          onDragEnd={onDragEndCargo}
          onDragOver={(e) => handleDragOver(e, cargo.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, cargo.id)}
        >
          <GripVertical size={16} className="text-gray-400 cursor-move" />

          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(cargo.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">{cargo.nome}</div>
            {cargo.descricao && (
              <div className="text-sm text-gray-600 dark:text-slate-300">{cargo.descricao}</div>
            )}

            {/* Mostrar relacionamentos de hierarquia */}
            {cargo.cargosPai && cargo.cargosPai.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">Reporta-se a:</span>
                {cargo.cargosPai.map(parentId => {
                  const parentCargo = cargos.find(c => c.id === parentId);
                  return parentCargo ? (
                    <span
                      key={parentId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {parentCargo.nome}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeParentRelationship(cargo.id, parentId);
                        }}
                        className="hover:text-red-600 dark:hover:text-red-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {hasChildren && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <Users size={12} />
              {children.length}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 mt-2 space-y-2">
            {children.map(childNode => renderCargoNode(childNode))}
          </div>
        )}
      </div>
    );
  };

  const hierarquiaTree = buildHierarquiaTree();

  if (cargos.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-slate-400 italic">
        Nenhum cargo atribuído a este setor
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 dark:text-slate-300 mb-4">
        <strong>Dica:</strong> Arraste um cargo sobre outro para estabelecer relação de subordinação. Cargos podem ter múltiplos superiores.
      </div>

      <div className="space-y-2">
        {hierarquiaTree.map(node => renderCargoNode(node))}
      </div>
    </div>
  );
}