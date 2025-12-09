import React, { useState } from "react";
import { FeatherCopy, FeatherGlobe, FeatherKey, FeatherCode } from "@subframe/core";
import { TextField } from "../ui/components/TextField";
import { Switch } from "../ui/components/Switch";
import { IconButton } from "../ui/components/IconButton";
import { Accordion } from "../ui/components/Accordion";

interface WebhookConfig {
  owner: string;
  repo: string;
  workflowFile: string;
  triggerName: string;
  githubToken?: string;
  isLocalhost: boolean;
  responseCode: string;
  responseContentType: string;
  responseBody: string;
}

interface WebhookConfiguratorProps {
  config: WebhookConfig;
  onChange: (config: WebhookConfig) => void;
}

export function WebhookConfigurator({ config, onChange }: WebhookConfiguratorProps) {
  const generateWebhookUrl = (): string => {
    if (config.isLocalhost) {
      return `http://localhost:3000/webhook/${config.workflowFile}/${config.triggerName}`;
    }

    const baseUrl = `https://webhook.actionsflow.workers.dev/${config.owner}/${config.repo}/${config.workflowFile}/${config.triggerName}`;
    const params = new URLSearchParams();

    if (config.githubToken) {
      params.append("__token", config.githubToken);
    }
    if (config.responseCode !== "200") {
      params.append("__response_code", config.responseCode);
    }
    if (config.responseContentType !== "application/json") {
      params.append("__response_content_type", config.responseContentType);
    }
    if (config.responseBody !== '{"success":true}') {
      params.append("__response_body", config.responseBody);
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const generateCurlExample = (): string => {
    const webhookUrl = generateWebhookUrl();
    return `curl --request POST '${webhookUrl}' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{
    "key": "value",
    "data": {
      "title": "Example Event",
      "description": "This is a webhook test"
    }
  }'`;
  };

  const generateJavaScriptExample = (): string => {
    return `fetch('${generateWebhookUrl()}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    key: 'value',
    data: {
      title: 'Example Event',
      description: 'This is a webhook test'
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-md border border-solid border-success-200 bg-success-50 p-3">
        <div className="flex items-center gap-2">
          <FeatherGlobe className="text-body font-body text-success-600" />
          <span className="text-caption-bold font-caption-bold text-success-900">
            Webhook Configuration
          </span>
        </div>
        <span className="text-caption font-caption text-success-700">
          Configure your webhook endpoint to trigger workflows via HTTP requests from external services.
        </span>
      </div>

      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 px-4 py-3">
            <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
              Basic Configuration
            </span>
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={true}
      >
        <div className="flex w-full flex-col gap-4 px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-body-bold font-body-bold text-default-font">
                Self-hosted (localhost)
              </span>
              <span className="text-caption font-caption text-subtext-color">
                Use local development server instead of webhook2github service
              </span>
            </div>
            <Switch
              checked={config.isLocalhost}
              onCheckedChange={(checked) => onChange({ ...config, isLocalhost: checked })}
            />
          </div>

          {!config.isLocalhost && (
            <>
              <TextField
                className="h-auto w-full flex-none"
                variant="filled"
                label="GitHub Owner"
                helpText="Repository owner (user or organization)"
              >
                <TextField.Input
                  placeholder="actionsflow"
                  value={config.owner}
                  onChange={(e) => onChange({ ...config, owner: e.target.value })}
                />
              </TextField>

              <TextField
                className="h-auto w-full flex-none"
                variant="filled"
                label="Repository Name"
                helpText="Repository name"
              >
                <TextField.Input
                  placeholder="webhook2github"
                  value={config.repo}
                  onChange={(e) => onChange({ ...config, repo: e.target.value })}
                />
              </TextField>

              <TextField
                className="h-auto w-full flex-none"
                variant="filled"
                label="GitHub Token"
                helpText="Personal access token with repo scope"
                icon={<FeatherKey />}
              >
                <TextField.Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={config.githubToken || ""}
                  onChange={(e) => onChange({ ...config, githubToken: e.target.value })}
                />
              </TextField>
            </>
          )}

          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="Workflow File"
            helpText="Workflow filename (e.g., webhook.yml)"
          >
            <TextField.Input
              placeholder="webhook.yml"
              value={config.workflowFile}
              onChange={(e) => onChange({ ...config, workflowFile: e.target.value })}
            />
          </TextField>

          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="Trigger Name"
            helpText="Name of the webhook trigger in your workflow"
          >
            <TextField.Input
              placeholder="webhook"
              value={config.triggerName}
              onChange={(e) => onChange({ ...config, triggerName: e.target.value })}
            />
          </TextField>
        </div>
      </Accordion>

      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 px-4 py-3">
            <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
              Custom Response
            </span>
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={false}
      >
        <div className="flex w-full flex-col gap-4 px-4 pb-4">
          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="Response Code"
            helpText="HTTP response code"
          >
            <TextField.Input
              placeholder="200"
              value={config.responseCode}
              onChange={(e) => onChange({ ...config, responseCode: e.target.value })}
            />
          </TextField>

          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="Content Type"
            helpText="Response content type"
          >
            <TextField.Input
              placeholder="application/json"
              value={config.responseContentType}
              onChange={(e) => onChange({ ...config, responseContentType: e.target.value })}
            />
          </TextField>

          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="Response Body"
            helpText="Custom response body"
          >
            <TextField.Input
              placeholder='{"success":true}'
              value={config.responseBody}
              onChange={(e) => onChange({ ...config, responseBody: e.target.value })}
            />
          </TextField>
        </div>
      </Accordion>

      <div className="flex flex-col gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-caption-bold font-caption-bold text-default-font">
            Webhook URL
          </span>
          <IconButton
            size="small"
            icon={<FeatherCopy />}
            onClick={() => copyToClipboard(generateWebhookUrl())}
          />
        </div>
        <code className="text-caption font-caption text-subtext-color break-all">
          {generateWebhookUrl()}
        </code>
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-caption-bold font-caption-bold text-default-font">
            cURL Example
          </span>
          <IconButton
            size="small"
            icon={<FeatherCopy />}
            onClick={() => copyToClipboard(generateCurlExample())}
          />
        </div>
        <pre className="text-caption font-caption text-subtext-color whitespace-pre-wrap break-all">
          {generateCurlExample()}
        </pre>
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-caption-bold font-caption-bold text-default-font">
            JavaScript/Fetch Example
          </span>
          <IconButton
            size="small"
            icon={<FeatherCopy />}
            onClick={() => copyToClipboard(generateJavaScriptExample())}
          />
        </div>
        <pre className="text-caption font-caption text-subtext-color whitespace-pre-wrap break-all" style={{ fontFamily: "monospace" }}>
          {generateJavaScriptExample()}
        </pre>
      </div>
    </div>
  );
}
