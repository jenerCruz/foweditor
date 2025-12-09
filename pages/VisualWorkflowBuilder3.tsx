import React, { useState, useCallback } from "react";
import ReactFlow, { Controls, Background, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection, NodeChange, EdgeChange } from "reactflow";
import "reactflow/dist/style.css";
import { FeatherBox } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherCopy } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherGitBranch } from "@subframe/core";
import { FeatherKey } from "@subframe/core";
import { FeatherLayers } from "@subframe/core";
import { FeatherLink } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlay } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherRss } from "@subframe/core";
import { FeatherSave } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherUpload } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { FeatherGlobe } from "@subframe/core";
import { FeatherCode } from "@subframe/core";
import { FeatherMail } from "@subframe/core";
import { FeatherSlack } from "@subframe/core";
import { FeatherAlertCircle } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { Accordion } from "../ui/components/Accordion";
import { Badge } from "../ui/components/Badge";
import { Breadcrumbs } from "../ui/components/Breadcrumbs";
import { Button } from "../ui/components/Button";
import { DropdownMenu } from "../ui/components/DropdownMenu";
import { IconButton } from "../ui/components/IconButton";
import { Select } from "../ui/components/Select";
import { Switch } from "../ui/components/Switch";
import { TextArea } from "../ui/components/TextArea";
import { TextField } from "../ui/components/TextField";
import { DefaultPageLayout } from "../ui/layouts/DefaultPageLayout";
import { validateYAML, ValidationLog } from "../utils/yamlValidator";
import { TriggerConfigForm, TriggerConfig } from "../components/TriggerConfigForm";
import { JobStepEditor, Job, JobStep } from "../components/JobStepEditor";
import { WorkflowYAMLGenerator } from "../components/WorkflowYAMLGenerator";
import { WebhookConfigurator } from "../components/WebhookConfigurator";

interface WorkflowJSON {
  name: string;
  triggers: TriggerConfigFull[];
  jobs: Job[];
}

interface TriggerConfigFull {
  id: string;
  name: string;
  type: string;
  url?: string;
  config?: TriggerConfig;
}

interface Job {
  id: string;
  name: string;
  runsOn: string;
  steps: JobStep[];
}

interface JobStep {
  uses: string;
  with?: Record<string, string>;
}

interface VisualWorkflowBuilder3Props {
  onNavigateToTriggers?: () => void;
  onNavigateToInbox?: () => void;
  onNavigateToEnvironments?: () => void;
  onNavigateToHome?: () => void;
}

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

const triggerTemplate = `module.exports = class Example {
  constructor({ helpers, options }) {
    this.options = options;
    this.helpers = helpers;
  }

  async run() {
    const items = [
      {
        id: "uniqueId",
        title: "hello world title",
      },
    ];
    return items;
  }
};`;

