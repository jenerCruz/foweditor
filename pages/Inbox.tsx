import React, { useState } from "react";
import { FeatherSend, FeatherCopy, FeatherTrash, FeatherRefreshCw, FeatherCode, FeatherMessageSquare, FeatherSettings, FeatherInbox } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { TextArea } from "../ui/components/TextArea";
import { TextField } from "../ui/components/TextField";
import { Select } from "../ui/components/Select";
import { Badge } from "../ui/components/Badge";
import { Tabs } from "../ui/components/Tabs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatAgent {
  id: string;
  name: string;
  apiEndpoint: string;
  model: string;
}

const chatAgents: ChatAgent[] = [
  {
    id: "mistral",
    name: "Mistral AI",
    apiEndpoint: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-large-latest"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    model: "gemini-pro"
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4"
  }
];

const preloadedPrompts = [
  {
    id: "workflow-generator",
    name: "Generador de Workflows",
    prompt: "Eres un experto en Actionsflow. Ayúdame a crear un workflow que:",
    category: "Workflows"
  },
  {
    id: "yaml-debugger",
    name: "Depurador YAML",
    prompt: "Analiza este YAML de Actionsflow y encuentra errores o mejoras:",
    category: "Debugging"
  },
  {
    id: "trigger-config",
    name: "Configuración de Triggers",
    prompt: "Explícame cómo configurar el siguiente trigger en Actionsflow:",
    category: "Triggers"
  },
  {
    id: "action-helper",
    name: "Asistente de Acciones",
    prompt: "¿Cuál es la mejor acción de GitHub para realizar la siguiente tarea?",
    category: "Actions"
  },
  {
    id: "optimization",
    name: "Optimización de Performance",
    prompt: "Revisa mi workflow y sugiere optimizaciones para mejorar el rendimiento:",
    category: "Optimization"
  }
];

interface InboxProps {
  onBack?: () => void;
}

