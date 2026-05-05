# ctBlun — Design do Aplicativo

## Identidade Visual

- **Nome:** ctBlun
- **Propósito:** Plataforma de Recrutamento e Seleção com videoconferência integrada
- **Tom:** Profissional, confiável, moderno
- **Paleta de cores:**
  - Primary: `#1A56DB` (azul corporativo)
  - Background: `#F9FAFB` (cinza claro) / `#111827` (dark)
  - Surface: `#FFFFFF` / `#1F2937`
  - Foreground: `#111827` / `#F9FAFB`
  - Muted: `#6B7280` / `#9CA3AF`
  - Border: `#E5E7EB` / `#374151`
  - Success: `#10B981`
  - Warning: `#F59E0B`
  - Error: `#EF4444`
  - Accent (scorecard): `#7C3AED` (roxo — exclusivo para recrutador)

---

## Lista de Telas

| Tela | Rota | Descrição |
|------|------|-----------|
| Splash / Onboarding | `/` | Logo animado + botões de entrar/cadastrar |
| Login | `/login` | Formulário email + senha |
| Cadastro | `/register` | Nome, email, senha, confirmação |
| Dashboard | `/(tabs)/index` | Resumo de entrevistas do dia, acesso rápido |
| Entrevistas | `/(tabs)/interviews` | Lista de entrevistas agendadas/passadas |
| Nova Entrevista | `/interview/new` | Formulário: candidato, cargo, data/hora, sala |
| Detalhe da Entrevista | `/interview/[id]` | Info do candidato + botão entrar na chamada |
| Videochamada | `/call/[roomId]` | WebView Jitsi + botão flutuante do scorecard |
| Scorecard | Modal sobre `/call/[roomId]` | Formulário de avaliação privado do recrutador |
| Perfil | `/(tabs)/profile` | Dados do recrutador, logout |

---

## Conteúdo e Funcionalidades por Tela

### Splash / Onboarding
- Logo ctBlun centralizado com animação de fade-in
- Tagline: "Recrutamento inteligente, entrevistas eficientes"
- Botões: "Entrar" e "Criar conta"

### Login
- Campo: Email (teclado email, validação)
- Campo: Senha (oculta, toggle visibilidade)
- Botão: "Entrar" (loading state)
- Link: "Esqueci minha senha" (futuro)
- Link: "Criar conta"
- Tratamento de erros inline (credenciais inválidas)

### Cadastro
- Campo: Nome completo
- Campo: Email
- Campo: Senha (mínimo 8 caracteres)
- Campo: Confirmar senha
- Botão: "Criar conta"
- Link: "Já tenho conta"

### Dashboard
- Cabeçalho: "Bom dia, [Nome]" + avatar inicial
- Card de resumo: entrevistas hoje / esta semana
- Lista: próximas 3 entrevistas (nome candidato, cargo, horário)
- Botão flutuante: "+ Nova Entrevista"

### Entrevistas
- FlatList com cards de entrevistas
- Filtros: Hoje / Esta semana / Todas
- Card: foto inicial, nome candidato, cargo, status (agendada/realizada/cancelada)
- Swipe para deletar / Tap para ver detalhe

### Nova Entrevista
- Campo: Nome do candidato
- Campo: Cargo/Vaga
- Campo: Data e hora (DateTimePicker)
- Campo: Nome da sala Jitsi (gerado automaticamente ou personalizado)
- Botão: "Agendar"

### Detalhe da Entrevista
- Header com nome e cargo do candidato
- Status badge
- Data/hora formatada
- Nome da sala Jitsi
- Botão primário: "Iniciar Entrevista" (abre videochamada)
- Botão secundário: "Copiar link da sala"
- Histórico de scorecards anteriores (se houver)

### Videochamada
- WebView em tela cheia com Jitsi Meet
- Botão flutuante (canto inferior direito): ícone de clipboard (scorecard)
- Ao tocar no botão: abre modal do scorecard sem encerrar a chamada

### Scorecard (Modal)
- Título: "Avaliação — [Nome do Candidato]"
- Seções de avaliação (1–5 estrelas):
  - Comunicação
  - Conhecimento Técnico
  - Fit Cultural
  - Proatividade
  - Apresentação Pessoal
- Campo: Pontos fortes (texto livre)
- Campo: Pontos de melhoria (texto livre)
- Campo: Recomendação final (Aprovado / Em espera / Reprovado)
- Botão: "Salvar avaliação"
- Nota: visível APENAS para o recrutador logado

### Perfil
- Avatar com inicial do nome
- Nome e email do recrutador
- Estatísticas: total de entrevistas, aprovados, reprovados
- Botão: "Sair" (logout com confirmação)

---

## Fluxos Principais

### Fluxo 1 — Cadastro e Login
`Splash → Criar conta → Formulário → Login automático → Dashboard`

### Fluxo 2 — Agendar e Realizar Entrevista
`Dashboard → + Nova Entrevista → Preencher dados → Salvar → Lista de Entrevistas → Tap no card → Detalhe → Iniciar Entrevista → Videochamada`

### Fluxo 3 — Scorecard durante a chamada
`Videochamada → Tap no botão flutuante → Modal Scorecard → Preencher avaliação → Salvar → Retorna à chamada`

---

## Navegação

- **Stack Navigator** para telas de auth (login, cadastro)
- **Tab Navigator** para telas principais (Dashboard, Entrevistas, Perfil)
- **Stack Navigator** dentro das tabs para detalhe e nova entrevista
- **Modal** para scorecard (sem sair da chamada)
