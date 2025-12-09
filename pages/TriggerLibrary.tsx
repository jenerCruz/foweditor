import React, { useState } from "react";
import { FeatherArrowLeft, FeatherCode, FeatherMail, FeatherRss, FeatherGlobe, FeatherClock, FeatherDatabase, FeatherGithub, FeatherSlack, FeatherTwitter, FeatherPlus, FeatherSearch, FeatherStar, FeatherCheck } from "@subframe/core";
import { Badge } from "../ui/components/Badge";
import { Breadcrumbs } from "../ui/components/Breadcrumbs";
import { Button } from "../ui/components/Button";
import { TextField } from "../ui/components/TextField";
import { TextArea } from "../ui/components/TextArea";
import { Select } from "../ui/components/Select";
import { DefaultPageLayout } from "../ui/layouts/DefaultPageLayout";

interface PrebuiltTrigger {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  description: string;
  category: string;
  popular: boolean;
  color: string;
  exampleConfig: string;
}

const prebuiltTriggers: PrebuiltTrigger[] = [
  {
    id: "rss",
    name: "RSS",
    type: "rss",
    icon: <FeatherRss />,
    description: "Monitor RSS and Atom feeds for new items",
    category: "Data Sources",
    popular: true,
    color: "warning",
    exampleConfig: `on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      filterOutputs:
        title: 1
        link: 1
        contentSnippet: 1`
  },
  {
    id: "webhook",
    name: "Webhook",
    type: "webhook",
    icon: <FeatherGlobe />,
    description: "Receive HTTP webhooks from external services",
    category: "Communication",
    popular: true,
    color: "success",
    exampleConfig: `on:
  webhook:
    config:
      path: /webhook/:workflow/:trigger`
  },
  {
    id: "gmail",
    name: "Gmail",
    type: "gmail",
    icon: <FeatherMail />,
    description: "Trigger on new Gmail messages",
    category: "Email",
    popular: true,
    color: "brand",
    exampleConfig: `on:
  gmail:
    credentials: \${{ secrets.GMAIL_CREDENTIALS }}
    query: "from:example@gmail.com is:unread"`
  },
  {
    id: "schedule",
    name: "Schedule",
    type: "schedule",
    icon: <FeatherClock />,
    description: "Run workflows on a schedule using cron",
    category: "Time",
    popular: false,
    color: "neutral",
    exampleConfig: `on:
  schedule:
    - cron: "0 */6 * * *"
    - cron: "0 0 * * *"`
  },
  {
    id: "poll",
    name: "Poll",
    type: "poll",
    icon: <FeatherDatabase />,
    description: "Poll an API endpoint periodically",
    category: "Data Sources",
    popular: false,
    color: "error",
    exampleConfig: `on:
  poll:
    url: https://api.example.com/data
    every: 5m`
  },
  {
    id: "github",
    name: "GitHub",
    type: "github",
    icon: <FeatherGithub />,
    description: "Trigger on GitHub events",
    category: "Development",
    popular: true,
    color: "neutral",
    exampleConfig: `on:
  github:
    event: issues
    token: \${{ secrets.GITHUB_TOKEN }}
    owner: actionsflow
    repo: actionsflow`
  },
  {
    id: "slack",
    name: "Slack",
    type: "slack",
    icon: <FeatherSlack />,
    description: "Monitor Slack channels for messages",
    category: "Communication",
    popular: false,
    color: "error",
    exampleConfig: `on:
  slack:
    token: \${{ secrets.SLACK_TOKEN }}
    channel: general`
  },
  {
    id: "twitter",
    name: "Twitter",
    type: "twitter",
    icon: <FeatherTwitter />,
    description: "Monitor Twitter for tweets and mentions",
    category: "Social Media",
    popular: false,
    color: "brand",
    exampleConfig: `on:
  twitter:
    credentials: \${{ secrets.TWITTER_CREDENTIALS }}
    search: "actionsflow"`
  }
];

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

interface TriggerLibraryProps {
  onSelectTrigger?: (trigger: PrebuiltTrigger) => void;
  onBack?: () => void;
}

