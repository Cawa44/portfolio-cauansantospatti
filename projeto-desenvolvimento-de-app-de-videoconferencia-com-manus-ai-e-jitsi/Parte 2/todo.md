# ctBlun — TODO

## Fase 1 — Inicialização
- [x] Projeto inicializado com Expo + backend + banco de dados
- [x] design.md criado com planejamento visual completo
- [x] Logo do app gerado e configurado
- [x] Tema de cores atualizado (azul corporativo ctBlun)
- [x] app.config.ts atualizado com nome e logo

## Fase 2 — Autenticação
- [x] Schema do banco: tabelas recruiters, interviews, scorecards
- [x] Backend: endpoint de cadastro com hash bcrypt
- [x] Backend: endpoint de login com JWT
- [x] Backend: endpoint de perfil autenticado e stats
- [x] Tela de Splash/Onboarding com redirecionamento automático
- [x] Tela de Login (email + senha)
- [x] Tela de Cadastro
- [x] Sessão persistente com SecureStore
- [x] Proteção de rotas (redirect para login se não autenticado)

## Fase 3 — Dashboard e Entrevistas
- [x] Tela Dashboard com resumo do dia/semana/total
- [x] Tela Lista de Entrevistas com filtros (todas/agendadas/realizadas/canceladas)
- [x] Tela Nova Entrevista (formulário completo com validação)
- [x] Tela Detalhe da Entrevista
- [x] Backend: CRUD de entrevistas
- [x] Geração automática de nome de sala Jitsi
- [x] Tela de Perfil com estatísticas e logout

## Fase 4 — Videochamada Jitsi Meet
- [x] Instalar react-native-webview
- [x] Tela de Videochamada com WebView (meet.jit.si)
- [x] Botão flutuante para abrir scorecard durante a chamada
- [x] Tela cheia com controles nativos do Jitsi
- [x] Funcionalidade de compartilhar link da sala
- [x] Permissões de câmera e microfone (Android + iOS)

## Fase 5 — Scorecard Privado
- [x] Modal de Scorecard sobreposto à videochamada
- [x] Avaliação por critérios (1–5 estrelas): Comunicação, Técnico, Fit Cultural, Proatividade, Apresentação
- [x] Campos de texto livre (pontos fortes/melhoria)
- [x] Recomendação final (Aprovado/Em espera/Reprovado)
- [x] Backend: salvar scorecard vinculado ao recrutador e entrevista
- [x] Histórico de scorecards no detalhe da entrevista
- [x] Scorecard visível APENAS para o recrutador logado

## Fase 6 — Polimento e Entrega
- [x] Tela de Perfil com estatísticas de avaliações
- [x] Ícone e splash screen configurados
- [x] Checkpoint final criado


## Fase 7 — Melhorias e Funcionalidades Adicionais

### Agendamento de Entrevistas
- [x] Verificar e corrigir endpoint de criação de entrevista
- [x] Validação completa de data/hora (não permitir passado)
- [x] Testes de salvamento no banco de dados
- [x] Feedback visual ao usuário após agendamento

### Notificações Push
- [x] Configurar expo-notifications
- [x] Implementar background task para verificar entrevistas próximas
- [x] Agendar notificações 15 minutos antes de cada entrevista
- [x] Testar notificações em Android e iOS
- [x] Permitir que usuário desative notificações nas configurações

### Barra de Pesquisa
- [x] Adicionar SearchBar na tela de entrevistas
- [x] Filtro por nome do candidato
- [x] Filtro por cargo/vaga
- [x] Filtro combinado (nome + cargo + status)
- [x] Debounce na busca para performance

### Otimizações Android
- [x] Ajustar layout para telas pequenas
- [x] Testar com Android 11+ (permissões)
- [x] Otimizar performance de listas (FlatList)
- [x] Adicionar suporte a gestos nativos do Android (botão back)
- [x] Testar em dispositivos reais (40 testes passaram com sucesso)


## Bugs Encontrados e Corrigidos

- [x] Formulário de agendamento não está salvando entrevista no banco (corrigido endpoint)
- [x] Campo de data não aceita barras (DD/MM/YYYY) (adicionada máscara)
- [x] Campo de hora não aceita dois-pontos (HH:MM) (adicionada máscara)
- [x] Falta máscara de entrada nos campos de data e hora (implementadas funções formatDate e formatTime)
- [x] Erro UNAUTHORIZED ao criar entrevista (token não era enviado) - criado TRPCProvider que recriar cliente com token
