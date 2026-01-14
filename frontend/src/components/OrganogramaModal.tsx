import React from 'react';
import { Modal } from './ui/Modal';
import { Building2, Users, ChevronRight } from 'lucide-react';
import { Setor, Cargo } from '../types';

interface OrganogramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  setores: Setor[];
  cargos: Cargo[];
}

interface CargoNode {
  cargo: Cargo;
  children: CargoNode[];
  level: number;
}

export function OrganogramaModal({ isOpen, onClose, setores, cargos }: OrganogramaModalProps) {
  // Construir árvore hierárquica completa
  const buildOrganogramaTree = (): { setor: Setor; roots: CargoNode[] }[] => {
    const result: { setor: Setor; roots: CargoNode[] }[] = [];
    setores.forEach(setor => {
      const cargosDoSetor = cargos.filter(cargo =>
        cargo.setoresVinculados?.includes(setor.id)
      );

      const roots: CargoNode[] = [];
      const setorVisited = new Set<string>();

      const buildNode = (cargo: Cargo, level: number = 0): CargoNode => {
        setorVisited.add(cargo.id);
        const children: CargoNode[] = [];

        // Encontrar cargos que têm este cargo como pai
        cargosDoSetor.forEach(c => {
          if (c.cargosPai?.includes(cargo.id) && !setorVisited.has(c.id)) {
            children.push(buildNode(c, level + 1));
          }
        });

        return { cargo, children, level };
      };

      cargosDoSetor.forEach(cargo => {
        if (!setorVisited.has(cargo.id)) {
          const hasValidParents = cargo.cargosPai?.some(parentId =>
            cargosDoSetor.some(c => c.id === parentId)
          );

          if (!hasValidParents) {
            roots.push(buildNode(cargo));
          }
        }
      });

      if (cargosDoSetor.length > 0) {
        result.push({ setor, roots });
      }
    });

    // Adicionar seção de cargos sem setor
    const cargosSemSetor = cargos.filter(cargo =>
      !cargo.setoresVinculados || cargo.setoresVinculados.length === 0
    );

    if (cargosSemSetor.length > 0) {
      const roots: CargoNode[] = [];
      const setorVisited = new Set<string>();

      const buildNodeSemSetor = (cargo: Cargo, level: number = 0): CargoNode => {
        setorVisited.add(cargo.id);
        const children: CargoNode[] = [];

        cargosSemSetor.forEach(c => {
          if (c.cargosPai?.includes(cargo.id) && !setorVisited.has(c.id)) {
            children.push(buildNodeSemSetor(c, level + 1));
          }
        });

        return { cargo, children, level };
      };

      cargosSemSetor.forEach(cargo => {
        if (!setorVisited.has(cargo.id)) {
          const hasValidParents = cargo.cargosPai?.some(parentId =>
            cargosSemSetor.some(c => c.id === parentId)
          );

          if (!hasValidParents) {
            roots.push(buildNodeSemSetor(cargo));
          }
        }
      });

      result.push({
        setor: { id: 'sem-setor', nome: 'Sem Setor Atribuído', criadoEm: new Date(), atualizadoEm: new Date() },
        roots
      });
    }

    return result;
  };

  const renderCargoNode = (node: CargoNode): React.ReactNode => {
    const { cargo, children, level } = node;

    return (
      <div key={cargo.id} className="relative">
        <div
          className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm"
          style={{ marginLeft: `${level * 40}px` }}
        >
          <div className="flex-shrink-0">
            <Users size={16} className="text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {cargo.nome}
            </div>
            {cargo.descricao && (
              <div className="text-sm text-gray-600 dark:text-slate-300 truncate">
                {cargo.descricao}
              </div>
            )}
          </div>

          {children.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <ChevronRight size={12} />
              {children.length} subordinado{children.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {children.length > 0 && (
          <div className="ml-8 mt-2 space-y-2">
            {children.map(childNode => renderCargoNode(childNode))}
          </div>
        )}
      </div>
    );
  };

  const organogramaData = buildOrganogramaTree();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Organograma Completo" size="large">
      <div className="max-h-[70vh] overflow-y-auto">
        {organogramaData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400">
            <Building2 size={48} className="mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p>Nenhum setor ou cargo cadastrado</p>
          </div>
        ) : (
          <div className="space-y-8">
            {organogramaData.map(({ setor, roots }) => (
              <div key={setor.id} className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-slate-700">
                  <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {setor.nome}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    ({roots.length + roots.reduce((acc, node) => acc + countAllChildren(node), 0)} cargo{roots.length + roots.reduce((acc, node) => acc + countAllChildren(node), 0) !== 1 ? 's' : ''})
                  </span>
                </div>

                <div className="space-y-3">
                  {roots.map(node => renderCargoNode(node))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// Função auxiliar para contar todos os filhos recursivamente
function countAllChildren(node: CargoNode): number {
  return node.children.length + node.children.reduce((acc, child) => acc + countAllChildren(child), 0);
}