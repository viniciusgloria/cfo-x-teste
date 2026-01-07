import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { Avatar } from './Avatar';
import { isValidCPF, isValidCNPJ } from '../utils/validation';

interface Props {
  nome: string;
  cargo: string;
  departamento: string;
  avatar?: string;
  cpf?: string;
  cnpj?: string;
  contrato?: string;
  onOpen: () => void;
}

export function CollaboratorCard({ nome, cargo, departamento, avatar, cpf, cnpj, contrato, onOpen }: Props) {
  const cpfValido = cpf && isValidCPF(cpf.replace(/\D/g, ''));
  const cnpjValido = contrato === 'PJ' ? (cnpj && isValidCNPJ(cnpj.replace(/\D/g, ''))) : true;
  const todosValidos = cpfValido && cnpjValido;

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="relative">
          {avatar ? (
            <Avatar src={avatar} alt={nome} size="xl" />
          ) : (
            <Avatar size="xl">
              <User />
            </Avatar>
          )}
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
            {todosValidos ? (
              <CheckCircle size={18} className="text-green-600" />
            ) : (
              <AlertCircle size={18} className="text-red-500" />
            )}
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{nome}</p>
          <p className="text-sm text-gray-500">{cargo}</p>
          <p className="text-xs text-gray-400">{departamento}</p>
        </div>
        <Button variant="outline" onClick={onOpen}>Ver perfil</Button>
      </div>
    </Card>
  );
}