function VisualWorkflowBuilder3({ 
  onNavigateToTriggers, 
  onNavigateToInbox, 
  onNavigateToEnvironments,
  onNavigateToHome 
}: VisualWorkflowBuilder3Props) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [workflowJSON, setWorkflowJSON] = useState<WorkflowJSON>({
    name: "New Workflow",
    triggers: [],
    jobs: []
  });
  const [yamlContent, setYamlContent] = useState("");
  const [triggerName, setTriggerName] = useState("");
  const [triggerType, setTriggerType] = useState("");
  const [triggerUrl, setTriggerUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [includePattern, setIncludePattern] = useState("");
  const [excludePattern, setExcludePattern] = useState("");
  const [filterTitle, setFilterTitle] = useState(true);
  const [filterLink, setFilterLink] = useState(true);
  const [filterContent, setFilterContent] = useState(false);
  const [exportOutputs, setExportOutputs] = useState(false);
  const [customFormat, setCustomFormat] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobName, setJobName] = useState("");
  const [runsOn, setRunsOn] = useState("");
  const [action, setAction] = useState("");
  const [event, setEvent] = useState("");
  const [key, setKey] = useState("");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [owner, setOwner] = useState("actionsflow");
  const [repo, setRepo] = useState("webhook2github");
  const [workflowFile, setWorkflowFile] = useState("webhook.yml");
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [responseCode, setResponseCode] = useState("200");
  const [responseContentType, setResponseContentType] = useState("application/json");
  const [responseBody, setResponseBody] = useState('{"success":true}');
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationLogs, setValidationLogs] = useState<ValidationLog[]>([]);
  const [isValidationSuccess, setIsValidationSuccess] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [rightPanelView, setRightPanelView] = useState<"config" | "outputs">("config");
  
  const [customTriggerName, setCustomTriggerName] = useState("");
  const [customTriggerCode, setCustomTriggerCode] = useState(triggerTemplate);
  const [triggerPackageType, setTriggerPackageType] = useState("local");
  const [triggerOptions, setTriggerOptions] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [webhookConfig, setWebhookConfig] = useState({
    owner: "actionsflow",
    repo: "webhook2github",
    workflowFile: "webhook.yml",
    triggerName: "webhook",
    githubToken: "",
    isLocalhost: false,
    responseCode: "200",
    responseContentType: "application/json",
    responseBody: '{"success":true}'
  });

  const [editingTriggerIndex, setEditingTriggerIndex] = useState<number | null>(null);
  const [editingJobIndex, setEditingJobIndex] = useState<number | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const validateTriggerName = (name: string) => {
    const isSnakeCase = /^[a-z][a-z0-9_]*$/.test(name);
    return isSnakeCase;
  };

  const generateTriggerUsageExample = () => {
    const name = customTriggerName || "example_trigger";
    const triggerAccessor = customTriggerName.includes('_') 
      ? `on.${name}.outputs.param` 
      : `on['${name}'].outputs.param`;
    
    return `on:\\n  ${name}:\\n    ${triggerOptions || 'option: value'}\\n\\njobs:\\n  my_job:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - name: Use trigger output\\n        run: echo "${triggerAccessor}"`;
  };

  const generateWebhookUrl = () => {
    const triggerNameValue = triggerName || "webhook";
    const workflowFileName = workflowFile || "workflow.yml";
    
    if (isLocalhost) {
      return `http://localhost:3000/webhook/${workflowFileName}/${triggerNameValue}`;
    }
    
    const baseUrl = `https://webhook.actionsflow.workers.dev/${owner}/${repo}/${workflowFileName}/${triggerNameValue}`;
    const params = new URLSearchParams();
    
    if (githubToken) {
      params.append("__token", githubToken);
    }
    if (responseCode !== "200") {
      params.append("__response_code", responseCode);
    }
    if (responseContentType !== "application/json") {
      params.append("__response_content_type", responseContentType);
    }
    if (responseBody !== '{"success":true}') {
      params.append("__response_body", responseBody);
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const generateCurlExample = () => {
    const webhookUrl = generateWebhookUrl();
    return `curl --request POST '${webhookUrl}' \\\\\\n  --header 'Content-Type: application/json' \\\\\\n  --data-raw '{\\n    "key": "value"\\n  }'`;
  };

  const copyWebhookUrl = () => {
    const url = generateWebhookUrl();
    navigator.clipboard.writeText(url);
  };

  const copyCurlExample = () => {
    const curl = generateCurlExample();
    navigator.clipboard.writeText(curl);
  };

  const generateFilterOutputs = () => {
    const filters: string[] = [];
    if (filterTitle) filters.push("      title: 1");
    if (filterLink) filters.push("      link: 1");
    if (filterContent) filters.push("      contentSnippet: 1");
    return filters.length > 0 ? `\\n    config:\\n      filterOutputs:\\n${filters.join("\\n")}` : "";
  };

  const convertJSONToYAML = (json: WorkflowJSON): string => {
    let yaml = `# ${json.name}\\n\\n`;
    
    if (json.triggers.length > 0) {
      yaml += "on:\\n";
      json.triggers.forEach(trigger => {
        yaml += `  ${trigger.type}:\\n`;
        if (trigger.url) {
          yaml += `    url: ${trigger.url}\\n`;
        }
        if (trigger.config) {
          yaml += `    config:\\n`;
          if (trigger.config.active !== undefined) {
            yaml += `      active: ${trigger.config.active}\\n`;
          }
          if (trigger.config.filterOutputs) {
            yaml += `      filterOutputs:\\n`;
            Object.entries(trigger.config.filterOutputs).forEach(([key, val]) => {
              yaml += `        ${key}: ${val}\\n`;
            });
          }
          if (trigger.config.exportOutputs) {
            yaml += `      exportOutputs: true\\n`;
          }
          if (trigger.config.format) {
            yaml += `      format: |\\n        ${trigger.config.format}\\n`;
          }
        }
      });
      yaml += "\\n";
    }
    
    if (json.jobs.length > 0) {
      yaml += "jobs:\\n";
      json.jobs.forEach(job => {
        yaml += `  ${job.id}:\\n`;
        yaml += `    name: ${job.name}\\n`;
        yaml += `    runs-on: ${job.runsOn}\\n`;
        yaml += `    steps:\\n`;
        job.steps.forEach(step => {
          yaml += `      - uses: ${step.uses}\\n`;
          if (step.with) {
            yaml += `        with:\\n`;
            Object.entries(step.with).forEach(([key, val]) => {
              yaml += `          ${key}: ${val}\\n`;
            });
          }
        });
      });
    }
    
    return yaml;
  };

  const generateYaml = () => {
    const yaml = convertJSONToYAML(workflowJSON);
    setYamlContent(yaml);
  };

  const addTriggerToWorkflow = () => {
    const newTrigger: TriggerConfigFull = {
      id: `trigger-${workflowJSON.triggers.length + 1}`,
      name: triggerName || `${triggerType}_trigger`,
      type: triggerType || "rss",
      url: triggerUrl,
      config: {
        active: isActive,
        filterOutputs: {
          ...(filterTitle && { title: 1 }),
          ...(filterLink && { link: 1 }),
          ...(filterContent && { contentSnippet: 1 })
        },
        exportOutputs,
        format: customFormat || undefined
      }
    };
    
    setWorkflowJSON(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger]
    }));
    
    const newNode: Node = {
      id: newTrigger.id,
      type: "input",
      data: { label: `${triggerType || 'Trigger'}: ${triggerName || 'New Trigger'}` },
      position: { x: 250, y: 50 + (nodes.length * 120) },
      style: { backgroundColor: "#eff6ff", borderColor: "#2563eb", padding: 10 }
    };
    setNodes(prev => [...prev, newNode]);
    setShowTriggerDialog(false);
  };

  const addActionToWorkflow = () => {
    const newJob: Job = {
      id: jobId || `job-${workflowJSON.jobs.length + 1}`,
      name: jobName || "New Job",
      runsOn: runsOn || "ubuntu-latest",
      steps: [
        {
          uses: action || "actionsflow/ifttt-webhook-action@v1",
          with: {
            event: event || "notice",
            key: key || "${{ secrets.IFTTT_KEY }}",
            value1: value1 || "${{on.rss.outputs.title}}",
            value2: value2 || "${{on.rss.outputs.contentSnippet}}",
            value3: value3 || "${{on.rss.outputs.link}}"
          }
        }
      ]
    };
    
    setWorkflowJSON(prev => ({
      ...prev,
      jobs: [...prev.jobs, newJob]
    }));
    
    const newNode: Node = {
      id: newJob.id,
      type: "default",
      data: { label: `Job: ${jobName || 'New Job'}` },
      position: { x: 250, y: 200 + (nodes.length * 120) },
      style: { backgroundColor: "#f0fdf4", borderColor: "#16a34a", padding: 10 }
    };
    setNodes(prev => [...prev, newNode]);
    setShowActionDialog(false);
  };

  const handleApply = () => {
    generateYaml();
  };

  const handleExportYaml = () => {
    const yaml = convertJSONToYAML(workflowJSON);
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowJSON.name.toLowerCase().replace(/\\s+/g, '-')}.yml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidateYAML = () => {
    const yaml = yamlContent || convertJSONToYAML(workflowJSON);
    const result = validateYAML(yaml);
    setValidationLogs(result.logs);
    setIsValidationSuccess(result.isValid);
    setShowValidationDialog(true);
  };

  const getLogIcon = (type: ValidationLog["type"]) => {
    switch (type) {
      case "success":
        return <FeatherCheck className="text-body font-body text-success-600" />;
      case "error":
        return <FeatherAlertCircle className="text-body font-body text-error-600" />;
      case "warning":
        return <FeatherAlertCircle className="text-body font-body text-warning-600" />;
      case "info":
        return <FeatherCode className="text-body font-body text-brand-600" />;
    }
  };

  const getLogBadgeVariant = (type: ValidationLog["type"]) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "brand";
    }
  };

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start bg-default-background">
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-4 py-3">
          <div className="flex grow shrink-0 basis-0 items-center gap-4">
            <Breadcrumbs>
              <Breadcrumbs.Item>Workflows</Breadcrumbs.Item>
              <Breadcrumbs.Divider />
              <Breadcrumbs.Item active={true}>
                {workflowJSON.name}
              </Breadcrumbs.Item>
            </Breadcrumbs>
          </div>
          <Badge variant={isActive ? "success" : "neutral"} icon={<FeatherClock />}>
            {isActive ? "Active" : "Paused"}
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              variant="neutral-secondary"
              icon={<FeatherSave />}
              onClick={() => {
                const jsonStr = JSON.stringify(workflowJSON, null, 2);
                console.log("Workflow JSON:", jsonStr);
              }}
            >
              Save
            </Button>
            <Button
              variant="brand-secondary"
              icon={<FeatherPlay />}
              onClick={() => {
                generateYaml();
              }}
            >
              Test Run
            </Button>
            <Button
              variant="brand-primary"
              icon={<FeatherUpload />}
              onClick={() => {}}
            >
              Publish
            </Button>
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton
                  icon={<FeatherMoreHorizontal />}
                  onClick={() => {}}
                />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem icon={<FeatherDownload />} onClick={handleExportYaml}>
                      Export YAML
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherUpload />}>
                      Import YAML
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                      Duplicate
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                      Delete
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 items-start">
          {!isSidebarCollapsed && (
            <div className="flex w-64 flex-none flex-col items-start self-stretch border-r border-solid border-neutral-border bg-default-background">
              <div className="flex w-full flex-col items-start gap-4 border-b border-solid border-neutral-border px-4 py-4">
                <div className="flex w-full items-center justify-between">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Workflows
                  </span>
                  <IconButton
                    size="small"
                    icon={<FeatherPlus />}
                    onClick={() => {
                      setWorkflowJSON({
                        name: "New Workflow",
                        triggers: [],
                        jobs: []
                      });
                      setNodes([]);
                      setEdges([]);
                      setShowEditor(false);
                    }}
                  />
                </div>
                <TextField
                  className="h-auto w-full flex-none"
                  variant="filled"
                  label=""
                  helpText=""
                  icon={<FeatherSearch />}
                >
                  <TextField.Input
                    placeholder="Search workflows..."
                    value=""
                    onChange={() => {}}
                  />
                </TextField>
              </div>
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start overflow-auto">
                <div className="flex w-full items-center gap-3 border-b border-solid border-neutral-border bg-brand-50 px-4 py-3">
                  <FeatherGitBranch className="text-body font-body text-brand-600" />
                  <div className="flex grow shrink-0 basis-0 flex-col items-start">
                    <span className="w-full text-body-bold font-body-bold text-default-font">
                      {workflowJSON.name}
                    </span>
                    <span className="w-full text-caption font-caption text-subtext-color">
                      {workflowJSON.triggers.length} triggers, {workflowJSON.jobs.length} jobs
                    </span>
                  </div>
                  <SubframeCore.DropdownMenu.Root>
                    <SubframeCore.DropdownMenu.Trigger asChild={true}>
                      <IconButton
                        size="small"
                        icon={<FeatherMoreHorizontal />}
                        onClick={() => {}}
                      />
                    </SubframeCore.DropdownMenu.Trigger>
                    <SubframeCore.DropdownMenu.Portal>
                      <SubframeCore.DropdownMenu.Content
                        side="bottom"
                        align="end"
                        sideOffset={4}
                        asChild={true}
                      >
                        <DropdownMenu>
                          <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                            Rename
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                            Duplicate
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                            Delete
                          </DropdownMenu.DropdownItem>
                        </DropdownMenu>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>
                </div>
                <div className="flex w-full items-center gap-3 border-b border-solid border-neutral-border px-4 py-3">
                  <FeatherGitBranch className="text-body font-body text-success-600" />
                  <div className="flex grow shrink-0 basis-0 flex-col items-start">
                    <span className="w-full text-body-bold font-body-bold text-default-font">
                      Email Automation
                    </span>
                    <span className="w-full text-caption font-caption text-subtext-color">
                      2 days ago
                    </span>
                  </div>
                  <Badge variant="success" icon={null}>
                    Active
                  </Badge>
                </div>
                <div className="flex w-full items-center gap-3 border-b border-solid border-neutral-border px-4 py-3">
                  <FeatherGitBranch className="text-body font-body text-success-600" />
                  <div className="flex grow shrink-0 basis-0 flex-col items-start">
                    <span className="w-full text-body-bold font-body-bold text-default-font">
                      Slack Notifications
                    </span>
                    <span className="w-full text-caption font-caption text-subtext-color">
                      1 week ago
                    </span>
                  </div>
                  <Badge variant="success" icon={null}>
                    Active
                  </Badge>
                </div>
                <div className="flex w-full items-center gap-3 border-b border-solid border-neutral-border px-4 py-3">
                  <FeatherGitBranch className="text-body font-body text-subtext-color" />
                  <div className="flex grow shrink-0 basis-0 flex-col items-start">
                    <span className="w-full text-body-bold font-body-bold text-default-font">
                      Data Sync Pipeline
                    </span>
                    <span className="w-full text-caption font-caption text-subtext-color">
                      2 weeks ago
                    </span>
                  </div>
                  <Badge variant="neutral" icon={null}>
                    Paused
                  </Badge>
                </div>
                <div className="flex w-full items-center gap-3 border-b border-solid border-neutral-border px-4 py-3">
                  <FeatherGitBranch className="text-body font-body text-success-600" />
                  <div className="flex grow shrink-0 basis-0 flex-col items-start">
                    <span className="w-full text-body-bold font-body-bold text-default-font">
                      Customer Onboarding
                    </span>
                    <span className="w-full text-caption font-caption text-subtext-color">
                      1 month ago
                    </span>
                  </div>
                  <Badge variant="success" icon={null}>
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          )}
          {!showEditor ? (
            <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-6 self-stretch bg-neutral-50 px-12 py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-lg bg-brand-100">
                  <FeatherGitBranch className="text-heading-1 font-heading-1 text-brand-600" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-heading-2 font-heading-2 text-default-font">
                    Build your workflow
                  </span>
                  <span className="text-body font-body text-subtext-color text-center">
                    1. Add triggers (Gmail, RSS, Webhook)<br />
                    2. Add actions and jobs<br />
                    3. Configure visually<br />
                    4. Download YAML for GitHub
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="brand-primary"
                    icon={<FeatherPlus />}
                    onClick={() => {
                      if (onNavigateToTriggers) {
                        onNavigateToTriggers();
                      } else {
                        setShowTriggerDialog(true);
                        setShowEditor(true);
                      }
                    }}
                  >
                    Add Trigger
                  </Button>
                  <Button
                    variant="neutral-secondary"
                    icon={<FeatherUpload />}
                    onClick={() => {}}
                  >
                    Import YAML
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-2">
                  <FeatherMail className="text-body font-body text-brand-600" />
                  <span className="text-caption font-caption text-default-font">
                    Gmail Trigger
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-2">
                  <FeatherRss className="text-body font-body text-warning-600" />
                  <span className="text-caption font-caption text-default-font">
                    RSS Trigger
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-2">
                  <FeatherGlobe className="text-body font-body text-success-600" />
                  <span className="text-caption font-caption text-default-font">
                    Webhook
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-2">
                  <FeatherSlack className="text-body font-body text-error-600" />
                  <span className="text-caption font-caption text-default-font">
                    Slack Action
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex grow shrink-0 basis-0 flex-col self-stretch bg-neutral-50">
              <div className="flex h-12 w-full items-center justify-center gap-2 border-b border-solid border-neutral-border bg-default-background px-4">
                <span className="text-body-bold font-body-bold text-default-font">Visual Pipeline Builder</span>
                <div className="flex grow shrink-0 basis-0"></div>
                <Button
                  size="small"
                  variant="neutral-secondary"
                  icon={<FeatherPlus />}
                  onClick={() => {
                    if (onNavigateToTriggers) {
                      onNavigateToTriggers();
                    } else {
                      setShowTriggerDialog(true);
                    }
                  }}
                >
                  Add Trigger
                </Button>
                <Button
                  size="small"
                  variant="brand-secondary"
                  icon={<FeatherPlus />}
                  onClick={() => setShowActionDialog(true)}
                >
                  Add Action
                </Button>
              </div>
              <div className="flex grow shrink-0 basis-0 self-stretch" style={{ height: '100%' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                >
                  <Controls />
                  <Background />
                </ReactFlow>
              </div>
            </div>
          )}
          <div className="flex w-80 flex-none flex-col items-start self-stretch border-l border-solid border-neutral-border bg-default-background">
            <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-4 py-3">
              <FeatherSettings className="text-body font-body text-subtext-color" />
              <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                Configuration
              </span>
              <IconButton
                size="small"
                icon={rightPanelView === "config" ? <FeatherLayers /> : <FeatherSettings />}
                onClick={() => setRightPanelView(prev => prev === "config" ? "outputs" : "config")}
              />
            </div>
            <div className="flex w-full grow shrink-0 basis-0 flex-col items-start overflow-auto">
              {rightPanelView === "config" ? (
                <>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Workflow JSON
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={true}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <div className="flex w-full flex-col gap-2 rounded-md border border-solid border-success-200 bg-success-50 p-3">
                          <span className="text-caption-bold font-caption-bold text-success-900">
                            Internal JSON Structure
                          </span>
                          <span className="text-caption font-caption text-success-700">
                            This is the internal representation that gets converted to YAML
                          </span>
                        </div>
                        <TextArea
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label=""
                          helpText="Live JSON representation"
                        >
                          <TextArea.Input
                            value={JSON.stringify(workflowJSON, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                setWorkflowJSON(parsed);
                              } catch (err) {
                              }
                            }}
                            rows={12}
                            style={{ fontFamily: 'monospace', fontSize: '11px' }}
                          />
                        </TextArea>
                        <Button
                          className="h-6 w-full flex-none"
                          variant="neutral-secondary"
                          size="small"
                          icon={<FeatherCopy />}
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(workflowJSON, null, 2))}
                        >
                          Copy JSON
                        </Button>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Active Configuration
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={true}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">Active</span>
                          <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Custom Trigger Builder
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={false}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <div className="flex w-full flex-col gap-2 rounded-md border border-solid border-brand-200 bg-brand-50 p-3">
                          <span className="text-caption-bold font-caption-bold text-brand-900">
                            Create Custom Trigger
                          </span>
                          <span className="text-caption font-caption text-brand-700">
                            Build npm package or local trigger with constructor and run method
                          </span>
                        </div>
                        
                        <Select
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Trigger Type"
                          placeholder="Select type"
                          helpText=""
                          icon={null}
                          value={triggerPackageType}
                          onValueChange={(value: string) => setTriggerPackageType(value)}
                        >
                          <Select.Item value="local">Local Trigger</Select.Item>
                          <Select.Item value="npm">NPM Package</Select.Item>
                        </Select>
                        
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Trigger Name"
                          helpText={validateTriggerName(customTriggerName) || !customTriggerName ? "Use snake_case (e.g., my_trigger)" : "⚠️ Use snake_case format"}
                        >
                          <TextField.Input
                            placeholder="example_trigger"
                            value={customTriggerName}
                            onChange={(e) => setCustomTriggerName(e.target.value)}
                          />
                        </TextField>
                        
                        <TextArea
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Trigger Options (camelCase)"
                          helpText="Options configuration in YAML format"
                        >
                          <TextArea.Input
                            placeholder="deduplicationKey: id&#10;eventType: user_timeline"
                            value={triggerOptions}
                            onChange={(e) => setTriggerOptions(e.target.value)}
                            rows={3}
                          />
                        </TextArea>
                        
                        <TextArea
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Trigger Class Code"
                          helpText="Constructor receives helpers and options"
                        >
                          <TextArea.Input
                            placeholder={triggerTemplate}
                            value={customTriggerCode}
                            onChange={(e) => setCustomTriggerCode(e.target.value)}
                            rows={12}
                            style={{ fontFamily: 'monospace', fontSize: '12px' }}
                          />
                        </TextArea>
                        
                        <div className="flex w-full flex-col gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-caption-bold font-caption-bold text-default-font">Usage Example</span>
                            <IconButton
                              size="small"
                              icon={<FeatherCopy />}
                              onClick={() => navigator.clipboard.writeText(generateTriggerUsageExample())}
                            />
                          </div>
                          <pre className="text-caption font-caption text-subtext-color whitespace-pre-wrap break-all" style={{ fontFamily: 'monospace' }}>
                            {generateTriggerUsageExample()}
                          </pre>
                        </div>
                        
                        <div className="flex w-full flex-col gap-2 rounded-md border border-solid border-warning-200 bg-warning-50 p-3">
                          <span className="text-caption-bold font-caption-bold text-warning-900">
                            Naming Convention
                          </span>
                          <span className="text-caption font-caption text-warning-700">
                            • Trigger names: snake_case (e.g., twitter_mentions)
                          </span>
                          <span className="text-caption font-caption text-warning-700">
                            • Options: camelCase (e.g., deduplicationKey)
                          </span>
                          <span className="text-caption font-caption text-warning-700">
                            • Avoid "config" as option name (reserved)
                          </span>
                        </div>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Trigger (on)
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={true}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Trigger Name"
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="e.g., rss, webhook"
                            value={triggerName}
                            onChange={(e) => setTriggerName(e.target.value)}
                          />
                        </TextField>
                        <Select
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Trigger Type"
                          placeholder="Select trigger"
                          helpText=""
                          icon={null}
                          value={triggerType}
                          onValueChange={(value: string) => setTriggerType(value)}
                        >
                          <Select.Item value="rss">rss</Select.Item>
                          <Select.Item value="email">email</Select.Item>
                          <Select.Item value="webhook">webhook</Select.Item>
                          <Select.Item value="schedule">schedule</Select.Item>
                          <Select.Item value="poll">poll</Select.Item>
                          <Select.Item value="custom">custom</Select.Item>
                        </Select>
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="URL"
                          helpText="RSS feed or webhook URL"
                          icon={<FeatherLink />}
                        >
                          <TextField.Input
                            placeholder="https://hnrss.org/newest?points=300"
                            value={triggerUrl}
                            onChange={(e) => setTriggerUrl(e.target.value)}
                          />
                        </TextField>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">Active</span>
                          <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Webhook Configuration
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={false}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">Self-hosted (localhost)</span>
                          <Switch checked={isLocalhost} onCheckedChange={setIsLocalhost} />
                        </div>
                        {!isLocalhost && (
                          <>
                            <TextField
                              className="h-auto w-full flex-none"
                              variant="filled"
                              label="Owner"
                              helpText=""
                            >
                              <TextField.Input
                                placeholder="actionsflow"
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                              />
                            </TextField>
                            <TextField
                              className="h-auto w-full flex-none"
                              variant="filled"
                              label="Repository"
                              helpText=""
                            >
                              <TextField.Input
                                placeholder="webhook2github"
                                value={repo}
                                onChange={(e) => setRepo(e.target.value)}
                              />
                            </TextField>
                          </>
                        )}
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Workflow File"
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="webhook.yml"
                            value={workflowFile}
                            onChange={(e) => setWorkflowFile(e.target.value)}
                          />
                        </TextField>
                        {!isLocalhost && (
                          <TextField
                            className="h-auto w-full flex-none"
                            variant="filled"
                            label="GitHub Token"
                            helpText="Personal access token with repo scope"
                            icon={<FeatherKey />}
                          >
                            <TextField.Input
                              placeholder="ghp_xxxxxxxxxxxx"
                              value={githubToken}
                              onChange={(e) => setGithubToken(e.target.value)}
                              type="password"
                            />
                          </TextField>
                        )}
                        <div className="flex w-full flex-col gap-2">
                          <span className="text-caption-bold font-caption-bold text-default-font">Custom Response</span>
                          <TextField
                            className="h-auto w-full flex-none"
                            variant="filled"
                            label="Response Code"
                            helpText=""
                          >
                            <TextField.Input
                              placeholder="200"
                              value={responseCode}
                              onChange={(e) => setResponseCode(e.target.value)}
                            />
                          </TextField>
                          <TextField
                            className="h-auto w-full flex-none"
                            variant="filled"
                            label="Content Type"
                            helpText=""
                          >
                            <TextField.Input
                              placeholder="application/json"
                              value={responseContentType}
                              onChange={(e) => setResponseContentType(e.target.value)}
                            />
                          </TextField>
                          <TextField
                            className="h-auto w-full flex-none"
                            variant="filled"
                            label="Response Body"
                            helpText=""
                          >
                            <TextField.Input
                              placeholder='{"success":true}'
                              value={responseBody}
                              onChange={(e) => setResponseBody(e.target.value)}
                            />
                          </TextField>
                        </div>
                        <div className="flex w-full flex-col gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-caption-bold font-caption-bold text-default-font">Webhook URL</span>
                            <IconButton
                              size="small"
                              icon={<FeatherCopy />}
                              onClick={copyWebhookUrl}
                            />
                          </div>
                          <code className="text-caption font-caption text-subtext-color break-all">
                            {generateWebhookUrl()}
                          </code>
                        </div>
                        <div className="flex w-full flex-col gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-caption-bold font-caption-bold text-default-font">cURL Example</span>
                            <IconButton
                              size="small"
                              icon={<FeatherCopy />}
                              onClick={copyCurlExample}
                            />
                          </div>
                          <pre className="text-caption font-caption text-subtext-color whitespace-pre-wrap break-all">
                            {generateCurlExample()}
                          </pre>
                        </div>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Advanced Config
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={false}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Include Pattern"
                          helpText="e.g., rss.yml or rss*"
                        >
                          <TextField.Input
                            placeholder="rss*.yml"
                            value={includePattern}
                            onChange={(e) => setIncludePattern(e.target.value)}
                          />
                        </TextField>
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Exclude Pattern"
                          helpText="Files to exclude"
                        >
                          <TextField.Input
                            placeholder="test*.yml"
                            value={excludePattern}
                            onChange={(e) => setExcludePattern(e.target.value)}
                          />
                        </TextField>
                        <div className="flex w-full flex-col gap-2">
                          <span className="text-caption-bold font-caption-bold text-default-font">Filter Outputs</span>
                          <div className="flex w-full items-center justify-between">
                            <span className="text-body font-body text-default-font">title</span>
                            <Switch checked={filterTitle} onCheckedChange={setFilterTitle} />
                          </div>
                          <div className="flex w-full items-center justify-between">
                            <span className="text-body font-body text-default-font">link</span>
                            <Switch checked={filterLink} onCheckedChange={setFilterLink} />
                          </div>
                          <div className="flex w-full items-center justify-between">
                            <span className="text-body font-body text-default-font">contentSnippet</span>
                            <Switch checked={filterContent} onCheckedChange={setFilterContent} />
                          </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">Export Outputs</span>
                          <Switch checked={exportOutputs} onCheckedChange={setExportOutputs} />
                        </div>
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Custom Format"
                          helpText="Custom output format"
                        >
                          <TextField.Input
                            placeholder="title: item.title, link: item.link"
                            value={customFormat}
                            onChange={(e) => setCustomFormat(e.target.value)}
                          />
                        </TextField>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Job Configuration
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={true}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Job ID"
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="e.g., ifttt, slack_notify"
                            value={jobId}
                            onChange={(e) => setJobId(e.target.value)}
                          />
                        </TextField>
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Job Name"
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="Make a Request to IFTTT"
                            value={jobName}
                            onChange={(e) => setJobName(e.target.value)}
                          />
                        </TextField>
                        <Select
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Runs On"
                          placeholder="Select environment"
                          helpText=""
                          icon={null}
                          value={runsOn}
                          onValueChange={(value: string) => setRunsOn(value)}
                        >
                          <Select.Item value="ubuntu-latest">
                            ubuntu-latest
                          </Select.Item>
                          <Select.Item value="ubuntu-20.04">
                            ubuntu-20.04
                          </Select.Item>
                          <Select.Item value="macos-latest">
                            macos-latest
                          </Select.Item>
                        </Select>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Steps &amp; Actions
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={true}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Action (uses)"
                          helpText="GitHub action to use"
                        >
                          <TextField.Input
                            placeholder="actionsflow/ifttt-webhook-action@v1"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                          />
                        </TextField>
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Event"
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="notice"
                            value={event}
                            onChange={(e) => setEvent(e.target.value)}
                          />
                        </TextField>
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="Key"
                          helpText="Use secrets for sensitive data"
                        >
                          <TextField.Input
                            placeholder="${{ secrets.IFTTT_KEY }}"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                          />
                        </TextField>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            Output Mapping (with)
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={false}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="value1"
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="${{on.rss.outputs.title}}"
                            value={value1}
                            onChange={(e) => setValue1(e.target.value)}
                          />
                        </TextField>
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="value2"
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="${{on.rss.outputs.contentSnippet}}"
                            value={value2}
                            onChange={(e) => setValue2(e.target.value)}
                          />
                        </TextField>
                        <TextField
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label="value3"
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="${{on.rss.outputs.link}}"
                            value={value3}
                            onChange={(e) => setValue3(e.target.value)}
                          />
                        </TextField>
                        <Button
                          className="h-6 w-full flex-none"
                          variant="neutral-secondary"
                          size="small"
                          icon={<FeatherPlus />}
                          onClick={() => {}}
                        >
                          Add Value
                        </Button>
                      </div>
                    </Accordion>
                  </div>
                  <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border">
                    <Accordion
                      trigger={
                        <div className="flex w-full items-center gap-2 px-4 py-3">
                          <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                            YAML Preview
                          </span>
                          <Accordion.Chevron />
                        </div>
                      }
                      defaultOpen={false}
                    >
                      <div className="flex w-full flex-col items-start gap-4 px-4 pb-4">
                        <TextArea
                          className="h-auto w-full flex-none"
                          variant="filled"
                          label=""
                          helpText="Edit raw YAML configuration"
                        >
                          <TextArea.Input
                            placeholder={
                              "on:\\n  rss:\\n    url: https://hnrss.org/newest\\njobs:\\n  ifttt:\\n    name: IFTTT Request\\n    runs-on: ubuntu-latest\\n    steps:\\n      - uses: actionsflow/ifttt-webhook-action@v1\\n        with:\\n          event: notice\\n          key: ${{ secrets.IFTTT_KEY }}"
                            }
                            value={yamlContent}
                            onChange={(e) => setYamlContent(e.target.value)}
                          />
                        </TextArea>
                        <div className="flex w-full items-center gap-2">
                          <Button
                            className="h-6 grow shrink-0 basis-0"
                            variant="neutral-secondary"
                            size="small"
                            icon={<FeatherCheck />}
                            onClick={handleValidateYAML}
                          >
                            Validate
                          </Button>
                          <Button
                            className="h-6 grow shrink-0 basis-0"
                            variant="neutral-secondary"
                            size="small"
                            icon={<FeatherCopy />}
                            onClick={() => navigator.clipboard.writeText(yamlContent)}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </Accordion>
                  </div>
                </>
              ) : (
                <div className="flex w-full flex-col gap-4 px-4 py-4">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Workflow Outputs
                  </span>
                  <div className="flex flex-col gap-2">
                    {workflowJSON.triggers.map((trigger, idx) => (
                      <div key={idx} className="flex flex-col gap-2 rounded-lg border border-solid border-brand-200 bg-brand-50 p-3">
                        <span className="text-caption-bold font-caption-bold text-brand-900">
                          Trigger: {trigger.type}
                        </span>
                        <code className="text-caption font-caption text-brand-700 font-mono">
                          on.{trigger.type}.outputs.*
                        </code>
                      </div>
                    ))}
                    {workflowJSON.jobs.map((job, idx) => (
                      <div key={idx} className="flex flex-col gap-2 rounded-lg border border-solid border-success-200 bg-success-50 p-3">
                        <span className="text-caption-bold font-caption-bold text-success-900">
                          Job: {job.id}
                        </span>
                        <code className="text-caption font-caption text-success-700 font-mono">
                          jobs.{job.id}.steps
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex w-full items-center gap-2 border-t border-solid border-neutral-border px-4 py-4">
              <Button
                className="h-8 grow shrink-0 basis-0"
                variant="neutral-secondary"
                icon={<FeatherX />}
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-8 grow shrink-0 basis-0"
                variant="brand-primary"
                icon={<FeatherCheck />}
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <SubframeCore.Dialog.Root open={showTriggerDialog} onOpenChange={setShowTriggerDialog}>
        <SubframeCore.Dialog.Portal>
          <SubframeCore.Dialog.Overlay className="fixed inset-0 bg-black/60" />
          <SubframeCore.Dialog.Content asChild>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 flex flex-col items-start gap-6 rounded-lg border border-solid border-neutral-border bg-default-background shadow-xl px-6 py-6">
              <div className="flex w-full items-center gap-3">
                <FeatherRss className="text-heading-2 font-heading-2 text-brand-600" />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Add Trigger
                  </span>
                  <span className="text-body font-body text-subtext-color">
                    Configure a new trigger for your workflow
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-4">
                <TextField variant="filled" label="Trigger Name">
                  <TextField.Input
                    placeholder="e.g., rss"
                    value={triggerName}
                    onChange={(e) => setTriggerName(e.target.value)}
                  />
                </TextField>
                <Select
                  variant="filled"
                  label="Trigger Type"
                  value={triggerType}
                  onValueChange={setTriggerType}
                >
                  <Select.Item value="gmail">Gmail</Select.Item>
                  <Select.Item value="rss">RSS</Select.Item>
                  <Select.Item value="webhook">Webhook</Select.Item>
                  <Select.Item value="email">Email</Select.Item>
                  <Select.Item value="schedule">Schedule</Select.Item>
                  <Select.Item value="poll">Poll</Select.Item>
                </Select>
                <TextField
                  variant="filled"
                  label="URL / Configuration"
                  icon={<FeatherLink />}
                >
                  <TextField.Input
                    placeholder="https://hnrss.org/newest?points=300"
                    value={triggerUrl}
                    onChange={(e) => setTriggerUrl(e.target.value)}
                  />
                </TextField>
                <div className="flex w-full items-center justify-between">
                  <span className="text-body font-body">Active</span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
              <div className="flex w-full items-center gap-2">
                <Button
                  className="grow shrink-0 basis-0"
                  variant="neutral-secondary"
                  onClick={() => setShowTriggerDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="grow shrink-0 basis-0"
                  variant="brand-primary"
                  onClick={addTriggerToWorkflow}
                >
                  Add Trigger
                </Button>
              </div>
            </div>
          </SubframeCore.Dialog.Content>
        </SubframeCore.Dialog.Portal>
      </SubframeCore.Dialog.Root>

      <SubframeCore.Dialog.Root open={showActionDialog} onOpenChange={setShowActionDialog}>
        <SubframeCore.Dialog.Portal>
          <SubframeCore.Dialog.Overlay className="fixed inset-0 bg-black/60" />
          <SubframeCore.Dialog.Content asChild>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 flex flex-col items-start gap-6 rounded-lg border border-solid border-neutral-border bg-default-background shadow-xl px-6 py-6">
              <div className="flex w-full items-center gap-3">
                <FeatherLayers className="text-heading-2 font-heading-2 text-success-600" />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Add Action
                  </span>
                  <span className="text-body font-body text-subtext-color">
                    Configure a new action for your workflow
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-4">
                <TextField variant="filled" label="Job ID">
                  <TextField.Input
                    placeholder="e.g., ifttt, slack_notify"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                  />
                </TextField>
                <TextField variant="filled" label="Job Name">
                  <TextField.Input
                    placeholder="Make a Request to IFTTT"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                  />
                </TextField>
                <Select
                  variant="filled"
                  label="Runs On"
                  value={runsOn}
                  onValueChange={setRunsOn}
                >
                  <Select.Item value="ubuntu-latest">ubuntu-latest</Select.Item>
                  <Select.Item value="ubuntu-20.04">ubuntu-20.04</Select.Item>
                  <Select.Item value="macos-latest">macos-latest</Select.Item>
                </Select>
                <TextField variant="filled" label="Action">
                  <TextField.Input
                    placeholder="actionsflow/ifttt-webhook-action@v1"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                  />
                </TextField>
                <TextField variant="filled" label="Event">
                  <TextField.Input
                    placeholder="notice"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                  />
                </TextField>
                <TextField variant="filled" label="Key">
                  <TextField.Input
                    placeholder="${{ secrets.IFTTT_KEY }}"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                  />
                </TextField>
              </div>
              <div className="flex w-full items-center gap-2">
                <Button
                  className="grow shrink-0 basis-0"
                  variant="neutral-secondary"
                  onClick={() => setShowActionDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="grow shrink-0 basis-0"
                  variant="brand-primary"
                  onClick={addActionToWorkflow}
                >
                  Add Action
                </Button>
              </div>
            </div>
          </SubframeCore.Dialog.Content>
        </SubframeCore.Dialog.Portal>
      </SubframeCore.Dialog.Root>

      <SubframeCore.Dialog.Root open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <SubframeCore.Dialog.Portal>
          <SubframeCore.Dialog.Overlay className="fixed inset-0 bg-black/60" />
          <SubframeCore.Dialog.Content asChild>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-h-[80vh] flex flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background shadow-xl">
              <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
                <div className="flex items-center gap-3">
                  {isValidationSuccess ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                      <FeatherCheck className="text-heading-3 font-heading-3 text-success-600" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100">
                      <FeatherAlertCircle className="text-heading-3 font-heading-3 text-error-600" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Validación de YAML
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      {isValidationSuccess ? "Validación exitosa" : "Se encontraron errores"}
                    </span>
                  </div>
                </div>
                <IconButton
                  icon={<FeatherX />}
                  onClick={() => setShowValidationDialog(false)}
                />
              </div>

              <div className="flex w-full flex-col gap-3 overflow-auto px-6 py-4">
                {validationLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex flex-col gap-2 rounded-lg border border-solid p-4 ${
                      log.type === "success"
                        ? "border-success-200 bg-success-50"
                        : log.type === "error"
                        ? "border-error-200 bg-error-50"
                        : log.type === "warning"
                        ? "border-warning-200 bg-warning-50"
                        : "border-brand-200 bg-brand-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getLogIcon(log.type)}
                      <div className="flex grow flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getLogBadgeVariant(log.type)} icon={null}>
                            {log.type.toUpperCase()}
                          </Badge>
                          {log.line && (
                            <span className="text-caption font-caption text-subtext-color">
                              Línea {log.line}
                            </span>
                          )}
                        </div>
                        <span className={`text-body-bold font-body-bold ${
                          log.type === "success"
                            ? "text-success-900"
                            : log.type === "error"
                            ? "text-error-900"
                            : log.type === "warning"
                            ? "text-warning-900"
                            : "text-brand-900"
                        }`}>
                          {log.message}
                        </span>
                        {log.details && (
                          <span className={`text-body font-body ${
                            log.type === "success"
                              ? "text-success-700"
                              : log.type === "error"
                              ? "text-error-700"
                              : log.type === "warning"
                              ? "text-warning-700"
                              : "text-brand-700"
                          }`}>
                            {log.details}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex w-full items-center gap-3 border-t border-solid border-neutral-border px-6 py-4">
                <Button
                  className="grow shrink-0 basis-0"
                  variant="neutral-secondary"
                  onClick={() => setShowValidationDialog(false)}
                >
                  Cerrar
                </Button>
                {isValidationSuccess && (
                  <Button
                    className="grow shrink-0 basis-0"
                    variant="brand-primary"
                    icon={<FeatherCopy />}
                    onClick={() => {
                      const yaml = yamlContent || convertJSONToYAML(workflowJSON);
                      navigator.clipboard.writeText(yaml);
                    }}
                  >
                    Copiar YAML
                  </Button>
                )}
              </div>
            </div>
          </SubframeCore.Dialog.Content>
        </SubframeCore.Dialog.Portal>
      </SubframeCore.Dialog.Root>
    </DefaultPageLayout>
  );
}

export default VisualWorkflowBuilder3;