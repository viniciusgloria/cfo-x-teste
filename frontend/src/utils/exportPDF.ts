import { Tarefa } from '../types';

export const exportTarefaToPDF = (tarefa: Tarefa, colaboradoresInfo: any[]): boolean => {
  // Criar janela de impressão com HTML formatado
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    return false;
  }

  const statusLabels = {
    a_fazer: 'A Fazer',
    fazendo: 'Fazendo',
    feito: 'Feito'
  };

  const prioridadeLabels = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente'
  };

  const prioridadeColors = {
    baixa: '#3b82f6',
    media: '#f59e0b',
    alta: '#f97316',
    urgente: '#ef4444'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Tarefa - ${tarefa.titulo}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          color: #1f2937;
          line-height: 1.6;
        }
        h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #111827;
        }
        .metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin: 20px 0;
          padding: 15px;
          background: #f3f4f6;
          border-radius: 8px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .meta-label {
          font-weight: 600;
          color: #6b7280;
        }
        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
        .status-badge {
          background: #dbeafe;
          color: #1e40af;
        }
        .priority-badge {
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
        }
        .section {
          margin: 25px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }
        .description {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          white-space: pre-wrap;
        }
        .checklist-item {
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #9ca3af;
          border-radius: 3px;
          display: inline-block;
        }
        .checkbox.checked {
          background: #10b981;
          border-color: #10b981;
          position: relative;
        }
        .checkbox.checked::after {
          content: '✓';
          color: white;
          position: absolute;
          left: 2px;
          top: -2px;
          font-size: 12px;
        }
        .comment {
          background: #fef3c7;
          padding: 12px;
          margin: 8px 0;
          border-radius: 8px;
          border-left: 3px solid #f59e0b;
        }
        .comment-author {
          font-weight: 600;
          color: #92400e;
          margin-bottom: 4px;
        }
        .comment-date {
          font-size: 12px;
          color: #78350f;
        }
        .tag {
          display: inline-block;
          padding: 4px 10px;
          margin: 4px;
          border-radius: 12px;
          background: #e5e7eb;
          font-size: 12px;
        }
        .colaborador {
          display: inline-block;
          padding: 6px 12px;
          margin: 4px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 6px;
          font-size: 13px;
        }
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .print-button:hover {
          background: #2563eb;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
      
      <h1>${tarefa.titulo}</h1>
      
      <div class="metadata">
        <div class="meta-item">
          <span class="meta-label">Status:</span>
          <span class="status-badge badge">${statusLabels[tarefa.status]}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Prioridade:</span>
          <span class="priority-badge" style="background: ${prioridadeColors[tarefa.prioridade]}">${prioridadeLabels[tarefa.prioridade]}</span>
        </div>
        ${tarefa.dataVencimento ? `
          <div class="meta-item">
            <span class="meta-label">Vencimento:</span>
            <span>${new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR')}</span>
          </div>
        ` : ''}
        ${tarefa.tempoTotalHoras > 0 ? `
          <div class="meta-item">
            <span class="meta-label">Tempo Total:</span>
            <span>${tarefa.tempoTotalHoras}h</span>
          </div>
        ` : ''}
      </div>

      ${tarefa.descricao ? `
        <div class="section">
          <div class="section-title">📝 Descrição</div>
          <div class="description">${tarefa.descricao}</div>
        </div>
      ` : ''}

      ${colaboradoresInfo.length > 0 ? `
        <div class="section">
          <div class="section-title">👥 Colaboradores</div>
          <div>
            ${colaboradoresInfo.map(c => `<span class="colaborador">${c.nome || c.name || c.nomeCompleto}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${tarefa.tags && tarefa.tags.length > 0 ? `
        <div class="section">
          <div class="section-title">🏷️ Tags</div>
          <div>
            ${tarefa.tags.map(tag => `<span class="tag" style="${tag.cor ? `background: ${tag.cor}20; color: ${tag.cor}` : ''}">${tag.nome}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${tarefa.checklist && tarefa.checklist.length > 0 ? `
        <div class="section">
          <div class="section-title">✅ Checklist (${tarefa.checklist.filter(i => i.concluido).length}/${tarefa.checklist.length})</div>
          ${tarefa.checklist.map(item => `
            <div class="checklist-item">
              <span class="checkbox ${item.concluido ? 'checked' : ''}"></span>
              <span style="${item.concluido ? 'text-decoration: line-through; color: #9ca3af;' : ''}">${item.texto}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${tarefa.comentarios && tarefa.comentarios.length > 0 ? `
        <div class="section">
          <div class="section-title">💬 Comentários (${tarefa.comentarios.length})</div>
          ${tarefa.comentarios.slice(0, 10).map(comment => `
            <div class="comment">
              <div class="comment-author">${comment.usuarioNome}</div>
              <div>${comment.texto}</div>
              <div class="comment-date">${new Date(comment.criadoEm).toLocaleString('pt-BR')}</div>
            </div>
          `).join('')}
          ${tarefa.comentarios.length > 10 ? '<p style="text-align: center; color: #6b7280; margin-top: 10px;">+ mais comentários (visualize no sistema)</p>' : ''}
        </div>
      ` : ''}

      <div class="footer">
        Exportado em ${new Date().toLocaleString('pt-BR')} • CFO X SaaS
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  return true;
};
