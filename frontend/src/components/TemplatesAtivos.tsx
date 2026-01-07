import React, { useState } from 'react';
import { Settings, Trash2, Edit2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { TemplateTarefa } from '../types';
import { useTarefasStore } from '../store/tarefasStore';

interface TemplatesActivosProps {
  templates: TemplateTarefa[];
  onEdit: (template: TemplateTarefa) => void;
  onDelete: (templateId: string) => void;
  onExecute: (templateId: string) => void;
}

const frequenciaLabel: Record<string, string> = {
  unica: 'Única',
  diaria: 'Diária',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  anual: 'Anual',
};

const TemplatesAtivos: React.FC<TemplatesActivosProps> = ({
  templates,
  onEdit,
  onDelete,
  onExecute,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const activeTemplates = templates.filter((t) => t.ativa && (!t.dataFim || new Date(t.dataFim) > new Date()));

  if (activeTemplates.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-purple-500">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-purple-600" />
          <h3 className="font-semibold text-gray-700">Templates Ativos</h3>
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
            {activeTemplates.length}
          </span>
        </div>
        <button className="text-gray-600">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {activeTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-purple-200 rounded-lg p-3 bg-purple-50 hover:bg-purple-100 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{template.titulo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded">
                      {frequenciaLabel[template.frequencia]}
                    </span>
                    {template.proximaExecucao && (
                      <span className="text-xs text-gray-600">
                        Próx: {new Date(template.proximaExecucao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {template.descricao && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{template.descricao}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => onExecute(template.id)}
                    className="p-1.5 hover:bg-purple-200 rounded text-purple-600"
                    title="Executar agora"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => onEdit(template)}
                    className="p-1.5 hover:bg-purple-200 rounded text-purple-600"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(template.id)}
                    className="p-1.5 hover:bg-red-100 rounded text-red-600"
                    title="Deletar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplatesAtivos;
