# Construindo um Projeto Ágil no GitHub: da Gestão ao Controle de Qualidade

## 1. Descrição do projeto

A TechFlow Solutions foi contratada por uma startup de logística para desenvolver um sistema web de gerenciamento de tarefas. O sistema permite cadastrar, acompanhar e atualizar tarefas em um quadro Kanban, oferecendo maior visibilidade sobre o fluxo de trabalho da equipe.

O projeto foi criado como uma simulação prática de Engenharia de Software, integrando documentação, versionamento, desenvolvimento incremental, testes automatizados e integração contínua.

## 2. Escopo inicial

O escopo inicial contempla:

- Cadastro de tarefas com título, descrição, responsável e prazo.
- Listagem das tarefas em três estados: A fazer, Em progresso e Concluído.
- Atualização do status de cada tarefa.
- Exclusão de tarefas.
- Filtro por status e busca textual.
- Testes automatizados para validação de regras principais.
- Pipeline de CI com GitHub Actions.

## 3. Metodologia ágil utilizada

A metodologia escolhida foi um modelo híbrido entre Kanban e práticas leves de Scrum. O Kanban foi utilizado para visualizar o fluxo do trabalho e organizar as tarefas nas colunas To Do, In Progress e Done. As práticas de Scrum aparecem na divisão do projeto em incrementos pequenos, com backlog priorizado e entregas frequentes.

Essa abordagem foi adequada porque o projeto possui escopo acadêmico, equipe pequena e necessidade de demonstrar evolução por meio de commits, cards e validações automatizadas.

## 4. Importância da modelagem na Engenharia de Software

A modelagem ajuda a transformar uma necessidade de negócio em uma solução compreensível antes da implementação. Diagramas UML reduzem ambiguidades, facilitam a comunicação com stakeholders e apoiam decisões de arquitetura.

No projeto, o diagrama de casos de uso mostra como os usuários interagem com o sistema. O diagrama de classes representa os principais elementos internos, como tarefa, armazenamento e camada de API.

## 5. Diagramas UML

Os arquivos dos diagramas estão disponíveis em `docs/uml/casos-de-uso.puml` e `docs/uml/diagrama-classes.puml`.

### 5.1 Diagrama de Casos de Uso

Principais atores:

- Gestor de Projeto.
- Membro da Equipe.
- GitHub Actions.

Principais casos de uso:

- Cadastrar tarefa.
- Listar tarefas.
- Atualizar status.
- Excluir tarefa.
- Consultar tarefas por filtro.
- Executar testes automatizados.

### 5.2 Diagrama de Classes

Principais classes:

- Task: representa uma tarefa do sistema.
- TaskStore: gerencia persistência, criação, atualização e remoção.
- Server/API: expõe as rotas usadas pela interface.

## 6. Controle de qualidade

O controle de qualidade foi implementado com testes automatizados usando o módulo nativo `node:test`. Os testes cobrem criação, listagem, atualização, remoção e validação de dados inválidos.

Também foi criada uma validação de qualidade que executa `node --check` nos arquivos JavaScript e verifica espaços em branco no final das linhas. O GitHub Actions executa essas validações em pushes e pull requests.

## 7. Gestão de mudanças

Na simulação do projeto, o cliente solicitou uma melhoria para identificar tarefas críticas com mais facilidade. Essa mudança será tratada como alteração de escopo, registrada no Kanban como novo card e implementada em commit específico.

A justificativa é que, em uma operação logística, algumas tarefas possuem impacto direto na entrega ao cliente final. A mudança aumenta a utilidade do sistema sem alterar sua arquitetura principal.

## 8. Prints comentados do GitHub

Após publicar o repositório no GitHub, inserir nesta seção:

- Print do GitHub Projects com as colunas To Do, In Progress e Done.
- Print do histórico de commits mostrando mensagens semânticas.
- Print do GitHub Actions com workflow executado com sucesso.

Comentário sugerido para o Kanban: o quadro demonstra a organização visual do fluxo de trabalho e a distribuição das tarefas ao longo do desenvolvimento.

Comentário sugerido para os commits: o histórico evidencia evolução incremental e rastreabilidade das decisões técnicas.

Comentário sugerido para o CI: o workflow comprova que testes e qualidade foram automatizados.

## 9. Exemplo de solução existente

Uma solução semelhante no mercado é o Trello, que organiza atividades em quadros Kanban com cartões e colunas. O GitHub Projects oferece uma proposta parecida, mas integrada ao repositório, aos commits, às issues e ao fluxo de desenvolvimento.

## 10. Considerações finais

O projeto mostra como a Engenharia de Software conecta planejamento, implementação, controle de qualidade e adaptação a mudanças. O uso do GitHub como ambiente central permite unir código, documentação, tarefas, histórico e automação em um único fluxo de trabalho.

## Referências

- GitHub Docs. GitHub Actions Documentation.
- Pressman, Roger S. Engenharia de Software: Uma Abordagem Profissional.
- Atlassian. Como usar Kanban para melhorar produtividade.
- Canal Programação Fácil. Testes automatizados com GitHub Actions.

