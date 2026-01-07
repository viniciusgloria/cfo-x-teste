import React, { useState, useRef } from 'react';
import { Paperclip, X, Download, Eye, FileText, Image, File } from 'lucide-react';
import { AnexoTarefa } from '../types';
import { useTarefasStore } from '../store/tarefasStore';
import { useAuthStore } from '../store/authStore';

interface TarefaAnexosProps {
  tarefaId: string;
  anexos: AnexoTarefa[];
}

const TarefaAnexos: React.FC<TarefaAnexosProps> = ({ tarefaId, anexos }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((s) => s.user);
  const adicionarAnexo = useTarefasStore((s) => s.adicionarAnexo);
  const removerAnexo = useTarefasStore((s) => s.removerAnexo);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Simular upload - em produção, fazer upload real para servidor/cloud
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          
          adicionarAnexo(tarefaId, {
            nome: file.name,
            url, // Em produção, seria a URL do servidor
            tipo: file.type,
            tamanho: file.size,
            usuarioId: user.id,
            usuarioNome: user.name,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemover = (anexoId: string) => {
    if (confirm('Deseja realmente remover este anexo?')) {
      removerAnexo(tarefaId, anexoId);
    }
  };

  const getIconForType = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image size={20} className="text-blue-500" />;
    if (tipo.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const isImage = (tipo: string) => tipo.startsWith('image/');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Paperclip size={18} />
          <h3>Anexos ({anexos.length})</h3>
        </div>
        
        {user && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`px-3 py-1.5 bg-blue-500 text-white rounded text-sm cursor-pointer hover:bg-blue-600 inline-flex items-center gap-2 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Paperclip size={16} />
              {uploading ? 'Enviando...' : 'Adicionar'}
            </label>
          </div>
        )}
      </div>

      {/* Lista de anexos */}
      <div className="space-y-2">
        {anexos.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nenhum anexo</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {anexos.map((anexo) => (
              <div
                key={anexo.id}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900/50"
              >
                {getIconForType(anexo.tipo)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{anexo.nome}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(anexo.tamanho)} • 
                    Enviado por {anexo.usuarioNome} • 
                    {new Date(anexo.criadoEm).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex gap-1">
                  {isImage(anexo.tipo) && (
                    <button
                      onClick={() => setPreviewUrl(anexo.url)}
                      className="p-1.5 hover:bg-gray-200 rounded"
                      title="Visualizar"
                    >
                      <Eye size={16} className="text-gray-600" />
                    </button>
                  )}
                  
                  <a
                    href={anexo.url}
                    download={anexo.nome}
                    className="p-1.5 hover:bg-gray-200 rounded inline-block"
                    title="Download"
                  >
                    <Download size={16} className="text-gray-600" />
                  </a>
                  
                  {user && user.id === anexo.usuarioId && (
                    <button
                      onClick={() => handleRemover(anexo.id)}
                      className="p-1.5 hover:bg-gray-200 rounded"
                      title="Remover"
                    >
                      <X size={16} className="text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de preview para imagens */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TarefaAnexos;
