// /hooks/use-chat-suggestions.ts

export function useChatSuggestions() {
  function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const suggestions = [
    `Exibir resumo da conta ${random(1, 500)}`,
    `Quero ver anomalias da conta ${random(1, 500)}`,
    `Consultar risco da conta ${random(1, 500)}`,
    `Listar transações da conta ${random(1, 500)}`,
    `Ver detalhes da transação ${random(100, 5000)}`,
  ];

  return suggestions;
}