function TriggerLibrary({ onSelectTrigger, onBack }: TriggerLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customTriggerName, setCustomTriggerName] = useState("");
  const [customTriggerCode, setCustomTriggerCode] = useState(triggerTemplate);
  const [triggerPackageType, setTriggerPackageType] = useState("local");
  const [triggerOptions, setTriggerOptions] = useState("");

  const categories = [
    { value: "all", label: "All Triggers" },
    { value: "Data Sources", label: "Data Sources" },
    { value: "Communication", label: "Communication" },
    { value: "Email", label: "Email" },
    { value: "Time", label: "Time" },
    { value: "Development", label: "Development" },
    { value: "Social Media", label: "Social Media" }
  ];

  const validateTriggerName = (name: string) => {
    const isSnakeCase = /^[a-z][a-z0-9_]*$/.test(name);
    return isSnakeCase;
  };

  const generateTriggerUsageExample = () => {
    const name = customTriggerName || "example_trigger";
    const triggerAccessor = customTriggerName.includes('_') 
      ? `on.${name}.outputs.param` 
      : `on['${name}'].outputs.param`;
    
    return `on:\n  ${name}:\n    ${triggerOptions || 'option: value'}\n\njobs:\n  my_job:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Use trigger output\n        run: echo "${triggerAccessor}"`;
  };

  const filteredTriggers = prebuiltTriggers.filter(trigger => {
    const matchesSearch = trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trigger.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || trigger.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTriggers = filteredTriggers.filter(t => t.popular);
  const otherTriggers = filteredTriggers.filter(t => !t.popular);

  if (showCustomBuilder) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full flex-col items-start bg-default-background">
          <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-6 py-4">
            <Button
              variant="neutral-tertiary"
              icon={<FeatherArrowLeft />}
              onClick={() => setShowCustomBuilder(false)}
            >
              Back
            </Button>
            <div className="flex grow shrink-0 basis-0 items-center">
              <Breadcrumbs>
                <Breadcrumbs.Item>Triggers</Breadcrumbs.Item>
                <Breadcrumbs.Divider />
                <Breadcrumbs.Item active={true}>Create Custom Trigger</Breadcrumbs.Item>
              </Breadcrumbs>
            </div>
          </div>

          <div className="flex w-full grow shrink-0 basis-0 items-start overflow-auto">
            <div className="flex w-full max-w-4xl flex-col items-start gap-6 px-8 py-8 mx-auto">
              <div className="flex w-full flex-col gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Create Custom Trigger
                </span>
                <span className="text-body font-body text-subtext-color">
                  Build a custom trigger as an npm package or local trigger with constructor and run method
                </span>
              </div>

              <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-brand-200 bg-brand-50 p-4">
                <span className="text-body-bold font-body-bold text-brand-900">
                  📚 Core Concepts
                </span>
                <ul className="text-body font-body text-brand-700 space-y-1 pl-5 list-disc">
                  <li>Actionsflow triggers can be created either as an npm package or as a local trigger</li>
                  <li>Trigger files export a class with a run method for getting the initial results</li>
                  <li>Use snake_case for trigger names (e.g., twitter_mentions)</li>
                  <li>Use camelCase for option field names (e.g., deduplicationKey)</li>
                  <li>Avoid "config" as your option name (reserved)</li>
                </ul>
              </div>

              <div className="flex w-full flex-col gap-4">
                <Select
                  className="h-auto w-full flex-none"
                  variant="filled"
                  label="Trigger Type"
                  placeholder="Select type"
                  helpText="Choose between local trigger or npm package"
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
                  helpText={
                    validateTriggerName(customTriggerName) || !customTriggerName
                      ? "Use snake_case format (e.g., my_custom_trigger)"
                      : "⚠️ Must use snake_case format"
                  }
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
                    rows={4}
                  />
                </TextArea>

                <TextArea
                  className="h-auto w-full flex-none"
                  variant="filled"
                  label="Trigger Class Code"
                  helpText="Constructor receives helpers and options. The run method should return an array of items."
                >
                  <TextArea.Input
                    value={customTriggerCode}
                    onChange={(e) => setCustomTriggerCode(e.target.value)}
                    rows={16}
                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                  />
                </TextArea>

                <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-neutral-50 p-4">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Usage Example
                  </span>
                  <pre className="text-body font-body text-subtext-color whitespace-pre-wrap break-all" style={{ fontFamily: 'monospace' }}>
                    {generateTriggerUsageExample()}
                  </pre>
                </div>

                <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-warning-200 bg-warning-50 p-4">
                  <span className="text-body-bold font-body-bold text-warning-900">
                    ⚠️ Naming Conventions
                  </span>
                  <ul className="text-body font-body text-warning-700 space-y-1 pl-5 list-disc">
                    <li><strong>Trigger names:</strong> snake_case (e.g., twitter_mentions)</li>
                    <li><strong>Options:</strong> camelCase (e.g., deduplicationKey)</li>
                    <li><strong>Reserved:</strong> Avoid "config" as option name (reserved by Actionsflow)</li>
                  </ul>
                </div>
              </div>

              <div className="flex w-full items-center gap-3">
                <Button
                  className="grow shrink-0 basis-0"
                  variant="neutral-secondary"
                  onClick={() => setShowCustomBuilder(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="grow shrink-0 basis-0"
                  variant="brand-primary"
                  icon={<FeatherCheck />}
                  onClick={() => {
                    console.log("Custom trigger created:", {
                      name: customTriggerName,
                      type: triggerPackageType,
                      code: customTriggerCode,
                      options: triggerOptions
                    });
                  }}
                  disabled={!validateTriggerName(customTriggerName)}
                >
                  Create Trigger
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DefaultPageLayout>
    );
  }

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start bg-default-background">
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-6 py-4">
          {onBack && (
            <Button
              variant="neutral-tertiary"
              icon={<FeatherArrowLeft />}
              onClick={onBack}
            >
              Back
            </Button>
          )}
          <div className="flex grow shrink-0 basis-0 items-center">
            <Breadcrumbs>
              <Breadcrumbs.Item>Workflows</Breadcrumbs.Item>
              <Breadcrumbs.Divider />
              <Breadcrumbs.Item active={true}>Trigger Library</Breadcrumbs.Item>
            </Breadcrumbs>
          </div>
        </div>

        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start overflow-auto">
          <div className="flex w-full flex-col items-start gap-6 px-8 py-8">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Trigger Library
                </span>
                <span className="text-body font-body text-subtext-color">
                  Select a prebuilt trigger or create your own custom trigger
                </span>
              </div>
              <Button
                variant="brand-primary"
                icon={<FeatherPlus />}
                onClick={() => setShowCustomBuilder(true)}
              >
                Create Custom Trigger
              </Button>
            </div>

            <div className="flex w-full items-center gap-4">
              <TextField
                className="h-auto grow shrink-0 basis-0"
                variant="filled"
                label=""
                helpText=""
                icon={<FeatherSearch />}
              >
                <TextField.Input
                  placeholder="Search triggers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </TextField>
              <Select
                className="h-auto w-64 flex-none"
                variant="filled"
                label=""
                placeholder="All Categories"
                helpText=""
                icon={null}
                value={selectedCategory}
                onValueChange={(value: string) => setSelectedCategory(value)}
              >
                {categories.map(cat => (
                  <Select.Item key={cat.value} value={cat.value}>
                    {cat.label}
                  </Select.Item>
                ))}
              </Select>
            </div>

            {popularTriggers.length > 0 && (
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-center gap-2">
                  <FeatherStar className="text-body font-body text-warning-600" />
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Popular Triggers
                  </span>
                </div>
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {popularTriggers.map(trigger => (
                    <div
                      key={trigger.id}
                      className="flex flex-col gap-4 rounded-lg border border-solid border-neutral-border bg-default-background p-5 hover:border-brand-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => onSelectTrigger && onSelectTrigger(trigger)}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${trigger.color}-100`}>
                          <span className={`text-heading-2 font-heading-2 text-${trigger.color}-600`}>
                            {trigger.icon}
                          </span>
                        </div>
                        <Badge variant={trigger.color as any} icon={<FeatherStar />}>
                          Popular
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-heading-3 font-heading-3 text-default-font">
                          {trigger.name}
                        </span>
                        <span className="text-body font-body text-subtext-color">
                          {trigger.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" icon={null}>
                          {trigger.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherTriggers.length > 0 && (
              <div className="flex w-full flex-col gap-4">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  All Triggers
                </span>
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {otherTriggers.map(trigger => (
                    <div
                      key={trigger.id}
                      className="flex flex-col gap-4 rounded-lg border border-solid border-neutral-border bg-default-background p-5 hover:border-brand-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => onSelectTrigger && onSelectTrigger(trigger)}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${trigger.color}-100`}>
                        <span className={`text-heading-2 font-heading-2 text-${trigger.color}-600`}>
                          {trigger.icon}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-heading-3 font-heading-3 text-default-font">
                          {trigger.name}
                        </span>
                        <span className="text-body font-body text-subtext-color">
                          {trigger.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" icon={null}>
                          {trigger.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTriggers.length === 0 && (
              <div className="flex w-full flex-col items-center justify-center gap-4 py-16">
                <FeatherCode className="text-heading-1 font-heading-1 text-subtext-color" />
                <span className="text-heading-3 font-heading-3 text-subtext-color">
                  No triggers found
                </span>
                <span className="text-body font-body text-subtext-color">
                  Try adjusting your search or create a custom trigger
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default TriggerLibrary;
