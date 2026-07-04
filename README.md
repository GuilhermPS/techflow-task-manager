# TechFlow Task Manager

**Aluno:** Guilherme Pereira da Silva  
**RA:** 142006

Sistema web básico de gerenciamento de tarefas desenvolvido para simular um projeto ágil da TechFlow Solutions no GitHub. O projeto atende a uma startup de logística que precisa visualizar o fluxo de trabalho, acompanhar responsáveis e monitorar tarefas em tempo real.

## Objetivo

Criar uma aplicação funcional de CRUD de tarefas com organização ágil, versionamento, testes automatizados e integração contínua. A entrega demonstra práticas de Engenharia de Software aplicadas ao ciclo de vida de um produto realista.

## Escopo inicial

- Cadastrar tarefas com título, descrição, responsável e prazo.
- Listar tarefas em um quadro Kanban com os status `A fazer`, `Em progresso` e `Concluído`.
- Atualizar o status das tarefas conforme o avanço do trabalho.
- Excluir tarefas concluídas ou cadastradas incorretamente.
- Executar testes automatizados para validar regras principais.
- Rodar pipeline de CI no GitHub Actions.

## Escopo atual

Após a mudança simulada de escopo, o sistema também permite classificar tarefas por prioridade (`Baixa`, `Média`, `Alta` e `Crítica`) e filtrar o quadro por esse critério.

## Metodologia adotada

Foi adotado um processo híbrido entre Kanban e práticas leves de Scrum:

- Kanban para visualizar fluxo, limitar dispersão e acompanhar o estado das tarefas.
- Backlog priorizado para organizar incrementos pequenos.
- Commits semânticos para registrar a evolução do projeto.
- Integração contínua para reduzir riscos de regressão.

## Como executar

Requisitos:

- Node.js 20 ou superior.
- Git.

Instalação:

```bash
npm install
```

Execução:

```bash
npm start
```

Depois acesse:

```text
http://localhost:3000
```

## Testes e qualidade

Executar testes:

```bash
npm test
```

Executar validação de qualidade:

```bash
npm run lint
```

Executar tudo:

```bash
npm run quality
```

## Estrutura de diretórios

```text
.
├── .github/workflows/ci.yml
├── data/
├── docs/
├── scripts/
├── src/
│   ├── public/
│   ├── server.js
│   └── taskStore.js
└── tests/
```

## Kanban sugerido no GitHub Projects

| Card | Coluna |
| --- | --- |
| Definir escopo inicial do sistema | Done |
| Criar estrutura do repositório | Done |
| Implementar modelo de tarefas | Done |
| Implementar API de CRUD | Done |
| Criar interface web do Kanban | Done |
| Adicionar testes unitários | Done |
| Configurar GitHub Actions | Done |
| Escrever documentação do projeto | Done |
| Revisar qualidade do código | In Progress |
| Preparar vídeo pitch | To Do |
| Adicionar prioridade para tarefas críticas | Done |

## Gestão de mudanças

Durante a simulação do projeto, o cliente solicitou uma melhoria para facilitar a identificação de tarefas críticas. A mudança foi registrada como novo card no Kanban e implementada em commit próprio, mantendo rastreabilidade entre necessidade de negócio, código e documentação.

Mudança implementada:

- Inclusão do campo `priority` no modelo de tarefa.
- Filtro por prioridade na API e na interface web.
- Destaque visual para tarefas de prioridade crítica.
- Atualização dos testes automatizados para validar o novo campo.

## Questões norteadoras

### Principais causas de falhas em projetos ágeis

Falhas comuns incluem má comunicação, backlog desorganizado, ausência de critérios claros de aceite, baixa visibilidade do progresso e pouca automação de testes. O GitHub ajuda a reduzir esses riscos com Projects, Issues, Pull Requests, histórico de commits e GitHub Actions.

### Beneficiados pelo sistema

Gestores acompanham gargalos e prioridades. Desenvolvedores visualizam responsabilidades e próximas ações. O cliente monitora entregas e consegue discutir mudanças com base em evidências do fluxo.

### Controle de qualidade com GitHub Actions

O GitHub Actions executa validações automaticamente a cada push ou pull request. Isso reduz a chance de entregar código quebrado, pois testes e verificações de qualidade passam a fazer parte do fluxo normal de desenvolvimento.

### Desafios ao implementar mudanças

Mudanças podem afetar prazo, escopo e qualidade. Para lidar com isso, a equipe registra a justificativa, cria cards específicos, ajusta prioridades e valida a alteração com testes.

### Aplicação das metodologias ágeis

O projeto aplica ciclos curtos de entrega, backlog visível, Kanban, commits frequentes e feedback contínuo por meio de testes automatizados.

## Referências

- GitHub Docs. GitHub Actions Documentation.
- Pressman, Roger S. Engenharia de Software: Uma Abordagem Profissional.
- Atlassian. Como usar Kanban para melhorar produtividade.
- Canal Programação Fácil. Testes automatizados com GitHub Actions.
