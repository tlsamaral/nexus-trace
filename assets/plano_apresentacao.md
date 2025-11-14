# PLANO DE APRESENTAÇÃO – DETECÇÃO DE FRAUDES FINANCEIRAS COM GRAFOS

## 1. Introdução
1.1 Contextualização do problema de fraudes financeiras e sua relevância no mercado.
1.2 Motivação para o uso de grafos na detecção de padrões anômalos.
1.3 Objetivo geral: implementar e demonstrar um sistema funcional de detecção de fraudes utilizando o Neo4j e Cypher.

## 2. Estrutura do Projeto
2.1 Visão geral dos componentes:
   - PostgreSQL (armazenamento relacional)
   - Python (geração de dados simulados e exportação CSV)
   - Neo4j (análise gráfica e detecção de fraudes)
2.2 Benefícios da modelagem em grafo para dados transacionais.
2.3 Fluxo de dados: geração → importação → análise.

## 3. Arquitetura e Ferramentas
3.1 Docker Compose: orquestração dos serviços (PostgreSQL, Neo4j, App Python).
3.2 Estrutura de pastas e arquivos principais:
   - `schema.sql`
   - `generate_data.py`
   - `import_to_neo4j_v5_fixed.cypher`
   - `fraude_detection_queries.cypher`
3.3 Funcionamento do ambiente Dockerizado.

## 4. Metodologia
4.1 Etapas do processo de detecção:
   1. Geração de dados sintéticos no Python.
   2. Criação do schema SQL no PostgreSQL.
   3. Exportação para CSV e importação no Neo4j.
   4. Criação do grafo e importação das relações (Cypher).
   5. Execução das queries de detecção.
4.2 Características dos dados simulados:
   - Contas, clientes, dispositivos e comerciantes.
   - Transações financeiras simuladas (incluindo padrões fraudulentos).

## 5. Execução Prática (Resumo)
5.1 Subida do ambiente via Docker Compose.
5.2 Verificação do Neo4j e importação dos CSVs.
5.3 Execução dos scripts Cypher de importação.
5.4 Execução das queries de análise de fraude.

## 6. Detecção e Análise
6.1 Identificação de ciclos suspeitos (lavagem de dinheiro).
6.2 Identificação de contas “mulas” (fan-in alto).
6.3 Cálculo do risco médio e máximo das contas.
6.4 Visualização dos grupos suspeitos no grafo.
6.5 Análise de clusters via algoritmo Louvain (GDS).

## 7. Visualização e Interpretação
7.1 Visualização interativa do grafo no Neo4j Browser.
7.2 Estilos visuais (cores, tamanho dos nós, tipo de relação).
7.3 Interpretação dos padrões detectados:
   - Ciclos curtos → lavagem de dinheiro.
   - Fan-in alto → contas intermediárias.
   - Grupos densos → redes de fraude.
7.4 Como usar o Neo4j Bloom (opcional) para dashboards visuais.

## 8. Conclusões
8.1 Resultados obtidos na simulação.
8.2 Aplicabilidade em ambientes reais.
8.3 Próximos passos: integração com modelos de machine learning e APIs.
