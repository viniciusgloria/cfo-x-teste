import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Eye } from 'lucide-react';
import { Avatar } from './Avatar';

interface Props {
  nome: string;
  cargo: string;
  departamento: string;
  avatar?: string;
  cpf?: string;
  cnpj?: string;
  contrato?: string;
  status: 'ativo' | 'afastado' | 'ferias' | 'em_contratacao' | 'inativo';
  onOpen: () => void;
}

export function CollaboratorCard({ nome, cargo, departamento, avatar, cpf, cnpj, contrato, status, onOpen }: Props) {
  const getStatusBadge = () => {
    const config = {
      ativo: { colors: 'bg-green-100 text-green-800', label: 'Ativo', icon: '🟢' },
      afastado: { colors: 'bg-yellow-100 text-yellow-800', label: 'Afastado', icon: '⏸️' },
      ferias: { colors: 'bg-blue-100 text-blue-800', label: 'Férias', icon: '🏖️' },
      em_contratacao: { colors: 'bg-orange-100 text-orange-800', label: 'Em Contratação', icon: '📝' },
      inativo: { colors: 'bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200', label: 'Inativo', icon: '🔚' }
    };
    return config[status] || config.ativo;
  };

  const badgeInfo = getStatusBadge();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar
            src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent((nome || '').split(' ')[0])}`}
            alt={nome}
            size="lg"
            className="bg-gray-100 dark:bg-gray-700 flex-shrink-0"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 line-clamp-2">{nome}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-300 mt-1">{cargo} - {departamento}</p>
          </div>
        </div>
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${badgeInfo.colors}`}>
          {badgeInfo.label}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-gray-500 dark:text-slate-300">CPF</p>
          <p className="font-medium text-gray-800 dark:text-slate-100">{cpf || '-'}</p>
        </div>
        {contrato === 'PJ' && (
          <div>
            <p className="text-gray-500 dark:text-slate-300">CNPJ</p>
            <p className="font-medium text-gray-800 dark:text-slate-100">{cnpj || '-'}</p>
          </div>
        )}
        <div>
          <p className="text-gray-500 dark:text-slate-300">Tipo de Contrato</p>
          <p className="font-medium text-gray-800 dark:text-slate-100">{contrato || 'CLT'}</p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="secondary"
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-1 text-sm dark:text-slate-100"
        >
          <Eye size={16} />
          Visualizar
        </Button>
      </div>
    </Card>
  );
}
