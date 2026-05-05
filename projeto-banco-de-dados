# Banco de Dados — Grupo 3
## Refatoração do Modelo Lógico & Implementação do Controle de Usuários

---

## 1. Objetivos da Atividade

- **Refatoração:** Aplicar todas as correções e sugestões do feedback da avaliação anterior ("Projeto - Geração do Modelo Lógico"), revisando tabelas, colunas, chaves primárias, estrangeiras e tipos de dados.
- **Controle de Usuários:** Integrar o sistema de cadastro e controle de usuários apresentado em aula, adaptando-o ao contexto do projeto.
- **Script DDL para PostgreSQL:** Gerar o script DDL completo e convertê-lo do dialeto MySQL para PostgreSQL com auxílio de IA, revisando o resultado para garantir corretude.

---

## 2. Diagrama do Modelo Lógico

![Diagrama Entidade-Relacionamento — Banco de Dados Grupo 3](banco_sql.png)

> O diagrama acima representa o modelo lógico do schema `evento_manager`, contendo todas as tabelas, relacionamentos e chaves do projeto após refatoração.

---

## 3. Protocolo de Execução

1. **Refatoração do Modelo Lógico:** Revisão das tabelas com base exclusivamente no feedback da avaliação anterior — correção de tipos de dados, nomenclatura de colunas, chaves primárias e estrangeiras.
2. **Implementação do Controle de Usuários:** Integração das tabelas `usuario` e `log_auditoria` ao modelo, adaptadas ao contexto de gerenciamento de eventos.
3. **Conversão para PostgreSQL:** Utilização de IA (ChatGPT/Gemini) para converter o script MySQL gerado pelo MySQL Workbench para o dialeto PostgreSQL, seguida de revisão manual pelo grupo.

---

## 4. Estrutura do Schema `evento_manager`

### Tabelas de Domínio / Lookup

| Tabela | Descrição |
|---|---|
| `status_evento` | Estados possíveis de um evento |
| `status_proposta` | Estados possíveis de uma proposta |
| `status_pagamento` | Estados possíveis de um pagamento |
| `categoria_servico` | Categorias dos serviços oferecidos |
| `unidade_prazo` | Unidades de medida de prazo (dias, semanas etc.) |
| `forma_pagamento_master` | Formas de pagamento aceitas |
| `cargo` | Cargos dos funcionários |
| `estado` | Estados brasileiros (sigla + nome) |

### Tabelas Geográficas

| Tabela | Descrição |
|---|---|
| `cidade` | Cidades vinculadas a estados |
| `local` | Locais de realização dos eventos |

### Tabelas de Pessoas e Organização

| Tabela | Descrição |
|---|---|
| `cliente` | Cadastro de clientes com consentimento LGPD |
| `dados_sensiveis_cliente` | CPF e telefone criptografados (LGPD) |
| `funcionario` | Cadastro de funcionários |
| `departamento` | Departamentos com gerente referenciado |

### Tabelas Operacionais

| Tabela | Descrição |
|---|---|
| `evento` | Eventos com status, local e orçamento |
| `servico` | Serviços com categoria e prazo de execução |
| `fornecedor` | Fornecedores com CNPJ e localização |
| `proposta` | Propostas vinculadas a eventos e clientes |
| `pagamento` | Pagamentos vinculados a propostas |

### Tabelas de Relacionamento (N:N)

| Tabela | Relacionamento |
|---|---|
| `evento_servico` | Evento ↔ Serviço (com quantidade e valor unitário) |
| `evento_funcionario` | Evento ↔ Funcionário (com função e remuneração extra) |
| `servico_fornecedor` | Serviço ↔ Fornecedor (com preço negociado e contrato) |
| `equipe_evento` | Equipes vinculadas a eventos |
| `funcionario_equipe` | Funcionário ↔ Equipe (com papel) |

### Tabelas de Controle de Usuários e Auditoria

| Tabela | Descrição |
|---|---|
| `usuario` | Usuários do sistema vinculados a funcionários |
| `log_auditoria` | Registro de operações com dados anteriores e posteriores em JSON |

---

## 5. Script DDL Completo

O script DDL completo está disponível no repositório do projeto:

[📄 Ver Script DDL Completo](banco_sql-code.pdf)

## 6. Critérios de Entrega Atendidos

- **Formato:** Script DDL completo em arquivo `.txt` — ✅
- **Refatoração:** Tabelas revisadas com base no feedback anterior — ✅
- **Controle de Usuários:** Tabelas `usuario` e `log_auditoria` integradas e adaptadas ao contexto do projeto — ✅
- **Conversão para PostgreSQL:** Script gerado no MySQL Workbench convertido via IA e revisado pelo grupo para compatibilidade com PostgreSQL (uso de `SERIAL`, tipos de dados e integridade referencial) — ✅
- **Atividade em grupo** — ✅


[← Voltar ao Início](https://github.com/Cawa44/portfolio-cauansantospatti)
