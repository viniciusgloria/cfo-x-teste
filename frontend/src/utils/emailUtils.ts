// Email utilities for sending notifications
import { useSystemStore } from '../store/systemStore';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  clienteNome: string;
}

// Simulate email sending (in production, this would call an email service)
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // Get email configuration from system store
    const emailConfig = useSystemStore.getState().config.emailConfig;

    // Validate email configuration
    if (!emailConfig.smtpHost || !emailConfig.fromEmail) {
      console.warn('⚠️ Configuração de e-mail não completa. E-mail não enviado.');
      return false;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would be sent to email service using nodemailer or similar:
    // const transporter = nodemailer.createTransporter({
    //   host: emailConfig.smtpHost,
    //   port: emailConfig.smtpPort,
    //   secure: emailConfig.useSSL,
    //   auth: {
    //     user: emailConfig.smtpUser,
    //     pass: emailConfig.smtpPassword
    //   }
    // });
    //
    // await transporter.sendMail({
    //   from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
    //   to: emailData.to,
    //   subject: emailData.subject,
    //   html: emailData.body
    // });

    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return false;
  }
}

// Generate email content for devolução
export function generateDevolutionEmail(clienteNome: string, comentarios: string): EmailData {
  const loginUrl = `${window.location.origin}/login`; // In production, use proper domain

  return {
    to: '', // Will be filled from cliente data
    subject: 'Atenção - Seu cadastro precisa de ajustes!',
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .comments { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CFO Hub - Ajustes Necessários</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${clienteNome}</strong>,</p>

      <p>Seu cadastro foi analisado e identificamos alguns pontos que precisam ser ajustados antes da aprovação.</p>

      <div class="comments">
        <h3>📝 Correções Necessárias:</h3>
        <p>${comentarios.replace(/\n/g, '<br>')}</p>
      </div>

      <p>Para fazer as correções necessárias, acesse nossa plataforma:</p>

      <a href="${loginUrl}" class="button">Acessar Plataforma</a>

      <p>Após realizar os ajustes, reenvie seu cadastro para análise.</p>

      <p>Atenciosamente,<br>
      Equipe CFO Hub</p>
    </div>
    <div class="footer">
      <p>Este é um e-mail automático. Por favor, não responda diretamente.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    clienteNome
  };
}