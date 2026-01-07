import { 
  Utensils, 
  Coffee, 
  Bus, 
  Heart, 
  Smile, 
  Dumbbell, 
  Shield, 
  Ticket as TicketIcon, 
  Baby,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
import { Beneficio, TipoBeneficio } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface BeneficioCardProps {
  beneficio: Beneficio;
  onEdit?: (beneficio: Beneficio) => void;
  onToggleStatus?: (id: string) => void;
  showActions?: boolean;
}

export default function BeneficioCard({ 
  beneficio, 
  onEdit, 
  onToggleStatus,
  showActions = true 
}: BeneficioCardProps) {
  const Icon = getIconForTipo(beneficio.tipo);
  const color = getColorForTipo(beneficio.tipo);

  return (
    <Card className={`hover:shadow-md transition-shadow ${!beneficio.ativo ? 'opacity-60' : ''}`}>
      <div className="p-6 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
              <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div>
              <h3 className="text-base font-semibold">{beneficio.nome}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getNomeFornecedor(beneficio.fornecedor)}
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1">
              <Badge variant={beneficio.ativo ? 'aprovada' : 'default'} className="text-xs">
                {beneficio.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        {beneficio.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {beneficio.descricao}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Empresa</p>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              R$ {beneficio.valorEmpresa.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Colaborador</p>
            <p className="text-sm font-semibold">
              {beneficio.valorColaborador > 0 
                ? `R$ ${beneficio.valorColaborador.toFixed(2)}`
                : 'Gratuito'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex flex-wrap gap-1">
            {beneficio.obrigatorio && (
              <Badge variant="default" className="text-xs">
                Obrigatório
              </Badge>
            )}
            {beneficio.aplicavelTodos && (
              <Badge variant="default" className="text-xs">
                Todos
              </Badge>
            )}
            {beneficio.integracaoConfig?.sincronizacaoAutomatica && (
              <Badge variant="material" className="text-xs">
                Integrado
              </Badge>
            )}
          </div>

          {showActions && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  onClick={() => onEdit(beneficio)}
                  className="h-8 px-2 text-sm"
                >
                  Editar
                </Button>
              )}
              {onToggleStatus && (
                <Button
                  variant="ghost"
                  onClick={() => onToggleStatus(beneficio.id)}
                  className="h-8 px-2 text-sm"
                >
                  {beneficio.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Funções auxiliares
function getIconForTipo(tipo: TipoBeneficio): LucideIcon {
  const icons: Record<TipoBeneficio, LucideIcon> = {
    alimentacao: Utensils,
    refeicao: Coffee,
    transporte: Bus,
    saude: Heart,
    odontologico: Smile,
    academia: Dumbbell,
    seguro_vida: Shield,
    vale_cultura: TicketIcon,
    auxilio_creche: Baby,
    outros: MoreHorizontal
  };
  return icons[tipo];
}

function getColorForTipo(tipo: TipoBeneficio): string {
  const colors: Record<TipoBeneficio, string> = {
    alimentacao: 'orange',
    refeicao: 'amber',
    transporte: 'blue',
    saude: 'red',
    odontologico: 'cyan',
    academia: 'purple',
    seguro_vida: 'slate',
    vale_cultura: 'pink',
    auxilio_creche: 'green',
    outros: 'gray'
  };
  return colors[tipo];
}

function getNomeFornecedor(fornecedor: string): string {
  const nomes: Record<string, string> = {
    alelo: 'Alelo',
    sodexo: 'Sodexo',
    vr: 'VR Benefícios',
    ticket: 'Ticket',
    flash: 'Flash',
    ben: 'Ben Benefícios',
    caju: 'Caju',
    swile: 'Swile',
    ifood: 'iFood Benefícios',
    pluxee: 'Pluxee',
    manual: 'Manual'
  };
  return nomes[fornecedor] || fornecedor;
}
