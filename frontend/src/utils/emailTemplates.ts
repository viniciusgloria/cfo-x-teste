/**
 * Centralização de templates de email do sistema
 * Contém todos os tipos de email com seus assuntos e corpos
 *
 * Como usar:
 * import { processEmailTemplate, EMAIL_TEMPLATES } from './utils/emailTemplates';
 *
 * const { subject, body } = processEmailTemplate('WELCOME_NEW_USER', {
 *   nome: 'João Silva',
 *   email: 'joao@email.com',
 *   senha: 'Temp123',
 *   link_acesso: 'https://app.com/login'
 * });
 */

export interface EmailTemplate {
  subject: string;
  body: string;
  placeholders?: string[]; // Lista de placeholders que devem ser substituídos
}

export const EMAIL_TEMPLATES = {
  // Boas vindas para novo usuário
  WELCOME_NEW_USER: {
    subject: 'Bem-vindo ao CFO X - Sua conta foi criada!',
    body: `
Olá {{nome}},

Bem-vindo ao CFO X! Sua conta foi criada com sucesso.

**Credenciais de Acesso:**
- **E-mail:** {{email}}
- **Senha temporária:** {{senha}}

**Importante:** No seu primeiro acesso à plataforma, você será solicitado a alterar sua senha por uma de sua preferência.

**Link de acesso:** {{link_acesso}}

Para acessar o sistema:
1. Acesse o link acima
2. Use seu e-mail e a senha temporária
3. Siga as instruções para alterar sua senha

{{documentos_section}}

Se você tiver dúvidas ou precisar de suporte, entre em contato conosco.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'email', 'senha', 'link_acesso', 'documentos_section']
  } as EmailTemplate,

  // Boas vindas específico para Administrador
  WELCOME_ADMIN: {
    subject: 'CFO X - Conta de Administrador Criada',
    body: `
Olá {{nome}},

Sua conta de **Administrador** no CFO X foi criada com sucesso!

**Credenciais de Acesso:**
- **E-mail:** {{email}}
- **Senha temporária:** {{senha}}

**Como Administrador, você terá acesso completo ao sistema:**
- Configuração de módulos e recursos globais
- Gerenciamento de usuários e permissões
- Acesso a todas as funcionalidades administrativas
- Relatórios e analytics completos

**Importante:** No seu primeiro acesso à plataforma, você será solicitado a alterar sua senha por uma de sua preferência.

**Link de acesso:** {{link_acesso}}

Para acessar o sistema:
1. Acesse o link acima
2. Use seu e-mail e a senha temporária
3. Siga as instruções para alterar sua senha

Como administrador, recomendamos que você configure primeiro os recursos globais do sistema na aba "Permissões".

Se você tiver dúvidas ou precisar de suporte, entre em contato conosco.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'email', 'senha', 'link_acesso']
  } as EmailTemplate,

  // Boas vindas específico para Gestor
  WELCOME_GESTOR: {
    subject: 'CFO X - Conta de Gestor Criada',
    body: `
Olá {{nome}},

Sua conta de **Gestor** no CFO X foi criada com sucesso!

**Credenciais de Acesso:**
- **E-mail:** {{email}}
- **Senha temporária:** {{senha}}

**Como Gestor, você terá acesso às seguintes funcionalidades:**
- Gerenciamento de sua equipe
- Aprovação de solicitações e afastamentos
- Acompanhamento de tarefas e projetos
- Avaliações de desempenho
- Relatórios de equipe

**Importante:** No seu primeiro acesso à plataforma, você será solicitado a alterar sua senha por uma de sua preferência.

**Link de acesso:** {{link_acesso}}

Para acessar o sistema:
1. Acesse o link acima
2. Use seu e-mail e a senha temporária
3. Siga as instruções para alterar sua senha

{{documentos_section}}

Se você tiver dúvidas ou precisar de suporte, entre em contato conosco.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'email', 'senha', 'link_acesso', 'documentos_section']
  } as EmailTemplate,

  // Boas vindas específico para Colaborador
  WELCOME_COLABORADOR: {
    subject: 'CFO X - Conta de Colaborador Criada',
    body: `
Olá {{nome}},

Sua conta de **Colaborador** no CFO X foi criada com sucesso!

**Credenciais de Acesso:**
- **E-mail:** {{email}}
- **Senha temporária:** {{senha}}

**Como Colaborador, você terá acesso às seguintes funcionalidades:**
- Registro de ponto
- Solicitações de afastamento
- Gerenciamento de tarefas
- Feedbacks e avaliações
- Comunicação interna

**Importante:** No seu primeiro acesso à plataforma, você será solicitado a alterar sua senha por uma de sua preferência.

**Link de acesso:** {{link_acesso}}

Para acessar o sistema:
1. Acesse o link acima
2. Use seu e-mail e a senha temporária
3. Siga as instruções para alterar sua senha

{{documentos_section}}

Se você tiver dúvidas ou precisar de suporte, entre em contato conosco.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'email', 'senha', 'link_acesso', 'documentos_section']
  } as EmailTemplate,

  // Boas vindas específico para Cliente
  WELCOME_CLIENTE: {
    subject: 'CFO X - Acesso ao Portal do Cliente',
    body: `
Olá {{nome}},

Seu acesso ao **Portal do Cliente** do CFO X foi criado com sucesso!

**Credenciais de Acesso:**
- **E-mail:** {{email}}
- **Senha temporária:** {{senha}}
- **Empresa:** {{empresa}}

**Como Cliente, você terá acesso ao:**
- Portal dedicado para sua empresa
- Acompanhamento de projetos e tarefas
- Comunicação direta com a equipe
- Relatórios e entregáveis
- Histórico de interações

**Importante:** No seu primeiro acesso à plataforma, você será solicitado a alterar sua senha por uma de sua preferência.

**Link de acesso:** {{link_acesso}}

Para acessar o portal:
1. Acesse o link acima
2. Use seu e-mail e a senha temporária
3. Siga as instruções para alterar sua senha

Se você tiver dúvidas ou precisar de suporte, entre em contato conosco.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'email', 'senha', 'link_acesso', 'empresa']
  } as EmailTemplate,

  // Recuperação de senha
  PASSWORD_RESET: {
    subject: 'CFO X - Recuperação de Senha',
    body: `
Olá {{nome}},

Recebemos uma solicitação de recuperação de senha para sua conta no CFO X.

Para redefinir sua senha, clique no link abaixo:
{{link_reset}}

Este link é válido por 1 hora. Se você não solicitou esta recuperação, ignore este e-mail.

Se o link não funcionar, copie e cole a URL completa no seu navegador.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'link_reset']
  } as EmailTemplate,

  // Confirmação de alteração de senha
  PASSWORD_CHANGED: {
    subject: 'CFO X - Senha Alterada com Sucesso',
    body: `
Olá {{nome}},

Sua senha no CFO X foi alterada com sucesso.

Se você não reconhece esta alteração, entre em contato conosco imediatamente.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome']
  } as EmailTemplate,

  // Notificação de tarefa atribuída
  TASK_ASSIGNED: {
    subject: 'CFO X - Nova Tarefa Atribuída',
    body: `
Olá {{nome}},

Uma nova tarefa foi atribuída a você no CFO X.

**Detalhes da Tarefa:**
- **Título:** {{titulo_tarefa}}
- **Descrição:** {{descricao_tarefa}}
- **Prazo:** {{prazo}}
- **Atribuído por:** {{atribuido_por}}

Acesse o sistema para visualizar todos os detalhes e acompanhar o progresso.

**Link direto:** {{link_tarefa}}

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'titulo_tarefa', 'descricao_tarefa', 'prazo', 'atribuido_por', 'link_tarefa']
  } as EmailTemplate,

  // Lembrete de tarefa pendente
  TASK_REMINDER: {
    subject: 'CFO X - Lembrete: Tarefa Pendente',
    body: `
Olá {{nome}},

Este é um lembrete sobre a tarefa pendente no CFO X.

**Detalhes da Tarefa:**
- **Título:** {{titulo_tarefa}}
- **Prazo:** {{prazo}}
- **Status atual:** {{status}}

Acesse o sistema para atualizar o status da tarefa.

**Link direto:** {{link_tarefa}}

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'titulo_tarefa', 'prazo', 'status', 'link_tarefa']
  } as EmailTemplate,

  // Notificação de feedback recebido
  FEEDBACK_RECEIVED: {
    subject: 'CFO X - Novo Feedback Recebido',
    body: `
Olá {{nome}},

Você recebeu um novo feedback no CFO X.

**Detalhes do Feedback:**
- **Tipo:** {{tipo_feedback}}
- **De:** {{remetente}}
- **Data:** {{data}}

Acesse o sistema para visualizar o feedback completo.

**Link direto:** {{link_feedback}}

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'tipo_feedback', 'remetente', 'data', 'link_feedback']
  } as EmailTemplate,

  // Aprovação de documento
  DOCUMENT_APPROVED: {
    subject: 'CFO X - Documento Aprovado',
    body: `
Olá {{nome}},

Seu documento "{{nome_documento}}" foi aprovado no CFO X.

**Detalhes:**
- **Documento:** {{nome_documento}}
- **Aprovado por:** {{aprovador}}
- **Data da aprovação:** {{data_aprovacao}}

Você agora pode prosseguir com os próximos passos do processo.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'nome_documento', 'aprovador', 'data_aprovacao']
  } as EmailTemplate,

  // Rejeição de documento
  DOCUMENT_REJECTED: {
    subject: 'CFO X - Documento Rejeitado',
    body: `
Olá {{nome}},

Infelizmente, seu documento "{{nome_documento}}" foi rejeitado no CFO X.

**Detalhes:**
- **Documento:** {{nome_documento}}
- **Rejeitado por:** {{rejeitor}}
- **Data da rejeição:** {{data_rejeicao}}
- **Motivo:** {{motivo_rejeicao}}

Por favor, faça as correções necessárias e reenvie o documento.

**Link para correção:** {{link_documento}}

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'nome_documento', 'rejeitor', 'data_rejeicao', 'motivo_rejeicao', 'link_documento']
  } as EmailTemplate,

  // Solicitação de afastamento aprovada
  LEAVE_APPROVED: {
    subject: 'CFO X - Solicitação de Afastamento Aprovada',
    body: `
Olá {{nome}},

Sua solicitação de afastamento foi aprovada no CFO X.

**Detalhes do Afastamento:**
- **Tipo:** {{tipo_afastamento}}
- **Período:** {{periodo}}
- **Aprovado por:** {{aprovador}}
- **Data da aprovação:** {{data_aprovacao}}

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'tipo_afastamento', 'periodo', 'aprovador', 'data_aprovacao']
  } as EmailTemplate,

  // Solicitação de afastamento rejeitada
  LEAVE_REJECTED: {
    subject: 'CFO X - Solicitação de Afastamento Rejeitada',
    body: `
Olá {{nome}},

Infelizmente, sua solicitação de afastamento foi rejeitada no CFO X.

**Detalhes:**
- **Tipo:** {{tipo_afastamento}}
- **Período solicitado:** {{periodo}}
- **Rejeitado por:** {{rejeitor}}
- **Motivo:** {{motivo_rejeicao}}

Se tiver dúvidas, entre em contato com seu gestor.

Atenciosamente,
Equipe CFO X
    `.trim(),
    placeholders: ['nome', 'tipo_afastamento', 'periodo', 'rejeitor', 'motivo_rejeicao']
  } as EmailTemplate
} as const;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;

/**
 * Função utilitária para processar template com dados
 */
export function processEmailTemplate(
  templateKey: EmailTemplateKey,
  data: Record<string, string>
): { subject: string; body: string } {
  const template = EMAIL_TEMPLATES[templateKey];

  let subject = template.subject;
  let body = template.body;

  // Substituir placeholders
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    body = body.replace(new RegExp(placeholder, 'g'), value);
  });

  return { subject, body };
}

/**
 * Função para enviar email de boas vindas para novo usuário
 * Escolhe o template apropriado baseado no role do usuário
 */
export function getWelcomeEmailData(
  userName: string,
  userEmail: string,
  tempPassword: string,
  userRole: string,
  requiredDocuments?: string[],
  company?: string
): { subject: string; body: string } {
  let templateKey: EmailTemplateKey;
  let documentosSection = '';

  // Escolher template baseado no role
  switch (userRole.toLowerCase()) {
    case 'admin':
    case 'administrador':
      templateKey = 'WELCOME_ADMIN';
      break;
    case 'gestor':
      templateKey = 'WELCOME_GESTOR';
      // Gestores também podem ter documentos obrigatórios
      if (requiredDocuments && requiredDocuments.length > 0) {
        documentosSection = '\n**Documentos Obrigatórios:**\nPor favor, faça upload dos seguintes documentos obrigatórios:\n' +
          requiredDocuments.map(doc => '- ' + doc).join('\n') + '\n';
      }
      break;
    case 'colaborador':
      templateKey = 'WELCOME_COLABORADOR';
      // Colaboradores têm documentos obrigatórios
      if (requiredDocuments && requiredDocuments.length > 0) {
        documentosSection = '\n**Documentos Obrigatórios:**\nPor favor, faça upload dos seguintes documentos obrigatórios:\n' +
          requiredDocuments.map(doc => '- ' + doc).join('\n') + '\n';
      }
      break;
    case 'cliente':
      templateKey = 'WELCOME_CLIENTE';
      break;
    default:
      templateKey = 'WELCOME_NEW_USER';
      if (requiredDocuments && requiredDocuments.length > 0) {
        documentosSection = '\n**Documentos Obrigatórios:**\nPor favor, faça upload dos seguintes documentos obrigatórios:\n' +
          requiredDocuments.map(doc => '- ' + doc).join('\n') + '\n';
      }
  }

  // Preparar dados do template
  const templateData: Record<string, string> = {
    nome: userName,
    email: userEmail,
    senha: tempPassword,
    link_acesso: 'https://cfo-hub.com/login', // Pode ser configurável
  };

  // Adicionar campos específicos por template
  if (templateKey === 'WELCOME_CLIENTE' && company) {
    templateData.empresa = company;
  }

  if (['WELCOME_GESTOR', 'WELCOME_COLABORADOR', 'WELCOME_NEW_USER'].includes(templateKey)) {
    templateData.documentos_section = documentosSection;
  }

  return processEmailTemplate(templateKey, templateData);
}