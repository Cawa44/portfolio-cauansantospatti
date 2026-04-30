# Atividade: Desenvolvimento Low-Code com IA — Bubble.io

## Plataforma

[Bubble.io](https://bubble.io/)

---

## Objetivo

Desenvolver uma aplicação web de gestão utilizando a **Inteligência Artificial do Bubble**
como acelerador, aplicando rigorosamente os fundamentos de engenharia de software para
garantir segurança, escalabilidade e governança.

---

## Passo 1 — Análise Crítica do Material de Referência

Antes de abrir o Bubble, foi assistido o vídeo de referência para compreender as limitações
e o comportamento da IA geradora de aplicações. Os momentos-chave observados foram:

- **[09:22]** — O autor destaca o diferencial das plataformas visuais: a possibilidade de
  ajustar manualmente o que a IA gerou, algo que ferramentas puramente generativas não oferecem.
- **[17:08]** — A IA falhou na construção de lógicas de permissão, não criando a visão do
  colaborador corretamente — evidenciando que o output da IA é apenas um ponto de partida.
- **[20:20]** — Alerta sobre a maturidade das ferramentas: erros são frequentes e a atuação
  humana crítica é indispensável.

> **Conclusão:** A IA gera um "rascunho". A engenharia de software real começa no momento
> em que a IA termina de gerar o código.

---

## Passo 2 — Arquitetura e Modelagem de Dados

Planejamento realizado **fora do Bubble**, antes de criar qualquer tela.

### Diagrama do Banco de Dados

![Diagrama do Banco de Dados](projeto-engenharia-de-software-e-ia-com-bubble/Print Banco de Dados.png)

### Entidades (Data Types)

| Tabela | Campos Principais |
|--------|-------------------|
| **User** | id, email, name, role (Option Set), created_date |
| **Cliente** | id, name, email, phone, created_by → User, created_date |
| **Orçamento** | id, title, description, value, status → Option Set, client → Cliente, created_by → User, created_date |

### Option Sets (sem texto fixo)

| Option Set | Valores |
|------------|---------|
| **Status Orçamento** | Pendente, Aprovado, Rejeitado |
| **Role (User)** | Admin, Colaborador |

> **Regra aplicada:** O campo `client` em Orçamento aponta para a tabela Cliente
> (relação direta). Nenhuma lista de orçamentos foi criada dentro do Cliente,
> prevenindo problemas de performance acima de 100 itens.

---

## Passo 3 — Geração da Base com IA no Bubble

- Criada conta gratuita no Bubble.io
- Iniciado novo projeto com a opção **"Criar com IA"** (Web application)
- Escrito prompt detalhado descrevendo o sistema de gerenciamento de orçamentos
- Blueprint gerado e páginas confirmadas

---

## Passo 4 — Refatoração Front-end e Lógica (Atuação Humana)

- **Auditoria de Interface:** Corrigidas as falhas de layout responsivo utilizando
  conceitos de Flexbox (Column, Row, Alignments)
- **Revisão de Workflows:** Substituídos todos os textos "chumbados" (hardcoded) pelos
  Option Sets definidos no Passo 2

---

## Passo 5 — Segurança e Privacidade (Privacy by Design)

### Print — Regra de Privacidade: Tabela Budget

![Privacy Budget](projeto-engenharia-de-software-e-ia-com-bubble/Print Budget.png)

### Print — Regra de Privacidade: Tabela Client

![Privacy Client](projeto-engenharia-de-software-e-ia-com-bubble/Print Cliente.png)

### Regras Configuradas

| Tabela | Nome da Regra | Condição | Permissões |
|--------|---------------|----------|------------|
| **Budget** | Apenas o Criador | `This Budget's Creator is Current User` | View all fields, Find this in searches, View attached files |
| **Client** | Apenas o Criador | `This Client's Creator is Current User` | View all fields, Find this in searches, View attached files |
| **User** | Privacy rules applied | — | Configurada |

> A regra genérica **"Everyone can see all data"** gerada automaticamente pela IA foi
> **deletada** em todas as tabelas, prevenindo exposição acidental de dados
> (vulnerabilidade OWASP de representação indevida).

---

## Passo 6 — Desempenho e Otimização de Custos

- Todas as buscas ao banco de dados (`Do a search for`) foram configuradas para ocorrer
  **apenas no Repeating Group**, e não nas células individuais
- Isso evita buscas redundantes que consumiriam Unidades de Carga de Trabalho (WUs)
  de forma desnecessária, inviabilizando o projeto financeiramente

---

## Passo 7 — Governança e Controle (Anti-Shadow IT)

### Print — Workflows Organizados

![Workflows](projeto-engenharia-de-software-e-ia-com-bubble/Print Workflow.png)

### Comentários e Cores dos Workflows

| Cor | Categoria | Workflows |
|-----|-----------|-----------|
| 🔵 Azul | Autenticação | Sign Up, Log In, Log Out |
| 🟢 Verde | Sucesso / Salvamento / Navegação | Criar Orçamento, Editar Orçamento, Alterar Status, Criar Cliente |
| 🔴 Vermelho | Exclusão / Ações Destrutivas | Deletar Orçamento, Deletar Cliente |
| 🟡 Amarelo | Avisos / Validações | Validação de Formulário |

### Documentação dos Workflows (Notes)

---

## Passo 8 — Estratégia de Saída (Vendor Lock-in)

### Risco Identificado

O Bubble.io **retém a posse do código-fonte** gerado pela plataforma. Caso o serviço seja
descontinuado, tenha aumento de preços inviável ou precise ser reescrito em tecnologia
tradicional, não é possível simplesmente exportar o código e compilá-lo em outro ambiente.

### Plano de Mitigação — Exportação via Data API

**1. Habilitar a Data API:**
Acessar `Settings > API > Enable Data API` e marcar as tabelas `User`, `Cliente` e
`Orcamento` como expostas via API.

**2. Autenticar as requisições:**
Gerar um API Token em `Settings > API > Generate a new API token`.
Header: `Authorization: Bearer SEU_TOKEN`

**3. Exportar cada tabela via HTTP GET:**

| Tabela | Endpoint |
|--------|----------|
| Usuários | `GET https://seuapp.bubbleapps.io/api/1.1/obj/user` |
| Clientes | `GET https://seuapp.bubbleapps.io/api/1.1/obj/cliente` |
| Orçamentos | `GET https://seuapp.bubbleapps.io/api/1.1/obj/orcamento` |

Cada endpoint retorna registros em **JSON paginado** (parâmetros: `cursor` e `limit`).

**4. Reescrita em Stack Tradicional:**

| Camada | Tecnologia |
|--------|------------|
| Frontend | React.js / Next.js |
| Backend | Node.js com Express ou NestJS |
| Banco de Dados | PostgreSQL |
| Autenticação | JWT / NextAuth.js |

> A estrutura relacional planejada no Passo 2 facilita a criação do schema SQL
> equivalente sem retrabalho de modelagem.

---

## Checklist de Entrega

- [x] **Link do Aplicativo** (version-test):
  https://cauansantospix-39555.bubbleapps.io/version-test?debug_mode=true
- [x] **Rascunho do Banco de Dados:** Diagrama com tabelas, relações e Option Sets
- [x] **Print Data > Privacy — Budget:** Regra "Apenas o Criador" configurada
- [x] **Print Data > Privacy — Client:** Regra "Apenas o Criador" configurada
- [x] **Print Workflows:** Lógicas com cores organizadas e comentadas
- [x] **Estratégia de Saída:** Exportação via Data API documentada
