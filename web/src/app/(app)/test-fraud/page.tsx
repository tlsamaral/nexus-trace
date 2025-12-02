"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { 
  getFraudTestScenario, 
  type FraudTestScenario 
} from "@/http/test-fraud/get-scenario";

import { 
  sendFraudTestTransaction, 
  type FraudTestResult 
} from "@/http/test-fraud/send-transaction";

import {
  IconArrowRight,
  IconRefresh,
  IconWallet,
  IconUser,
} from "@tabler/icons-react";
import { Loader } from "lucide-react";

export default function TestFraudPage() {
  const [scenario, setScenario] = useState<FraudTestScenario | null>(null);
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<FraudTestResult | null>(null);

  async function loadScenario() {
    const data = await getFraudTestScenario();
    setScenario(data);
    setResult(null);
    setAmount("");
  }

  async function handleSendTest() {
    if (!scenario) return;

    const raw = amount.replace(/\D/g, "");
    const numericValue = parseFloat(raw) / 100;

    const res = await sendFraudTestTransaction({
      origin_id: scenario.origin.id,
      dest_id: scenario.dest.id,
      amount: numericValue,
      threshold: scenario.threshold,
    });

    setResult(res);
  }

  useEffect(() => {
    loadScenario();
  }, []);

  if (!scenario)
    return (
      <div className="h-full w-full flex items-center justify-center"> 
          <Loader className="animate-spin size-6" />
      </div>
    )

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teste de Simulação de Fraude</h1>
        <p className="text-muted-foreground">
          Execute transações simuladas e visualize explicabilidade em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser size={20} /> Conta Origem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>ID: <strong>{scenario.origin.id}</strong></p>
            <p>Comunidade: <strong>{scenario.origin.community}</strong></p>
            <p>Score de risco: <strong>{scenario.origin.risk}%</strong></p>
          </CardContent>
        </Card>

        {/* Destino */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser size={20} /> Conta Destino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>ID: <strong>{scenario.dest.id}</strong></p>
            <p>Comunidade: <strong>{scenario.dest.community}</strong></p>
            <p>Score de risco: <strong>{scenario.dest.risk}%</strong></p>
          </CardContent>
        </Card>

        {/* Threshold */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconWallet size={20} /> Limiar de Fraude
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold text-red-600">
              R$ {scenario.threshold.toLocaleString("pt-BR")}
            </p>
            <p className="text-muted-foreground text-sm">{scenario.explain}</p>
          </CardContent>
        </Card>

      </div>

      <Button
        onClick={loadScenario}
        variant="secondary"
        className="flex gap-2"
      >
        <IconRefresh size={16} /> Gerar novo cenário
      </Button>

      {/* Formulário */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Realizar teste</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Valor da transação
            </label>

            <Input
              value={amount}
              onChange={(e) => {
                let raw = e.target.value.replace(/\D/g, "");
                setAmount(
                  (parseInt(raw || "0") / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                );
              }}
            />
          </div>

          <Button onClick={handleSendTest} className="w-full flex gap-2">
            Testar transação <IconArrowRight size={16} />
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Resultado da análise</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Risco detectado</span>
              <Badge variant={result.fraud ? "destructive" : "secondary"}>
                {result.fraud ? "Fraude detectada" : "Transação normal"}
              </Badge>
            </div>

            <Progress value={result.risk} />
            <p className="text-xs text-muted-foreground">{result.risk}%</p>

            <div className="pt-4 space-y-2">
              <h3 className="font-semibold">Explicabilidade</h3>
              <ul className="list-disc ml-6 text-sm">
                {result.explain.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}