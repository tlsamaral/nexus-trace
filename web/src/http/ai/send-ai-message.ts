import { api } from "../api-client";

interface MessageResponse {
  response: string
}

export async function sendAIMessage(message: string) {
  const res = await api.post("ai/query", {
    json: {
      message
    }
  })

  return res.json<MessageResponse>()
}