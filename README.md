# 💒 Sistema de Gestão de Convidados — Casamento

Sistema completo para gerenciar convidados de eventos com confirmação de presença (RSVP) e check-in por QR Code.

---

## 📁 Estrutura do Projeto

```
wedding-system/
├── server.js           ← Servidor Node.js (toda a API)
├── package.json
├── data/
│   └── guests.json     ← Banco de dados (criado automaticamente)
└── public/
    ├── index.html      ← Site/Landing page do evento
    ├── rsvp.html       ← Formulário de confirmação de presença
    ├── checkin.html    ← Scanner de QR Code para entrada
    └── admin.html      ← Painel administrativo completo
```

---

## 🚀 Como Instalar e Rodar

### Pré-requisito
Apenas **Node.js** instalado. Baixe em: https://nodejs.org (versão 14 ou superior)

### Passo a passo

```bash
# 1. Entre na pasta do projeto
cd wedding-system

# 2. Inicie o servidor (sem instalar nada!)
node server.js
```

O sistema não precisa de nenhum `npm install` — usa apenas módulos nativos do Node.js!

Você verá:
```
💒 Sistema de Casamento rodando em http://localhost:3000
   🏠 Site do Evento:  http://localhost:3000/
   📋 RSVP:           http://localhost:3000/rsvp
   📷 Check-in:       http://localhost:3000/checkin
   📊 Admin:          http://localhost:3000/admin
```

---

## 🌐 Páginas do Sistema

| URL | Descrição |
|-----|-----------|
| `/` | Site do evento (landing page) |
| `/rsvp` | Formulário de confirmação de presença |
| `/checkin` | Scanner de QR Code para entrada |
| `/admin` | Painel administrativo completo |

---

## ⚙️ Como Configurar o Evento

1. Acesse `http://localhost:3000/admin`
2. Clique em **"Configurações"** no menu lateral
3. Preencha:
   - Nome do evento
   - Data e horário
   - Local e endereço
   - Link do Google Maps
   - Texto "Nossa História"
4. Clique em **"Salvar Configurações"**

O site será atualizado automaticamente com as novas informações.

---

## 👥 Como Cadastrar Convidados

### Opção 1 — Pelo painel Admin
1. Acesse `/admin`
2. Clique em **"Adicionar"** no menu
3. Preencha nome, telefone, acompanhantes
4. Clique **"Cadastrar + Gerar QR"** para já ver o QR Code

### Opção 2 — O próprio convidado confirma pelo site
1. Convidado acessa o site do evento (`/`)
2. Clica em "Confirmar Presença"
3. Preenche o formulário RSVP
4. Recebe o QR Code na tela e pode baixar

---

## 📲 Como Gerar QR Codes

### QR individual
- No Admin → Convidados → botão **"QR"** ao lado do nome
- Ou após cadastrar pelo formulário RSVP

### QR para todos os convidados
- No Admin → Dashboard → botão **"Gerar Todos QRs"**
- Os arquivos PNG serão baixados automaticamente

---

## 📷 Como Usar no Evento (Check-in)

1. Abra `http://SEU-IP:3000/checkin` no celular da recepção
2. Clique **"Iniciar Câmera"**
3. Aponte para o QR Code do convidado
4. O sistema mostrará:
   - ✅ **Verde**: Check-in realizado com sucesso + nome do convidado
   - ⚠️ **Amarelo**: Convidado já realizou check-in (duplicata bloqueada)
   - ❌ **Vermelho**: QR inválido

**Entrada duplicada:** O sistema automaticamente bloqueia e alerta.

---

## 📊 Relatório Final

1. Acesse `/admin`
2. No Dashboard você vê todos os números em tempo real
3. Clique **"Exportar CSV"** para baixar planilha completa
4. Abra no Excel/Google Sheets

---

## 🌍 Como Publicar Online (Gratuitamente)

### Opção 1 — Railway (recomendado)
1. Crie conta em https://railway.app
2. Conecte seu GitHub
3. Faça upload da pasta `wedding-system`
4. Deploy automático — URL pública gerada

### Opção 2 — Render
1. Crie conta em https://render.com
2. New Web Service → conecte repositório
3. Build Command: (vazio)
4. Start Command: `node server.js`

### Opção 3 — VPS próprio
```bash
# No servidor Linux
git clone ou copie os arquivos
node server.js &

# Com PM2 (recomendado)
npm install -g pm2
pm2 start server.js --name wedding
pm2 save
```

---

## 📡 API REST (referência)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/event` | Dados do evento |
| PUT | `/api/event` | Atualizar evento |
| GET | `/api/guests` | Lista todos convidados |
| POST | `/api/guests` | Adicionar convidado |
| DELETE | `/api/guests/:id` | Remover convidado |
| POST | `/api/checkin` | Fazer check-in |
| PUT | `/api/guests/:id/reset-checkin` | Resetar check-in |
| GET | `/api/stats` | Estatísticas |
| GET | `/api/export` | Exportar CSV |

---

## 💡 Dicas

- **Celular na recepção**: Use o celular em modo paisagem para melhor visão da câmera
- **Imprimir QRs**: Os QRs baixados têm 300x340px — ideais para imprimir em papel A4 (4 por página)
- **Backup**: O arquivo `data/guests.json` contém todos os dados — faça backup regularmente
- **Multiple devices**: Vários celulares podem escanear ao mesmo tempo sem conflito

---

*Sistema desenvolvido para ser simples, leve e funcionar sem dependências externas.*
