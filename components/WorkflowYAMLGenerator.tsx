import React from "react";
import { FeatherCopy, FeatherDownload, FeatherCheck } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { TextArea } from "../ui/components/TextArea";

interface TriggerConfig {
  id: string;
  name: string;
  type: string;
  url?: string;
  config?: any;
}

interface JobConfig {
  id: string;
  name: string;
  runsOn: string;
  steps: any[];
}

interface WorkflowData {
  name: string;
  triggers: TriggerConfig[];
  jobs: JobConfig[];
}

interface WorkflowYAMLGeneratorProps {
  workflow: WorkflowData;
  onValidate?: () => void;
}

export function WorkflowYAMLGenerator({ workflow, onValidate }: WorkflowYAMLGeneratorProps) {
  const generateYAML = (): string => {
    let yaml = `# ${workflow.name}\n\n`;

    if (workflow.triggers.length > 0) {
      yaml += "on:\n";
      workflow.triggers.forEach(trigger => {
        yaml += `  ${trigger.type}:\n`;
        if (trigger.url) {
          yaml += `    url: ${trigger.url}\n`;
        }
        if (trigger.config) {
          yaml += `    config:\n`;
          
          if (trigger.config.filterOutputs) {
            yaml += `      filterOutputs:\n`;
            Object.entries(trigger.config.filterOutputs).forEach(([key, val]) => {
              yaml += `        ${key}: ${val}\n`;
            });
          }
          
          if (trigger.config.filterScript) {
            yaml += `      filterScript: |\n`;
            trigger.config.filterScript.split("\n").forEach((line: string) => {
              yaml += `        ${line}\n`;
            });
          }
          
          if (trigger.config.format) {
            yaml += `      format: |\n`;
            trigger.config.format.split("\n").forEach((line: string) => {
              yaml += `        ${line}\n`;
            });
          }
          
          if (trigger.config.outputsMode && trigger.config.outputsMode !== "separate") {
            yaml += `      outputsMode: ${trigger.config.outputsMode}\n`;
          }
          
          if (trigger.config.exportOutputs) {
            yaml += `      exportOutputs: true\n`;
          }
          
          if (trigger.config.deduplicationKey) {
            yaml += `      deduplicationKey: ${trigger.config.deduplicationKey}\n`;
          }
        }
      });
      yaml += "\n";
    }

    if (workflow.jobs.length > 0) {
      yaml += "jobs:\n";
      workflow.jobs.forEach(job => {
        yaml += `  ${job.id}:\n`;
        yaml += `    name: ${job.name}\n`;
        yaml += `    runs-on: ${job.runsOn}\n`;
        yaml += `    steps:\n`;
        job.steps.forEach(step => {
          if (step.name) {
            yaml += `      - name: ${step.name}\n`;
          } else {
            yaml += `      -`;
          }
          
          if (step.uses) {
            yaml += `        uses: ${step.uses}\n`;
          }
          
          if (step.run) {
            yaml += `        run: |\n`;
            step.run.split("\n").forEach((line: string) => {
              yaml += `          ${line}\n`;
            });
          }
          
          if (step.with) {
            yaml += `        with:\n`;
            Object.entries(step.with).forEach(([key, val]) => {
              yaml += `          ${key}: ${val}\n`;
            });
          }
          
          if (step.env) {
            yaml += `        env:\n`;
            Object.entries(step.env).forEach(([key, val]) => {
              yaml += `          ${key}: ${val}\n`;
            });
          }
        });
      });
    }

    return yaml;
  };

  const yamlContent = generateYAML();

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, "-")}.yml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-body-bold font-body-bold text-default-font">
          Generated YAML
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-secondary"
            size="small"
            icon={<FeatherCheck />}
            onClick={onValidate}
          >
            Validate
          </Button>
          <Button
            variant="neutral-secondary"
            size="small"
            icon={<FeatherCopy />}
            onClick={handleCopy}
          >
            Copy
          </Button>
          <Button
            variant="brand-secondary"
            size="small"
            icon={<FeatherDownload />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-solid border-brand-200 bg-brand-50 p-3">
        <span className="text-caption-bold font-caption-bold text-brand-900">
          📋 Actionsflow YAML
        </span>
        <span className="text-caption font-caption text-brand-700">
          This YAML is ready to use in your .github/workflows directory. Commit and push to activate your workflow.
        </span>
      </div>

      <TextArea
        className="h-auto w-full flex-none"
        variant="filled"
        label=""
        helpText={`${workflow.triggers.length} triggers, ${workflow.jobs.length} jobs`}
      >
        <TextArea.Input
          value={yamlContent}
          readOnly
          rows={20}
          style={{ fontFamily: "monospace", fontSize: "12px" }}
        />
      </TextArea>
    </div>
  );
}
