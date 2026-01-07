#!/bin/bash

# CFO-X SaaS - Iniciar ambiente local
# Execute: ./start.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando CFO-X SaaS...${NC}"
echo ""

# Subir containers
echo -e "${BLUE}🐳 Subindo containers Docker...${NC}"
docker-compose up -d
echo ""

# Aguardar banco ficar pronto
echo -e "${BLUE}⏳ Aguardando banco de dados...${NC}"
sleep 10
echo ""

# Inicializar banco
echo -e "${BLUE}🗄️  Inicializando banco de dados...${NC}"
docker-compose exec -T backend python init_db.py
echo ""

# Status
echo -e "${BLUE}📊 Status dos containers:${NC}"
docker-compose ps
echo ""

# 11. Sucesso!
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ CFO-X SaaS está rodando!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
echo -e "   Frontend:       ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend API:    ${GREEN}http://localhost:8000${NC}"
echo -e "   API Docs:       ${GREEN}http://localhost:8000/docs${NC}"
echo -e "   Database:       ${GREEN}localhost:5432${NC}"
echo ""
echo -e "${BLUE}🔑 Credenciais padrão (dev):${NC}"
echo -e "   Email:    ${GREEN}admin@example.com${NC}"
echo -e "   Senha:    ${GREEN}admin123${NC}"
echo ""
echo -e "${YELLOW}📝 Comandos úteis:${NC}"
echo -e "   Ver logs:        ${GREEN}docker-compose logs -f${NC}"
echo -e "   Parar tudo:      ${GREEN}docker-compose down${NC}"
echo -e "   Reiniciar:       ${GREEN}./start.sh${NC}"
echo ""
