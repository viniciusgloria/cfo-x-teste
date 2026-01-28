# PRD - CFO X SaaS

**Versão:** 1.0 (Beta)  
**Data de Atualização:** 21 de Janeiro de 2026 (Atualizado: planejamento de desenvolvimento)  
**Status:** 🔄 Em Desenvolvimento - Beta  
**Próximo Release:** Performance Dashboard (/performance) integrado - Estimado: Fevereiro/2026  

---

## 📋 Sumário Executivo

**CFO X SaaS** é uma plataforma SaaS moderna e completa de gestão empresarial desenvolvida para CFOs, contadores e gestores de e-commerce. O sistema fornece ferramentas integradas para gerenciamento de colaboradores, ponto, folha de pagamento, documentos, tarefas, OKRs, relatórios e análises de vendas em tempo real.

**Público-alvo:** Pequenas e médias empresas (PMEs) de e-commerce que necessitam de controle financeiro, RH e análise de vendas integrados.

**Modelo de Negócio:** SaaS com subscrição por empresa (multi-tenant).

---

## 🆕 Atualizações Recentes (21/Jan/2026)

- Rota principal do módulo de performance atualizada para `/performance`, mantendo redirecionamento legado de `/cpa`.
- Planejamento SCRUM iniciado para próximas 6 semanas com foco em: Performance integrada, MVP Integrações API, POC GCP, testes com clientes e wiki inicial.
- Build do frontend validado; bundle Vite ainda >500 kB e requer split de chunks futura.
- Vulnerabilidades mapeadas: `esbuild`/`vite` (moderadas, dependem de upgrade para Vite 7) e `xlsx` (alta, sem patch; avaliar troca por `exceljs`).

---

## 🎯 Objetivos do Produto

### Curto Prazo (v1.0 Beta - Disponível)
- ✅ Plataforma estável com funcionalidades core implementadas
- ✅ Suporte multi-tenant funcional
- ✅ Interface intuitiva e responsiva
- ✅ Autenticação e controle de acesso baseado em funções (RBAC)
- ⏳ Dashboard de vendas em tempo real (CPA) - Estimado: Fim de Janeiro

### Médio Prazo (v1.1+)
- 📋 Integração Omie (estudo em andamento)
- 📋 Sistema de automações personalizáveis
- 📋 Relatórios avançados e exportação de dados
- 📋 Integração com plataformas de e-commerce (Shopify, WooCommerce, etc.)

### Longo Prazo (v2.0+)
- 📋 Mobile app nativa
- 📋 Previsões com IA/ML
- 📋 Sistema de webhooks customizáveis
- 📋 API pública para integrações
- 📋 Suporte em múltiplos idiomas

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

**Frontend:**
- React 18 com TypeScript
- Vite (build tool)
- Tailwind CSS + Dark Mode
- Zustand (state management)
- UI Components customizados

**Backend:**
- FastAPI (Python 3.11+)
- PostgreSQL 16 (banco de dados)
- Redis 7 (cache)
- Autenticação JWT

**Infraestrutura:**
- Docker (desenvolvimento e produção)
- PostgreSQL para persistência
- Redis para cache/sessões
- *Em análise:* Azure ou GCP para produção

**Deployment Atual:**
- Docker Compose local
- Ambiente de desenvolvimento

---

## 📦 Funcionalidades Implementadas (v1.0 Beta)

### 1. **Autenticação e Segurança**
- ✅ Login com email/senha
- ✅ Autenticação JWT com refresh tokens
- ✅ Controle de acesso por perfil (Admin, Gestor, Colaborador, Cliente)
- ✅ Validação de senhas com regras de complexidade
- ✅ Recuperação de senha via e-mail

**Perfis de Acesso:**
- **Administrador:** Acesso total ao sistema + configurações
- **Gestor:** Acesso a recursos selecionados (pode ser customizado)
- **Colaborador:** Acesso limitado a funcionalidades básicas
- **Cliente:** Acesso restrito a dados específicos da empresa

### 2. **Dashboard**
- ✅ Visão geral de métricas principais
- ✅ Widgets customizáveis (planejado para v1.1)
- ✅ Notificações em tempo real
- ✅ Resumo de pendências

