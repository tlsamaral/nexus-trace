# EXPLICAÇÃO DETALHADA – APRESENTAÇÃO PRÁTICA DE DETECÇÃO DE FRAUDES FINANCEIRAS COM GRAFOS

## 1️⃣ Início do Ambiente Docker
**Comando:** `docker compose up -d --build`  
Este comando inicia toda a infraestrutura do projeto em segundos.  
Ele cria três contêineres:
- **PostgreSQL:** banco relacional que armazena as tabelas de contas e transações.  
- **Neo4j:** banco de dados de grafos, onde ocorre a análise de conexões e fraudes.  
- **App Python:** responsável por gerar dados simulados e enviar para o Neo4j.  

🎯 **Impacto na apresentação:** mostre como o ambiente inteiro sobe automaticamente — isso impressiona pela automação e integração entre sistemas.

---

## 2️⃣ Verificação de Status
**Comando:** `docker ps`  
Exibe todos os contêineres ativos, mostrando portas, status e tempo de execução.  
Isso confirma que tudo está operacional e pronto para análise.  

💡 **Destaque:** “Aqui garantimos que o ecossistema completo está de pé — pronto para gerar inteligência de fraude.”

---

## 3️⃣ Acesso ao Neo4j Browser
**URL:** [http://localhost:7474](http://localhost:7474)  
Login padrão: `neo4j / neo4jpassword`  
É a interface visual onde toda a análise gráfica e exploração de dados acontece.  

💬 **Explicação visual:** “Aqui começa a mágica — o banco relacional vira um universo de conexões.”

---

## 4️⃣ Verificação do Plugin GDS
**Comando:** `CALL gds.version();`  
Confirma que o **Graph Data Science** está instalado — uma extensão poderosa do Neo4j usada para análises avançadas, como detecção de comunidades e centralidade de contas.  

⚙️ **Resumo técnico:** o GDS transforma o Neo4j em uma ferramenta analítica de alta performance.  

---

## 5️⃣ Importação dos Dados CSV
**Blocos com `:auto` e `CALL { ... } IN TRANSACTIONS`**  
Cada bloco importa um conjunto de dados CSV (clientes, contas, transações e relacionamentos).  

- **Customer:** cria nós representando clientes.  
- **Account:** associa contas a clientes e define um índice de risco (`risk_score`).  
- **Transaction:** cria relações `SENT` (envio de valores entre contas).  
- **Relationship:** cria relações `LINKED` (mesmo IP, dispositivo ou local).  

📈 **Demonstração:** mostre como os dados tabulares se transformam em nós e conexões reais — algo impossível em bancos tradicionais.

---

## 6️⃣ Validação do Grafo
**Comandos:**
```cypher
CALL db.labels();
CALL db.relationshipTypes();
MATCH (n)-[r]->() RETURN n,r LIMIT 100;
```  
Esses comandos verificam a integridade do grafo, listando tipos de nós e relações.  

💡 **Explicação:** “Neste ponto, nosso banco já pensa em conexões — não mais em tabelas.”  

---

## 7️⃣ Execução das Queries de Detecção de Fraude

### 7.1 Ciclos Suspeitos (Lavagem de Dinheiro)
```cypher
MATCH (a:Account)-[r1:SENT]->(b:Account)-[r2:SENT]->(c:Account)-[r3:SENT]->(a)
WHERE duration.between(r1.ts, r3.ts).hours <= 48
RETURN a,b,c LIMIT 50;
```
Detecta **circuitos de transações em menos de 48 horas**, sugerindo **lavagem de dinheiro**.  
💥 **Destaque:** “Esse é o tipo de padrão que humanos nunca perceberiam — mas os grafos enxergam.”

### 7.2 Contas “Mulas” (Fan-in Alto)
```cypher
MATCH (dst:Account)<-[r:SENT]-()
WITH dst, count(DISTINCT r) AS total
WHERE total > 10
RETURN dst.id AS Conta, total AS TransacoesRecebidas
ORDER BY total DESC LIMIT 20;
```
Identifica contas que **recebem dinheiro de muitas outras** — típico de **contas intermediárias** usadas em fraudes.  

🔎 **Frase de impacto:** “Essas são as contas-mulas — o elo entre criminosos e dinheiro limpo.”

### 7.3 Risco Médio das Contas
```cypher
MATCH (a:Account)
RETURN avg(a.risk_score) AS MediaRisco, max(a.risk_score) AS MaiorRisco;
```
Calcula estatísticas globais do risco de fraude.  
🧠 **Comentário:** “Permite calibrar limites e descobrir se o sistema está sob ataque em massa.”

### 7.4 Visualizar Grupos Suspeitos
```cypher
MATCH (a:Account)-[r:SENT]->(b:Account)
WHERE r.amount > 3000
RETURN a,b,r LIMIT 100;
```
Foca em transações de **alto valor**, permitindo **visualização de clusters suspeitos**.  

💬 **Impacto visual:** “Aqui vemos o dinheiro se mover — quem envia, quem recebe e onde se concentram as fraudes.”

---

## 8️⃣ Detecção de Comunidades (GDS – Louvain)
**Comandos:**
```cypher
CALL gds.graph.drop('transacoes');
CALL gds.graph.project('transacoes', 'Account', {SENT: {type: 'SENT', orientation: 'NATURAL'}});
CALL gds.louvain.stream('transacoes')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).id AS Conta, communityId ORDER BY communityId LIMIT 100;
```
Aqui o sistema usa o **algoritmo Louvain** para detectar **grupos ocultos de contas conectadas** — comunidades financeiras suspeitas.  

💥 **Explicação poderosa:**  
“Essas comunidades revelam redes criminosas completas — contas que, mesmo sem transações diretas, compartilham padrões de envio, horários e valores.”

---

## 9️⃣ Limpeza e Manutenção
**Comando:** `CALL gds.graph.drop('transacoes');`  
Remove o grafo da memória, liberando recursos para novas análises.  
🧹 **Mensagem final:** “Aqui mostramos que o sistema pode ser reexecutado, limpo e escalado — como um radar de fraude em tempo real.”

---

## 🔟 Bônus – Visualização de Comunidades Coloridas
**Comando:**
```cypher
CALL gds.louvain.stream('transacoes')
YIELD nodeId, communityId
WITH gds.util.asNode(nodeId) AS conta, communityId
SET conta.community = communityId
RETURN conta LIMIT 200;
```
Adiciona uma propriedade `community` aos nós, permitindo **colorir e visualizar clusters de fraude**.  
🌈 **Demonstração:** “Cada cor representa um grupo de fraude — uma organização criminosa dentro do sistema.”

---

## 🏁 Conclusão da Demonstração
Ao final, os ouvintes verão:
- Um ambiente automatizado e inteligente.  
- Dados relacionais se transformando em insights de fraude.  
- Visualizações que traduzem crimes financeiros em grafos coloridos.  

🎯 **Fechamento:**  
“Com grafos, transformamos o invisível em visível.  
Onde havia números, agora enxergamos redes — e onde havia suspeita, agora há prova.”
