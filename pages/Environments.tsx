import React, { useState } from "react";
import { FeatherKey, FeatherPlus, FeatherEdit2, FeatherTrash, FeatherCopy, FeatherEye, FeatherEyeOff, FeatherLock, FeatherGlobe, FeatherCode } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { TextField } from "../ui/components/TextField";
import { TextArea } from "../ui/components/TextArea";
import { Select } from "../ui/components/Select";
import { Badge } from "../ui/components/Badge";
import { IconButton } from "../ui/components/IconButton";
import * as SubframeCore from "@subframe/core";

interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
  type: "api_key" | "oauth2" | "secret" | "config";
  description?: string;
  createdAt: Date;
}

const initialVariables: EnvironmentVariable[] = [
  {
    id: "1",
    name: "GITHUB_TOKEN",
    value: "ghp_xxxxxxxxxxxxxxxxxxxx",
    type: "api_key",
    description: "Token de acceso personal de GitHub",
    createdAt: new Date("2024-01-15")
  },
  {
    id: "2",
    name: "OPENAI_API_KEY",
    value: "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
    type: "api_key",
    description: "Clave API de OpenAI",
    createdAt: new Date("2024-01-20")
  },
  {
    id: "3",
    name: "SLACK_WEBHOOK_URL",
    value: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX",
    type: "config",
    description: "URL del webhook de Slack",
    createdAt: new Date("2024-01-25")
  }
];

interface EnvironmentsProps {
  onBack?: () => void;
}