### 3. **Gestão de Colaboradores**
- ✅ Cadastro completo de funcionários
- ✅ Perfil com foto e dados pessoais
- ✅ Atribuição de cargos e setores
- ✅ Histórico de alterações
- ✅ Status ativo/inativo
- ✅ Integração com módulo de Ponto

### 4. **Ponto e Frequência**
- ✅ Registro de entrada/saída
- ✅ Visualização de jornada diária
- ✅ Relatório de frequência
- ✅ Solicitações de ajuste (falta, ponto manual, etc)
- ✅ Integração com Folha de Pagamento

### 5. **Folha de Pagamento**
- ✅ Cálculo automático de salários
- ✅ Processamento de descontos (INSS, IR, etc)
- ✅ Gestão de benefícios
- ✅ Geração de recibos (RPA)
- ✅ Exportação para folha de clientes
- ✅ Histórico de folhas processadas

### 6. **Gestão de Clientes**
- ✅ Cadastro de dados dos clientes
- ✅ Contatos e histórico
- ✅ Documentos associados
- ✅ Status e classificação
- ✅ Limites de crédito (planejado v1.1)
- ✅ Integração com módulo de Solicitações

### 7. **Gestão de Documentos**
- ✅ Upload e armazenamento de arquivos
- ✅ Organização em pastas
- ✅ Controle de acesso por documento
- ✅ Histórico de alterações
- ✅ Compartilhamento entre usuários
- ✅ Suporte a múltiplos formatos (PDF, DOC, XLS, etc)

### 8. **Tarefas e To-Do**
- ✅ Criação de tarefas com prazos
- ✅ Atribuição a colaboradores
- ✅ Status e prioridade
- ✅ Comentários e observações
- ✅ Integração com Calendário
- ✅ Notificações de vencimento

### 9. **OKRs (Objectives & Key Results)**
- ✅ Definição de objetivos por período
- ✅ Acompanhamento de resultados-chave
- ✅ Progresso visual (% de conclusão)
- ✅ Alinhamento com empresa/departamento
- ✅ Reviews periódicas
- ✅ Histórico de execução

### 10. **Avaliações de Desempenho**
- ✅ Criação de formulários de avaliação
- ✅ Autoavaliação + Avaliação de gestores
- ✅ Feedback 360°
- ✅ Scores e comparativos
- ✅ Histórico de avaliações
- ✅ Relatórios de performance

### 11. **Benefícios**
- ✅ Cadastro de planos de benefícios
- ✅ Associação a colaboradores
- ✅ Cálculo de valores
- ✅ Integração com folha de pagamento
- ✅ Documentação de benefícios
- ✅ Diferentes tipos (saúde, odonto, transporte, etc)

### 12. **Cargos e Setores**
- ✅ Estrutura organizacional customizável
- ✅ Descrição de cargos
- ✅ Vinculação de colaboradores
- ✅ Hierarquia de setores
- ✅ Responsabilidades por cargo
- ✅ Salários por cargo

### 13. **Solicitações e Aprovações**
- ✅ Fluxo de solicitações (férias, adiantamentos, etc)
- ✅ Aprovação escalonada
- ✅ Histórico de solicitações
- ✅ Status: Pendente, Aprovado, Recusado
- ✅ Notificações de aprovação
- ✅ Integração com folha de pagamento (adiantamentos)

### 14. **Lembretes**
- ✅ Agendamento de lembretes
- ✅ Lembretes automáticos (aniversários, vencimentos, etc)
- ✅ Categorização
- ✅ Histórico
- ✅ Notificações push/email

### 15. **Mural/Feed Interno**
- ✅ Comunicação interna
- ✅ Publicação de avisos
- ✅ Comentários e reações
- ✅ Alcance por grupo/departamento
- ✅ Feed de notícias da empresa

### 16. **Chat Interno**
- ✅ Comunicação em tempo real entre usuários
- ✅ Conversas diretas 1:1
- ✅ Grupos/canais de discussão
- ✅ Histórico de mensagens
- ✅ Notificações de novas mensagens
- ✅ Compartilhamento de documentos em chat

### 17. **Feedbacks**
- ✅ Sistema de feedback entre colaboradores
- ✅ Feedback anônimo
- ✅ Categorização (comportamental, técnico, etc)
- ✅ Histórico e trending
- ✅ Integração com avaliações de desempenho

