import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Check, AlertCircle } from 'lucide-react';
import { isValidCPF, isValidCNPJ } from '../utils/validation';
import toast from 'react-hot-toast';

interface ImportRow {
  index: number;
  raw: any;
  suggestedId?: number | string;
  selectedId?: number | string | 'new' | null;
  existingFolhaId?: string;
  duplicateAction?: 'update' | 'create-new';
}

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: ImportRow[];
  colaboradores: any[];
  onConfirm: (rows: ImportRow[]) => void;
  periodo?: string | null;
  onSetPeriodo?: (p: string) => void;
  appliedMappingName?: string | null;
  onUndoMapping?: () => void;
  invalid?: boolean;
  onDownloadModel?: () => void;
}

export function ImportPreviewModal({ isOpen, onClose, rows, onConfirm, onSetPeriodo, appliedMappingName, onUndoMapping, invalid, onDownloadModel }: ImportPreviewModalProps) {
  const [localRows, setLocalRows] = useState<ImportRow[]>(rows);
  const [periodoLocal, setPeriodoLocal] = useState<string>('');
  const [bulkChoice, setBulkChoice] = useState<'update' | 'create-new' | null>(null);
  const [bulkApplied, setBulkApplied] = useState(false);

  useEffect(() => setLocalRows(rows), [rows]);

  useEffect(() => {
    // Enable confirm if no duplicates exist
    const hasDuplicates = rows && rows.some(r => r.existingFolhaId);
    setBulkApplied(!hasDuplicates);
    setBulkChoice(null);
  }, [rows]);

  useEffect(() => {
    setPeriodoLocal((rows && rows.length > 0 && (typeof (rows as any)[0].raw.periodo === 'string')) ? (rows as any)[0].raw.periodo : '');
  }, [rows]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pré-visualização de Importação">
      <div className="space-y-4">
        {invalid && (
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">O arquivo enviado não é compatível com o formato esperado.</p>
            <p className="text-sm text-gray-600 mb-4">Baixe nossa planilha modelo, preencha com os campos corretos e tente novamente.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={() => { try { if (onDownloadModel) onDownloadModel(); } catch {} }} variant="primary">Baixar Modelo</Button>
            </div>
          </div>
        )}
        {!invalid && (
        <>
        <p className="text-sm text-gray-600">Revise as linhas importadas. Colaboradores da empresa serão vinculados automaticamente; os demais serão registrados como pagamentos avulsos (prestadores externos).</p>

        {/* Banner for duplicates */}
        {(() => {
          const hasDuplicates = rows && rows.some(r => r.existingFolhaId);

          if (hasDuplicates) {
            return (
              <div className="p-2 mt-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 text-sm flex items-center justify-between flex-nowrap">
                <div className="text-gray-700 dark:text-gray-300 flex-1 min-w-0">
                  Foram encontrados lançamentos duplicados. <strong>Atualizar</strong> sobrescreve os existentes; <strong>Criar Novo</strong> adiciona como novos lançamentos.
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className={`px-3 py-1 rounded ${bulkChoice === 'update' ? 'bg-yellow-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                    onClick={() => {
                      setLocalRows(prev => prev.map(r => r.existingFolhaId ? { ...r, duplicateAction: 'update' } : r));
                      const count = rows.filter(r => r.existingFolhaId).length;
                      toast.success(`${count} lançamento(s) serão atualizados.`);
                      setBulkApplied(true);
                      setBulkChoice('update');
                    }}
                    aria-pressed={bulkChoice === 'update'}
                  >
                    Atualizar
                  </button>

                  <button
                    className={`px-3 py-1 rounded ${bulkChoice === 'create-new' ? 'bg-yellow-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                    onClick={() => {
                      setLocalRows(prev => prev.map(r => r.existingFolhaId ? { ...r, duplicateAction: 'create-new' } : r));
                      const count = rows.filter(r => r.existingFolhaId).length;
                      toast.success(`${count} novo(s) lançamento(s) serão criados.`);
                      setBulkApplied(true);
                      setBulkChoice('create-new');
                    }}
                    aria-pressed={bulkChoice === 'create-new'}
                  >
                    Criar Novo
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-700">Mês de competência (AAAA-MM):</label>
          <input
            className="px-2 py-1 border rounded w-40"
            value={periodoLocal}
            onChange={(e) => setPeriodoLocal(e.target.value)}
            placeholder="2025-11"
          />
        </div>

        {/* Mapping notice (applied automatically) */}
        {appliedMappingName && (
          <div className="p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm flex items-center justify-between">
            <div>Mapping <strong>{appliedMappingName}</strong> aplicado automaticamente.</div>
            {onUndoMapping && (
              <button className="underline text-emerald-700" onClick={() => { try { onUndoMapping(); } catch {} }}>Desfazer</button>
            )}
          </div>
        )}

        <div className="max-h-64 overflow-auto border rounded p-2 bg-white dark:bg-gray-800">
          {localRows.map((r) => {
            const cpfValido = r.raw.cpf && isValidCPF(r.raw.cpf.replace(/\D/g, ''));
            const cnpjValido = r.raw.cnpj ? isValidCNPJ(r.raw.cnpj.replace(/\D/g, '')) : true;
            const temErroValidacao = !cpfValido || !cnpjValido;
            
            return (
              <div key={r.index} className={`min-w-full flex items-center gap-3 py-2 border-b last:border-b-0 ${temErroValidacao ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                <div className="flex-shrink-0 w-8 text-sm text-gray-600">#{r.index + 1}</div>

                {/* Nome do Colaborador */}
                <div className="min-w-[200px] text-sm text-gray-900 break-words">
                  <div className="text-xs text-gray-500 mb-1">Nome</div>
                  <div className="font-medium">{r.raw.colaborador || '-'}</div>
                </div>

                {/* CPF */}
                <div className="min-w-[140px] text-sm text-gray-700 break-words">
                  <div className="text-xs text-gray-500 mb-1">CPF {!cpfValido && '❌'}</div>
                  <div className="font-mono text-xs flex items-center gap-1">
                    {r.raw.cpf || '-'}
                    {!cpfValido && <AlertCircle size={14} className="text-red-500" />}
                  </div>
                </div>

                {/* CNPJ (if present) */}
                {r.raw.cnpj && (
                  <div className="min-w-[140px] text-sm text-gray-700 break-words">
                    <div className="text-xs text-gray-500 mb-1">CNPJ {!cnpjValido && '❌'}</div>
                    <div className="font-mono text-xs flex items-center gap-1">
                      {r.raw.cnpj}
                      {!cnpjValido && <AlertCircle size={14} className="text-red-500" />}
                    </div>
                  </div>
                )}

                {/* Empresa */}
                <div className="min-w-[150px] text-sm text-gray-700 break-words">
                  <div className="text-xs text-gray-500 mb-1">Empresa</div>
                  <div>{r.raw.empresa || '-'}</div>
                </div>

                {/* Função */}
                <div className="min-w-[140px] text-sm text-gray-700 break-words">
                  <div className="text-xs text-gray-500 mb-1">Função</div>
                  <div>{r.raw.funcao || '-'}</div>
                </div>

              </div>
            );
          })}
        </div>

        {localRows.some(r => {
          const cpfValido = r.raw.cpf && isValidCPF(r.raw.cpf.replace(/\D/g, ''));
          return !cpfValido;
        }) && (
          <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 text-sm text-red-700">
            ⚠️ Existem linhas com CPF/CNPJ inválido. Verifique os dados antes de confirmar.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button disabled={!bulkApplied} onClick={() => {
            if (typeof (onSetPeriodo) !== 'undefined') {
              try { (onSetPeriodo as any)(periodoLocal); } catch {}
            }
            onConfirm(localRows);
          }} variant="primary">
            <Check className="w-4 h-4 mr-2 inline" />
            Confirmar Importação
          </Button>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
        </>
        )}
      </div>
    </Modal>
  );
}