function Inbox({ onBack }: InboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("mistral");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !apiKey.trim()) {
      alert("Por favor ingrese un mensaje y una API key");
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    const agent = chatAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    try {
      let requestBody: any;
      let headers: any = {
        "Content-Type": "application/json"
      };

      if (selectedAgent === "mistral") {
        headers["Authorization"] = `Bearer ${apiKey}`;
        requestBody = {
          model: agent.model,
          messages: [
            { role: "system", content: "Eres un experto en Actionsflow y automatización de workflows." },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: inputMessage }
          ]
        };
      } else if (selectedAgent === "chatgpt") {
        headers["Authorization"] = `Bearer ${apiKey}`;
        requestBody = {
          model: agent.model,
          messages: [
            { role: "system", content: "Eres un experto en Actionsflow y automatización de workflows." },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: inputMessage }
          ]
        };
      } else if (selectedAgent === "gemini") {
        requestBody = {
          contents: [
            {
              parts: [
                { text: inputMessage }
              ]
            }
          ]
        };
      }

      const response = await fetch(agent.apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      let assistantContent = "";
      if (selectedAgent === "gemini") {
        assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
      } else {
        assistantContent = data.choices?.[0]?.message?.content || "Sin respuesta";
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: `Error al comunicarse con la API: ${error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background">
      <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
        <div className="flex items-center gap-3">
          <FeatherInbox className="text-heading-2 font-heading-2 text-brand-600" />
          <div className="flex flex-col gap-1">
            <span className="text-heading-2 font-heading-2 text-default-font">
              AI Chat Assistant
            </span>
            <span className="text-body font-body text-subtext-color">
              Conversaciones con agentes de IA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" icon={<FeatherMessageSquare />}>
            {messages.length} mensajes
          </Badge>
          <Button
            variant="neutral-secondary"
            size="small"
            icon={<FeatherRefreshCw />}
            onClick={clearChat}
          >
            Limpiar
          </Button>
        </div>
      </div>

      <div className="flex w-full grow shrink-0 basis-0 items-start overflow-hidden">
        <div className="flex w-80 flex-none flex-col items-start self-stretch border-r border-solid border-neutral-border bg-neutral-50 overflow-auto">
          <div className="flex w-full flex-col gap-4 px-4 py-4">
            <div className="flex flex-col gap-2">
              <span className="text-body-bold font-body-bold text-default-font">
                Configuración de Agente
              </span>
              <Select
                className="h-auto w-full flex-none"
                variant="filled"
                label="Agente IA"
                placeholder="Seleccionar agente"
                helpText=""
                icon={null}
                value={selectedAgent}
                onValueChange={(value: string) => setSelectedAgent(value)}
              >
                {chatAgents.map(agent => (
                  <Select.Item key={agent.id} value={agent.id}>
                    {agent.name}
                  </Select.Item>
                ))}
              </Select>

              <TextField
                className="h-auto w-full flex-none"
                variant="filled"
                label="API Key"
                helpText={`Clave para ${chatAgents.find(a => a.id === selectedAgent)?.name}`}
              >
                <TextField.Input
                  type="password"
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </TextField>

              <div className="flex flex-col gap-1 rounded-md border border-solid border-brand-200 bg-brand-50 p-3">
                <span className="text-caption-bold font-caption-bold text-brand-900">
                  Modelo: {chatAgents.find(a => a.id === selectedAgent)?.model}
                </span>
                <span className="text-caption font-caption text-brand-700">
                  Endpoint: {chatAgents.find(a => a.id === selectedAgent)?.apiEndpoint}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-body-bold font-body-bold text-default-font">
                Prompts Precargados
              </span>
              {preloadedPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  className="flex flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-default-background p-3 hover:border-brand-200 transition-all cursor-pointer"
                  onClick={() => handleApplyPrompt(prompt.prompt)}
                >
                  <div className="flex items-center gap-2">
                    <FeatherCode className="text-body font-body text-brand-600" />
                    <span className="text-body-bold font-body-bold text-default-font">
                      {prompt.name}
                    </span>
                  </div>
                  <Badge variant="neutral" icon={null}>
                    {prompt.category}
                  </Badge>
                  <span className="text-caption font-caption text-subtext-color">
                    {prompt.prompt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex grow shrink-0 basis-0 flex-col self-stretch">
          <div className="flex grow shrink-0 basis-0 flex-col gap-4 overflow-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
                  <FeatherMessageSquare className="text-heading-1 font-heading-1 text-brand-600" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Inicia una conversación
                  </span>
                  <span className="text-body font-body text-subtext-color text-center max-w-md">
                    Selecciona un agente de IA, ingresa tu API key y comienza a chatear
                  </span>
                </div>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-2 rounded-lg border border-solid p-4 ${
                    message.role === "user"
                      ? "border-brand-200 bg-brand-50 self-end max-w-2xl"
                      : "border-neutral-border bg-default-background self-start max-w-3xl"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={message.role === "user" ? "brand" : "neutral"}
                      icon={null}
                    >
                      {message.role === "user" ? "Usuario" : "Asistente"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-caption font-caption text-subtext-color">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="flex items-center justify-center hover:bg-neutral-100 rounded p-1"
                      >
                        <FeatherCopy className="text-caption font-caption text-subtext-color" />
                      </button>
                    </div>
                  </div>
                  <p className="text-body font-body text-default-font whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 self-start rounded-lg border border-solid border-neutral-border bg-default-background p-4">
                <div className="animate-spin h-4 w-4 border-2 border-brand-600 border-t-transparent rounded-full" />
                <span className="text-body font-body text-subtext-color">
                  Esperando respuesta...
                </span>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 border-t border-solid border-neutral-border bg-default-background px-6 py-4">
            <TextArea
              className="h-auto w-full flex-none"
              variant="filled"
              label=""
              helpText={`Conversando con ${chatAgents.find(a => a.id === selectedAgent)?.name}`}
            >
              <TextArea.Input
                placeholder="Escribe tu mensaje aquí..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </TextArea>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="neutral-secondary"
                size="small"
                icon={<FeatherTrash />}
                onClick={() => setInputMessage("")}
              >
                Limpiar
              </Button>
              <Button
                variant="brand-primary"
                size="small"
                icon={<FeatherSend />}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !apiKey.trim() || isLoading}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inbox;