### 18. **Notificações**
- ✅ Sistema centralizado de notificações
- ✅ Notificações por email
- ✅ Notificações in-app
- ✅ Configuração de preferências
- ✅ Histórico de notificações
- ✅ Filtros e categorização

### 19. **Configurações de Sistema**
- ✅ Gerenciamento de dados da empresa
- ✅ Gestão de usuários e permissões
- ✅ **Configuração SMTP para e-mails** (Novo - v1.0)
  - Host SMTP customizável
  - Porta configurável (1-65535)
  - Credenciais de autenticação
  - Opções TLS/SSL
  - E-mail do remetente
  - Nome do remetente
  - E-mail para notificações do sistema
  - *(Próx. v2.0)* Teste de conexão SMTP (UI pronta, backend em estudo)
  - *(Próx. v2.0)* Envio de e-mail de teste
- ✅ Integração com Omie (Em estudo)
- ✅ Gestão de recursos globais (ativa/desativa funcionalidades)
- ✅ Sistema de permissões por role
- ✅ Backup e exportação de dados (planejado v1.1)

### 20. **Relatórios**
- ✅ Relatório de frequência
- ✅ Relatório de ponto
- ✅ Relatório de folha de pagamento
- ✅ Relatório de avaliações
- ✅ Relatório de OKRs
- ✅ Exportação em PDF/Excel (parcial)

### 21. **Automações** *(Em Desenvolvimento)*
- 🔄 Sistema de automações personalizáveis
- 🔄 Triggers de eventos
- 🔄 Ações customizáveis
- 🔄 Integração com notificações
- 🔄 *(Próx. v1.1)* Fluxos de aprovação automatizados
- 🔄 *(Próx. v1.2)* Integração com integrações externas

---

## 🎯 Próximas Funcionalidades (Roadmap)

### 🚀 **CPA Dashboard** (Estimado: Fim de Janeiro/2026)
**Status:** Em Desenvolvimento  
**Público:** E-commerce e varejistas

**Descrição:**
Dashboard de vendas em tempo real que consolida dados de múltiplas plataformas de e-commerce, exibindo:
- Vendas do dia/semana/mês
- Conversão por canal
- Ticket médio
- Crescimento comparativo
- Análise por produto
- Performance por região
- ROI por campanha (quando integrado)

**Plataformas Suportadas (Fase 1):**
- Shopify
- WooCommerce
- *(Em discussão)* Magento
- *(Em discussão)* Nuvemshop

**Campos Necessários:**
- API keys de integração
- Mapeamento de dados
- Conversão de moedas
- Sincronização em tempo real

**Requisitos Técnicos:**
- Backend: WebSockets para real-time
- Frontend: Gráficos interativos (Chart.js/Recharts)
- Cache Redis para performance
- Job queue para sync de dados

---

### 📊 **Integração Omie** (Planejado v1.1)
**Status:** Em Estudo

**Escopo a Definir:**
- Sincronização de clientes
- Sincronização de produtos
- Sincronização de pedidos
- Integração de fiscal/NF-e
- Sincronização de contas a receber
- Importação de dados contábeis

**Próximos Passos:**
- [ ] Análise da API Omie
- [ ] Definição de fluxos de integração
- [ ] Especificação técnica
- [ ] Desenvolvimento
- [ ] Testes QA

---

### 🤖 **Automações Avançadas** (Planejado v1.1+)
- Fluxos de aprovação customizáveis
- Automação de notificações por eventos
- Integração com webhooks
- Triggers baseados em data/hora
- Actions em cascata

---

### 📱 **Mobile App** (v2.0)
- App nativa iOS
- App nativa Android
- Sincronização offline
- Push notifications
- Acesso a funcionalidades core

---

### 🌐 **Integrações Adicionais** (v1.1+)
- Shopify
- WooCommerce
- Magento
- Nuvemshop
- APIs customizadas

---

### 📈 **IA e Machine Learning** (v2.0+)
- Previsões de vendas
- Detecção de anomalias
- Recomendações inteligentes
- Análise preditiva de churn

---

##   Especificações Técnicas para Desenvolvimento

### 📧 Teste de Conexão SMTP (Prioridade: ALTA - v1.1)

