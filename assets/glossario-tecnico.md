# Glossário Técnico do Sistema Antifraude baseado em Grafos e Neo4j

Este glossário reúne termos, cálculos, métricas, métodos e conceitos utilizados no sistema antifraude.
Cada entrada contém: definição, onde é usada no sistema e por que é relevante.

---

## A

### **Account (Nó de Conta)**
Representa uma conta financeira no grafo.  
**Usado em:** todas as operações — projeção GDS, cálculos de risco, transações, comunidades.  
**Importância:** é o elemento central da análise.

---

## C

### **Cypher**
Linguagem de consulta do Neo4j.  
**Usado em:** todas as queries de cálculo, projeção e filtros.  
**Importância:** permite consultar e manipular grafos de forma declarativa.

---

## D

### **Datetime / Duration**
Tipos nativos do Neo4j para tempo.  
**Usado em:** filtro de transações nas últimas 24h (`datetime() - duration('PT24H')`).  
**Importância:** fundamental para análises temporais.

---

## E

### **Edge (Aresta)**
Representa uma transação entre contas (`SENT`).  
**Usado em:** fan-in, fan-out, volume, padrões suspeitos.  
**Importância:** os comportamentos fraudulentos acontecem nas conexões.

### **Engine Antifraude**
Conjunto de cálculos que determinam o score final de risco.  
**Usado em:** endpoint `/account/`.  
**Importância:** núcleo lógico que decide risco.

---

## F

### **Fan-In**
Número de transações recebidas por uma conta.  
**Importância:** contas com alto fan-in costumam ser "mulas financeiras".

### **Fan-Out**
Número de transações enviadas.  
**Importância:** indica dispersão rápida de capital.

### **Fraude**
Evento detectado quando métricas superam thresholds estatísticos.

---

## G

### **GDS (Graph Data Science)**
Biblioteca do Neo4j para algoritmos de grafos.  
**Usado em:** Louvain, projeção do grafo.  
**Importância:** oferece performance e escalabilidade.

### **Grau (Degree)**
Quantidade de conexões de um nó.  
**Usado em:** análise comportamental.

---

## H

### **Histórico de Transações**
Base das análises de média, desvio e volume.  
**Importância:** define o comportamento “normal”.

---

## L

### **Louvain**
Algoritmo de detecção de comunidades.  
**Usado em:** clusterização das contas para detectar grupos naturais.  
**Importância:** transações fora da comunidade podem indicar risco.

### **LastActivity**
Data/hora da última transação.  
**Usado em:** exibição no painel e triagem.

---

## M

### **Map / Collect**
Funções Cypher para agrupar e estruturar dados.  
**Exemplo:**  
`collect({amount: t.amount, ts: t.ts})`  
**Importância:** viabilizam análises complexas em uma única query.

---

## N

### **Neo4j**
Banco de dados orientado a grafos.  
**Importância:** nativamente adequado para transações e redes.

---

## P

### **Pipeline Antifraude**
Fluxo completo que ocorre ao carregar o sistema:  
1. Importação CSV  
2. Projeção GDS  
3. Louvain  
4. Escrita das comunidades  
5. Cálculo de lastActivity  
6. Endpoints de risco

---

## R

### **Risk_24h**
Score final (0 a 100) de risco da conta.  
**Composto por:**  
- Z-score (0–60)  
- Activity score (0–20)  
- Community score (0–20)

### **Reduce**
Função de agregação utilizada no Cypher.  
**Exemplo:**  
`reduce(s = 0.0, x IN amounts24 | s + x)`  
**Importância:** soma eficiente de listas.

---

## S

### **Relationship SENT**
Aresta que representa uma transação do nó A → B.  
**Importância:** é o núcleo do modelo de fraude.

### **Stdev**
Desvio padrão estatístico.  
**Usado em:** threshold dinâmico e cálculo de z-score.  
**Importância:** mede quanto os valores se desviam da média.

---

## T

### **Threshold Dinâmico**
Calculado como:  
`média + (2.5 × desvio padrão)`  
**Usado em:** simulação e análise real de fraude.  
**Importância:** se ajusta ao comportamento histórico.

### **Transações 24h**
Filtro temporal importante para comportamento recente.  
**Usado em:** volume24h, activity_score.

---

## U

### **Uncommon Percent**
Percentual de transações enviadas para outra comunidade.  
**Importância:** contas que enviam valores para comunidades “longe” tendem a ser mais suspeitas.

---

## Z

### **Z-Score**
Medida estatística que indica o quão anômalo um valor é.  
**Usado em:** cálculo do z_score → parte mais importante do risco total.  
**Importância:** detecta desvios com robustez matemática.

---