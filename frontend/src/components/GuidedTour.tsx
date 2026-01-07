import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useTourStore } from '../store/tourStore';

const steps: Step[] = [
  {
    target: 'body',
    content: 'Bem-vindo ao CFO Hub! Vamos fazer um tour rápido pelas principais funcionalidades.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="menu"]',
    content: 'Este é o menu lateral. Aqui você encontra todas as páginas do sistema.',
    placement: 'right',
  },
  {
    target: '[data-tour="ponto"]',
    content: 'Na página de Ponto você pode registrar entrada, saída e pausas.',
    placement: 'right',
  },
  {
    target: '[data-tour="solicitacoes"]',
    content: 'Em Solicitações você pode criar pedidos de atestados e ajustes de ponto. Para reservar sala, use o Calendário.',
    placement: 'right',
  },
  {
    target: '[data-tour="okrs"]',
    content: 'OKRs permite definir e acompanhar objetivos e resultados-chave.',
    placement: 'right',
  },
  {
    target: '[data-tour="feedbacks"]',
    content: 'Aqui você pode solicitar e enviar feedbacks para colegas.',
    placement: 'right',
  },
  {
    target: '[data-tour="theme"]',
    content: 'Alterne entre modo claro e escuro clicando aqui.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="search"]',
    content: 'Use a busca global (Ctrl+K) para encontrar qualquer coisa no sistema rapidamente.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    content: 'Suas notificações aparecem aqui. Clique para ver detalhes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="profile"]',
    content: 'Acesse seu perfil e configurações clicando aqui.',
    placement: 'bottom-end',
  },
];

export function GuidedTour() {
  const { showTour, completeTour } = useTourStore();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      completeTour();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={showTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10B981',
          zIndex: 10000,
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
    />
  );
}