#### Status Atual
- ✅ **Frontend:** Interface e lógica prontas em `Configuracoes.tsx`
- ✅ **Estados:** `testingConnection`, `testResult` implementados
- ✅ **Função:** `handleTestSMTPConnection()` criada e aguardando integração
- ❌ **Backend:** Endpoint `/api/email/test-connection` a implementar

#### Especificação da API

**Endpoint:**
```http
POST /api/email/test-connection
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUser": "usuario@gmail.com",
  "smtpPassword": "senha_de_app",
  "useTLS": true,
  "useSSL": false
}
```

**Response (Sucesso - 200):**
```json
{
  "success": true,
  "message": "Conexão SMTP estabelecida com sucesso!",
  "details": {
    "host": "smtp.gmail.com",
    "port": 587,
    "authenticated": true,
    "responseTime": "1250ms"
  }
}
```

**Response (Erro - 400/500):**
```json
{
  "success": false,
  "message": "Falha ao conectar ao servidor SMTP. Verifique as credenciais.",
  "error": {
    "code": "AUTH_FAILED",
    "details": "Invalid SMTP credentials"
  }
}
```

#### Implementação Backend (Python/FastAPI)

**Pseudocódigo:**
```python
@router.post("/email/test-connection")
async def test_smtp_connection(
    config: SMTPTestRequest,
    current_user: User = Depends(get_current_user)
) -> SMTPTestResponse:
    """
    Testa a conexão com servidor SMTP
    
    Validações:
    - Usuário deve ser admin
    - Host deve ser resolvível
    - Porta deve estar acessível
    - Credenciais devem ser válidas
    """
    try:
        # 1. Validações básicas
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin only")
        
        # 2. Tentar conectar ao servidor SMTP
        import smtplib
        
        server = smtplib.SMTP(config.smtpHost, config.smtpPort, timeout=10)
        
        if config.useTLS:
            server.starttls()
        elif config.useSSL:
            server = smtplib.SMTP_SSL(config.smtpHost, config.smtpPort, timeout=10)
        
        # 3. Tentar autenticar
        server.login(config.smtpUser, config.smtpPassword)
        server.quit()
        
        # 4. Retornar sucesso
        return SMTPTestResponse(
            success=True,
            message="Conexão SMTP estabelecida com sucesso!",
            details={
                "host": config.smtpHost,
                "port": config.smtpPort,
                "authenticated": True,
                "responseTime": "X ms"
            }
        )
        
    except smtplib.SMTPAuthenticationError:
        return SMTPTestResponse(
            success=False,
            message="Falha ao autenticar. Verifique usuário/senha.",
            error={"code": "AUTH_FAILED", "details": str(e)}
        )
    except smtplib.SMTPException as e:
        return SMTPTestResponse(
            success=False,
            message="Erro ao conectar ao servidor SMTP.",
            error={"code": "CONNECTION_ERROR", "details": str(e)}
        )
    except Exception as e:
        return SMTPTestResponse(
            success=False,
            message="Erro desconhecido ao testar SMTP.",
            error={"code": "UNKNOWN_ERROR", "details": str(e)}
        )
```

#### Implementação Frontend (Já Pronta)

**Função existente em `Configuracoes.tsx`:**
```typescript
const handleTestSMTPConnection = async () => {
  const errors: Record<string, string> = {};

  // Validações
  if (!emailConfig.smtpHost.trim()) errors.smtpHost = 'Host SMTP é obrigatório';
  if (!emailConfig.smtpPort || emailConfig.smtpPort <= 0) errors.smtpPort = 'Porta SMTP deve ser maior que 0';

  setEmailErrors(errors);

  if (Object.keys(errors).length > 0) {
    setTestResult({success: false, message: 'Preencha os campos obrigatórios'});
    return;
  }

  setTestingConnection(true);
  setTestResult(null);

  try {
    // INTEGRAÇÃO: Chamar endpoint do backend
    const response = await fetch('/api/email/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` // Obter do localStorage/context
      },
      body: JSON.stringify({
        smtpHost: emailConfig.smtpHost,
        smtpPort: emailConfig.smtpPort,
        smtpUser: emailConfig.smtpUser,
        smtpPassword: emailConfig.smtpPassword,
        useTLS: emailConfig.useTLS,
        useSSL: emailConfig.useSSL
      })
    });

    const data = await response.json();

    if (data.success) {
      setTestResult({
        success: true,
        message: `✅ ${data.message} (Tempo: ${data.details.responseTime})`
      });
      toast.success('Conexão testada com sucesso');
    } else {
      setTestResult({
        success: false,
        message: `❌ ${data.message}`
      });
      toast.error(data.message);
    }
  } catch (error) {
    setTestResult({
      success: false,
      message: 'Erro ao testar conexão. Verifique sua conexão de internet.'
    });
    toast.error('Erro ao testar conexão');
  } finally {
    setTestingConnection(false);
  }
};
```

#### Models Necessários (Backend)

```python
# schemas/email.py
from pydantic import BaseModel, Field