function Environments({ onBack }: EnvironmentsProps) {
  const [variables, setVariables] = useState<EnvironmentVariable[]>(initialVariables);
  const [showDialog, setShowDialog] = useState(false);
  const [editingVariable, setEditingVariable] = useState<EnvironmentVariable | null>(null);
  const [showValue, setShowValue] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    type: "api_key" as EnvironmentVariable["type"],
    description: ""
  });

  const handleAddVariable = () => {
    const newVariable: EnvironmentVariable = {
      id: Date.now().toString(),
      name: formData.name,
      value: formData.value,
      type: formData.type,
      description: formData.description,
      createdAt: new Date()
    };

    if (editingVariable) {
      setVariables(prev =>
        prev.map(v => v.id === editingVariable.id ? { ...newVariable, id: editingVariable.id } : v)
      );
    } else {
      setVariables(prev => [...prev, newVariable]);
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEditVariable = (variable: EnvironmentVariable) => {
    setEditingVariable(variable);
    setFormData({
      name: variable.name,
      value: variable.value,
      type: variable.type,
      description: variable.description || ""
    });
    setShowDialog(true);
  };

  const handleDeleteVariable = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta variable?")) {
      setVariables(prev => prev.filter(v => v.id !== id));
    }
  };

  const toggleShowValue = (id: string) => {
    setShowValue(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      value: "",
      type: "api_key",
      description: ""
    });
    setEditingVariable(null);
  };

  const getTypeIcon = (type: EnvironmentVariable["type"]) => {
    switch (type) {
      case "api_key":
        return <FeatherKey className="text-body font-body text-brand-600" />;
      case "oauth2":
        return <FeatherLock className="text-body font-body text-success-600" />;
      case "secret":
        return <FeatherEyeOff className="text-body font-body text-error-600" />;
      case "config":
        return <FeatherCode className="text-body font-body text-warning-600" />;
    }
  };

  const getTypeBadgeVariant = (type: EnvironmentVariable["type"]) => {
    switch (type) {
      case "api_key":
        return "brand";
      case "oauth2":
        return "success";
      case "secret":
        return "error";
      case "config":
        return "warning";
    }
  };

  const generateOAuth2Code = () => {
    return `const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/oauth/callback'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/userinfo.profile']
});`;
  };

  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background">
      <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
            <FeatherKey className="text-heading-3 font-heading-3 text-success-600" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Environments & Secrets
            </span>
            <span className="text-body font-body text-subtext-color">
              Gestiona claves API, OAuth2 y variables de entorno
            </span>
          </div>
        </div>
        <Button
          variant="brand-primary"
          icon={<FeatherPlus />}
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          Nueva Variable
        </Button>
      </div>

      <div className="flex w-full grow shrink-0 basis-0 items-start overflow-hidden">
        <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch overflow-auto px-8 py-6">
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2 rounded-lg border border-solid border-warning-200 bg-warning-50 p-4">
              <div className="flex items-center gap-2">
                <FeatherLock className="text-body font-body text-warning-600" />
                <span className="text-body-bold font-body-bold text-warning-900">
                  Seguridad de Variables
                </span>
              </div>
              <span className="text-body font-body text-warning-700">
                Las variables de entorno son sensibles. Nunca las compartas en repositorios públicos o logs.
                Usa referencias como $&#123;&#123; secrets.NOMBRE_VARIABLE &#125;&#125; en tus workflows.
              </span>
            </div>

            <div className="flex w-full flex-col gap-3">
              <span className="text-heading-3 font-heading-3 text-default-font">
                Variables de Entorno ({variables.length})
              </span>

              {variables.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 rounded-lg border border-dashed border-neutral-border">
                  <FeatherKey className="text-heading-1 font-heading-1 text-subtext-color" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-heading-3 font-heading-3 text-subtext-color">
                      No hay variables configuradas
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Agrega tu primera variable de entorno
                    </span>
                  </div>
                  <Button
                    variant="brand-primary"
                    icon={<FeatherPlus />}
                    onClick={() => setShowDialog(true)}
                  >
                    Agregar Variable
                  </Button>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-3">
                  {variables.map(variable => (
                    <div
                      key={variable.id}
                      className="flex items-start gap-4 rounded-lg border border-solid border-neutral-border bg-default-background p-4 hover:border-brand-200 transition-all"
                    >
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-neutral-100">
                        {getTypeIcon(variable.type)}
                      </div>
                      <div className="flex grow flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-body-bold font-body-bold text-default-font">
                            {variable.name}
                          </span>
                          <Badge variant={getTypeBadgeVariant(variable.type)} icon={null}>
                            {variable.type.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        {variable.description && (
                          <span className="text-body font-body text-subtext-color">
                            {variable.description}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded-md border border-solid border-neutral-border bg-neutral-50 px-3 py-2 text-caption font-caption text-default-font font-mono">
                            {showValue[variable.id] ? variable.value : "•".repeat(20)}
                          </code>
                          <IconButton
                            size="small"
                            icon={showValue[variable.id] ? <FeatherEyeOff /> : <FeatherEye />}
                            onClick={() => toggleShowValue(variable.id)}
                          />
                          <IconButton
                            size="small"
                            icon={<FeatherCopy />}
                            onClick={() => copyToClipboard(variable.value)}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-caption font-caption text-subtext-color">
                            Creada: {variable.createdAt.toLocaleDateString()}
                          </span>
                          <span className="text-caption font-caption text-subtext-color">
                            Uso: $&#123;&#123; secrets.{variable.name} &#125;&#125;
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconButton
                          icon={<FeatherEdit2 />}
                          onClick={() => handleEditVariable(variable)}
                        />
                        <IconButton
                          icon={<FeatherTrash />}
                          onClick={() => handleDeleteVariable(variable.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-96 flex-none flex-col items-start self-stretch border-l border-solid border-neutral-border bg-neutral-50 overflow-auto">
          <div className="flex w-full flex-col gap-6 px-4 py-4">
            <div className="flex flex-col gap-2">
              <span className="text-body-bold font-body-bold text-default-font">
                Guía Rápida
              </span>
              <div className="flex flex-col gap-2 rounded-lg border border-solid border-brand-200 bg-brand-50 p-3">
                <span className="text-caption-bold font-caption-bold text-brand-900">
                  Uso en Workflows
                </span>
                <code className="text-caption font-caption text-brand-700 whitespace-pre-wrap break-all font-mono">
                  $&#123;&#123; secrets.GITHUB_TOKEN &#125;&#125;
                </code>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-body-bold font-body-bold text-default-font">
                OAuth 2.0 Setup
              </span>
              <div className="flex flex-col gap-2 rounded-lg border border-solid border-success-200 bg-success-50 p-3">
                <span className="text-caption-bold font-caption-bold text-success-900">
                  Ejemplo de Configuración
                </span>
                <pre className="text-caption font-caption text-success-700 whitespace-pre-wrap break-all font-mono">
                  {generateOAuth2Code()}
                </pre>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-body-bold font-body-bold text-default-font">
                Tipos de Variables
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 rounded-lg border border-solid border-neutral-border bg-default-background p-3">
                  {getTypeIcon("api_key")}
                  <div className="flex flex-col gap-1">
                    <span className="text-caption-bold font-caption-bold text-default-font">
                      API Key
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      Claves de acceso a servicios externos
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-solid border-neutral-border bg-default-background p-3">
                  {getTypeIcon("oauth2")}
                  <div className="flex flex-col gap-1">
                    <span className="text-caption-bold font-caption-bold text-default-font">
                      OAuth2
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      Tokens de autenticación OAuth
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-solid border-neutral-border bg-default-background p-3">
                  {getTypeIcon("secret")}
                  <div className="flex flex-col gap-1">
                    <span className="text-caption-bold font-caption-bold text-default-font">
                      Secret
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      Contraseñas y datos sensibles
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-solid border-neutral-border bg-default-background p-3">
                  {getTypeIcon("config")}
                  <div className="flex flex-col gap-1">
                    <span className="text-caption-bold font-caption-bold text-default-font">
                      Config
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      URLs y configuraciones generales
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubframeCore.Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <SubframeCore.Dialog.Portal>
          <SubframeCore.Dialog.Overlay className="fixed inset-0 bg-black/60" />
          <SubframeCore.Dialog.Content asChild>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] flex flex-col items-start gap-6 rounded-lg border border-solid border-neutral-border bg-default-background shadow-xl px-6 py-6">
              <div className="flex w-full items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                  <FeatherKey className="text-heading-3 font-heading-3 text-success-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    {editingVariable ? "Editar Variable" : "Nueva Variable"}
                  </span>
                  <span className="text-body font-body text-subtext-color">
                    Configure una nueva variable de entorno
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-4">
                <TextField
                  variant="filled"
                  label="Nombre de Variable"
                  helpText="Usar MAYÚSCULAS_CON_GUION_BAJO"
                >
                  <TextField.Input
                    placeholder="GITHUB_TOKEN"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  />
                </TextField>

                <Select
                  variant="filled"
                  label="Tipo"
                  value={formData.type}
                  onValueChange={(value: string) => setFormData({ ...formData, type: value as EnvironmentVariable["type"] })}
                >
                  <Select.Item value="api_key">API Key</Select.Item>
                  <Select.Item value="oauth2">OAuth2</Select.Item>
                  <Select.Item value="secret">Secret</Select.Item>
                  <Select.Item value="config">Config</Select.Item>
                </Select>

                <TextArea
                  variant="filled"
                  label="Valor"
                  helpText="El valor de la variable (será encriptado)"
                >
                  <TextArea.Input
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    rows={3}
                  />
                </TextArea>

                <TextField
                  variant="filled"
                  label="Descripción (Opcional)"
                  helpText="Breve descripción del uso de esta variable"
                >
                  <TextField.Input
                    placeholder="Token de acceso personal de GitHub"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </TextField>
              </div>

              <div className="flex w-full items-center gap-2">
                <Button
                  className="grow shrink-0 basis-0"
                  variant="neutral-secondary"
                  onClick={() => {
                    setShowDialog(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="grow shrink-0 basis-0"
                  variant="brand-primary"
                  onClick={handleAddVariable}
                  disabled={!formData.name || !formData.value}
                >
                  {editingVariable ? "Actualizar" : "Crear Variable"}
                </Button>
              </div>
            </div>
          </SubframeCore.Dialog.Content>
        </SubframeCore.Dialog.Portal>
      </SubframeCore.Dialog.Root>
    </div>
  );
}

export default Environments;