class SMTPTestRequest(BaseModel):
    smtpHost: str = Field(..., min_length=1)
    smtpPort: int = Field(..., ge=1, le=65535)
    smtpUser: str = Field(default="")
    smtpPassword: str = Field(default="")
    useTLS: bool = Field(default=True)
    useSSL: bool = Field(default=False)

class SMTPTestDetails(BaseModel):
    host: str
    port: int
    authenticated: bool
    responseTime: str

class SMTPTestResponse(BaseModel):
    success: bool
    message: str
    details: Optional[SMTPTestDetails] = None
    error: Optional[dict] = None
```

#### Testes Necessários

**Testes Unitários (Backend):**
```python
# tests/test_email.py
def test_smtp_connection_success():
    """Testa conexão bem-sucedida com SMTP válido"""
    pass

def test_smtp_connection_invalid_host():
    """Testa erro com host inválido"""
    pass

def test_smtp_connection_invalid_credentials():
    """Testa erro com credenciais inválidas"""
    pass

def test_smtp_connection_auth_required():
    """Testa se requer autenticação de admin"""
    pass

def test_smtp_connection_timeout():
    """Testa timeout na conexão"""
    pass
```

**Testes Manuais:**
- [ ] Testar com Gmail (TLS)
- [ ] Testar com Outlook (TLS)
- [ ] Testar com Yahoo (SSL)
- [ ] Testar com host inválido
- [ ] Testar com credenciais erradas
- [ ] Testar com porta bloqueada
- [ ] Verificar tempo de resposta
- [ ] Verificar feedback visual no frontend

#### Checklist de Implementação

- [ ] Criar endpoint `/api/email/test-connection` no backend
- [ ] Implementar lógica de conexão SMTP
- [ ] Adicionar tratamento de erros específicos
- [ ] Criar models Pydantic (SMTPTestRequest, SMTPTestResponse)
- [ ] Integrar endpoint no frontend (chamar via fetch)
- [ ] Testar com provedores reais (Gmail, Outlook, Yahoo)
- [ ] Adicionar logs de debug
- [ ] Documentar no Swagger/OpenAPI
- [ ] Adicionar testes automatizados
- [ ] Code review
- [ ] Deploy em staging
- [ ] Testes de carga

#### Notas de Segurança

⚠️ **Importante:**
- Nunca armazene senhas em logs
- Use timeouts para evitar hanging connections
- Validar entrada para SMTP injection attacks
- Limitar requisições de teste (rate limiting)
- Requer autenticação de admin
- Não exponha detalhes técnicos em erro responses públicas

---

### 📧 Envio de E-mail de Teste (v1.1+)

**Status:** Não iniciado

**Descrição:** Após configuração SMTP, permitir envio de e-mail de teste para validar configuração completa end-to-end.

**Endpoint necessário:**
```http
POST /api/email/send-test
```

**Fields:**
- `toEmail`: E-mail destinatário para teste
- Padrão: E-mail do usuário logado

---

### 📊 Dashboard de Histórico de E-mails (v1.2+)

**Status:** Não iniciado

**Descrição:** Visualizar histórico de e-mails enviados pelo sistema com status e logs.

**Dados a rastrear:**
- Data/hora do envio
- Destinatário
- Assunto
- Tipo (notificação, aprovação, etc)
- Status (enviado, falha, pendente)
- Logs de erro

---

### 🎨 Templates de E-mail (v1.2+)

**Status:** Não iniciado

**Descrição:** Interface visual para customizar templates por tipo de notificação.

**Tipos suportados:**
- Devolução de Cadastro
- Aprovação de Processo
- Lembrete de Tarefa
- Alerta Crítico
- Bem-vindo (novo usuário)

**Melhoria Futura (v1.3+):** Edição de corpo dos templates para despachos automáticos do sistema
- Interface de edição visual para corpos de email
- Suporte a placeholders dinâmicos (nome, empresa, etc.)
- Preview em tempo real das alterações
- Validação de HTML/template
- Backup de versões anteriores
- Controle de permissões (apenas admin)

---

### 🔀 Múltiplas Contas SMTP (v1.3+)

**Status:** Não iniciado

**Descrição:** Configurar múltiplas contas SMTP para diferentes tipos de notificação.

### Perfis Implementados

#### **Administrador (Admin)**
- Acesso total a todos os módulos
- Configuração de sistema
- Gestão de usuários
- Permissões de todos os outros perfis
- Sem limitações

#### **Gestor**
- Acesso a módulos selecionáveis via permissões
- Módulos padrão: Colaboradores, Ponto, Folha, Documentos, Tarefas, OKRs, Avaliações, Benefícios, Cargos, Setores
- Pode não ter acesso a: Configurações, Omie, Automações (configuráveis)
- Permissões customizáveis por admin

#### **Colaborador**
- Acesso limitado
- Módulos padrão: Tarefas, Ponto, Chat, Mural, Lembretes, Meu Perfil
- Pode visualizar: Calendário, OKRs (próprios), Benefícios (próprios)
- Sem acesso a: Configurações, Folha, Clientes, Avaliações (alheias), Admin
- Permissões customizáveis

#### **Cliente**
- Acesso muito limitado
- Módulos padrão: Documentos (compartilhados), Chat (com gestor), Meu Perfil
- Sem acesso a: Configurações, RH, Financeiro, Colaboradores
- Permissões customizáveis

### Sistema de Permissões (v1.0 Beta)
- ✅ Controle granular por módulo
- ✅ Ativação/desativação de recursos globais
- ✅ Customização por role
- ✅ Persistência em localStorage (frontend) + banco (backend)
- ✅ Interface visual na aba Permissões

---

## 🔐 Segurança

### Implementado
- ✅ Autenticação JWT com refresh tokens
- ✅ Hash de senhas (algoritmo moderno)
- ✅ Validação de entrada em frontend
- ✅ CORS configurado
- ✅ Proteção CSRF
- ✅ Validação de autorização por rota
- ✅ Logs de atividades (planejado v1.1)

### Planejado
- 📋 Auditoria completa
- 📋 Two-factor authentication (2FA)
- 📋 SSO (Single Sign-On)
- 📋 Criptografia de dados sensíveis
- 📋 Backup automático criptografado

---

## 📊 Modelos de Dados Principais

### Entidades Core

```
Empresa (tenant)
├── Usuários
├── Colaboradores
├── Clientes
├── Cargos
├── Setores
├── Documentos
├── Tarefas
├── OKRs
├── Avaliações
├── Benefícios
├── Ponto
├── Folha de Pagamento
├── Solicitações
├── Lembretes
├── Mural
├── Chat
├── Feedbacks
└── Configurações
```

---

## 📈 Métricas e KPIs

### Métricas de Adoção
- Usuários ativos por mês
- Taxa de retenção
- Módulos mais utilizados
- Tempo médio em sessão

### Métricas de Performance
- Tempo de resposta das APIs
- Taxa de erro (5xx, 4xx)
- Uptime da plataforma
- Tempo de carregamento das páginas

### Métricas de Negócio (Futuro)
- MRR (Monthly Recurring Revenue)
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- Churn rate

---

## 🧪 Estratégia de Testes

### Testes Implementados
- ✅ Validações de frontend
- ✅ Validações de backend (parcial)
- ✅ Testes manuais em desenvolvimento

### Testes Planejados (v1.1)
- 📋 Testes unitários (backend)
- 📋 Testes de integração (API)
- 📋 Testes e2e (frontend)
- 📋 Testes de carga
- 📋 Testes de segurança

---

## 📋 Documentação

### Documentação Existente
- ✅ README.md - Quick Start
- ✅ COMANDOS.md - Documentação de comandos
- ✅ Código comentado

### Documentação Planejada
- 📋 API Documentation (Swagger/OpenAPI)
- 📋 Guia do Usuário (manual)
- 📋 Documentação de Desenvolvimento
- 📋 Troubleshooting Guide

---

## 🚀 Plano de Deploy e Hospedagem

### Desenvolvimento (Atual)
- Docker Compose local
- Ambiente isolado
- Banco PostgreSQL local + Redis

### Staging (Próximo)
- *(Planejado v1.0 final)*
- Ambiente similar a produção
- Para testes de QA

### Produção (Futuro)
- **Plataforma em análise:**
  - Azure (em avaliação)
  - GCP (em avaliação)
  - *(Possível)* AWS
  
- **Requisitos:**
  - PostgreSQL gerenciado
  - Redis gerenciado
  - CDN para assets
  - Auto-scaling
  - Backup automático
  - Monitoramento 24/7

---

## 💰 Modelo de Negócio

### Proposta de Valor
- **Para CFOs/Contadores:** Automação de processos RH e financeiros
- **Para Gestores:** Visão centralizada de indicadores e equipe
- **Para E-commerce:** Dashboard de vendas em tempo real (CPA)

### Plano de Preços (A Definir)
- *(Não implementado nesta versão)*
- Baseado em: Número de usuários, funcionalidades, volume de dados
- Tiers: Starter, Professional, Enterprise (sugestão)

---

## 📅 Timeline e Roadmap

### Beta (Atual - Janeiro/2026)
- ✅ v1.0 Beta - Funcionalidades core
- ⏳ CPA Dashboard - Estimado: Fim de Janeiro
- ⏳ Correções de bugs

### v1.0 Release (Estimado: Fevereiro/2026)
- [ ] CPA Dashboard completo
- [ ] QA e testes finais
- [ ] Documentação final
- [ ] Deploy em staging
- [ ] Testes com clientes beta

### v1.1+ (Após v1.0)
- [ ] Integração Omie
- [ ] Automações avançadas
- [ ] Relatórios aprimorados
- [ ] Integrações de e-commerce
- [ ] Testes automatizados

### v2.0 (Longo Prazo)
- [ ] Mobile apps
- [ ] IA/ML
- [ ] APIs públicas
- [ ] SSO/2FA
- [ ] Multi-idioma

---

## 👥 Stakeholders

| Papel | Responsabilidade |
|-------|-----------------|
| **Product Manager** | Visão e priorização |
| **Tech Lead Backend** | Arquitetura backend, APIs |
| **Tech Lead Frontend** | Arquitetura frontend, UI/UX |
| **QA Lead** | Estratégia de testes, quality gates |
| **DevOps** | Infraestrutura, deploy, monitoring |

---

## 📞 Contato e Suporte

- **Issue Tracking:** (A definir - GitHub Issues, Jira, etc)
- **Documentação:** README.md, PRD.md (este arquivo)
- **Ambiente Local:** Veja README.md para setup
- **Integração Contínua:** (Planejado para v1.0)

---

## 📝 Notas Importantes

### Status Beta
- Sistema em fase de teste
- Funcionalidades podem mudar
- Performance não otimizada para produção
- Backups não garantidos

### Próximos Passos Críticos
1. ⏳ Finalizar tela de Performance com integração backend/DB e dados reais
2. ⏳ Desenvolver MVP de Integrações API
3. ⏳ POC de hospedagem no GCP com hardening básico de segurança
4. ⏳ Testes com clientes beta e wiki inicial do sistema

### Comunicação com Clientes
- Documentar status beta claramente
- Recolher feedback regularmente
- Comunicar roadmap e timelines

---

## 📚 Apêndices

### A. Tecnologias Utilizadas
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend:** FastAPI, Python 3.11+, PostgreSQL, Redis
- **DevOps:** Docker, Docker Compose
- **Comunicação:** JWT, WebSockets (para CPA real-time)

### B. Integrações Futuras
- Shopify API
- WooCommerce REST API
- Omie API (em estudo)
- Nuvemshop API
- Webhook receivers

### C. Referências Externas
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Versão:** 1.0 Beta  
**Última Atualização:** 21 de Janeiro de 2026  
**Próxima Revisão:** Após lançamento do Performance Dashboard integrado

---

**Última Atualização:** 21 de Janeiro de 2026 (Atualizado: planejamento de desenvolvimento)
