import React, { useState } from "react";
import { FeatherClock } from "@subframe/core";
import { FeatherCode } from "@subframe/core";
import { FeatherDatabase } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherGlobe } from "@subframe/core";
import { FeatherMail } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherRss } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherSlack } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherTwitter } from "@subframe/core";
import { Accordion } from "../ui/components/Accordion";
import { Badge } from "../ui/components/Badge";
import { Breadcrumbs } from "../ui/components/Breadcrumbs";
import { Button } from "../ui/components/Button";
import { Select } from "../ui/components/Select";
import { TextField } from "../ui/components/TextField";
import { DefaultPageLayout } from "../ui/layouts/DefaultPageLayout";

interface TriggerActionPageProps {
  onSelectTrigger?: (trigger: string) => void;
  onCreateCustomTrigger?: () => void;
}

function TriggerActionPage({ onSelectTrigger, onCreateCustomTrigger }: TriggerActionPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  return (
    <DefaultPageLayout>
      <div className="group/6ab0c0d1 flex h-full w-full cursor-pointer flex-col items-start bg-default-background">
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-6 py-4">
          <div className="flex grow shrink-0 basis-0 items-center">
            <Breadcrumbs>
              <Breadcrumbs.Item>Workflows</Breadcrumbs.Item>
              <Breadcrumbs.Divider />
              <Breadcrumbs.Item active={true}>Trigger Library</Breadcrumbs.Item>
            </Breadcrumbs>
          </div>
          <Button
            variant="brand-primary"
            icon={<FeatherPlus />}
            onClick={() => onCreateCustomTrigger?.()}
          >
            Create Custom Trigger
          </Button>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start overflow-auto">
          <div className="container max-w-none flex w-full flex-col items-start gap-8 bg-default-background py-8">
            <div className="flex w-full flex-col items-start gap-2">
              <span className="text-heading-2 font-heading-2 text-default-font">
                Trigger Library
              </span>
              <span className="text-body font-body text-subtext-color">
                Select a prebuilt trigger or create your own custom trigger to
                start your workflow
              </span>
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
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                />
              </TextField>
              <Select
                className="h-auto w-64 flex-none"
                variant="filled"
                label=""
                placeholder="All Categories"
                helpText=""
                icon={null}
                value={categoryFilter}
                onValueChange={(value: string) => setCategoryFilter(value)}
              >
                <Select.Item value="all">All Categories</Select.Item>
                <Select.Item value="data">Data Sources</Select.Item>
                <Select.Item value="communication">Communication</Select.Item>
                <Select.Item value="email">Email</Select.Item>
                <Select.Item value="time">Time</Select.Item>
                <Select.Item value="development">Development</Select.Item>
                <Select.Item value="social">Social Media</Select.Item>
              </Select>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex w-full items-center gap-2">
                <FeatherStar className="text-body font-body text-warning-600" />
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Popular Triggers
                </span>
              </div>
              <div className="flex w-full flex-wrap items-start gap-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
                <div 
                  className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:border-brand-200 hover:shadow-md cursor-pointer transition-all"
                  onClick={() => onSelectTrigger?.("rss")}
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-warning-100">
                      <FeatherRss className="text-heading-2 font-heading-2 text-warning-600" />
                    </div>
                    <Badge variant="warning" icon={<FeatherStar />}>
                      Popular
                    </Badge>
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      RSS Feed
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Monitor RSS and Atom feeds for new items and trigger
                      workflows automatically
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Badge variant="neutral" icon={null}>
                      Data Sources
                    </Badge>
                  </div>
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-brand-600">
                          View YAML Example
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={false}
                  >
                    <div className="flex w-full flex-col items-start gap-2 px-3 py-2">
                      <div className="flex w-full flex-col items-start gap-2 rounded-md bg-neutral-50 px-3 py-3">
                        <span className="whitespace-pre-wrap text-caption font-caption text-default-font">
                          {
                            "on:\n  rss:\n    url: https://hnrss.org/newest?points=300\n    config:\n      filterOutputs:\n        title: 1\n        link: 1\n        contentSnippet: 1"
                          }
                        </span>
                      </div>
                    </div>
                  </Accordion>
                </div>
                <div 
                  className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:border-brand-200 hover:shadow-md cursor-pointer transition-all"
                  onClick={() => onSelectTrigger?.("webhook")}
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-success-100">
                      <FeatherGlobe className="text-heading-2 font-heading-2 text-success-600" />
                    </div>
                    <Badge variant="warning" icon={<FeatherStar />}>
                      Popular
                    </Badge>
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Webhook
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Receive HTTP webhooks from external services and trigger
                      custom workflows
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Badge variant="neutral" icon={null}>
                      Communication
                    </Badge>
                  </div>
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-brand-600">
                          View YAML Example
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={false}
                  >
                    <div className="flex w-full flex-col items-start gap-2 px-3 py-2">
                      <div className="flex w-full flex-col items-start gap-2 rounded-md bg-neutral-50 px-3 py-3">
                        <span className="whitespace-pre-wrap text-caption font-caption text-default-font">
                          {
                            "on:\n  webhook:\n    config:\n      path: /webhook/:workflow/:trigger"
                          }
                        </span>
                      </div>
                    </div>
                  </Accordion>
                </div>
              </div>
              <div className="flex w-full flex-wrap items-start gap-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
                <div 
                  className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:border-brand-200 hover:shadow-md cursor-pointer transition-all"
                  onClick={() => onSelectTrigger?.("gmail")}
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-brand-100">
                      <FeatherMail className="text-heading-2 font-heading-2 text-brand-600" />
                    </div>
                    <Badge variant="warning" icon={<FeatherStar />}>
                      Popular
                    </Badge>
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Gmail
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Trigger workflows on new Gmail messages matching specific
                      queries
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Badge variant="neutral" icon={null}>
                      Email
                    </Badge>
                  </div>
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-brand-600">
                          View YAML Example
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={false}
                  >
                    <div className="flex w-full flex-col items-start gap-2 px-3 py-2">
                      <div className="flex w-full flex-col items-start gap-2 rounded-md bg-neutral-50 px-3 py-3">
                        <span className="whitespace-pre-wrap text-caption font-caption text-default-font">
                          {
                            'on:\n  gmail:\n    credentials: ${{ secrets.GMAIL_CREDENTIALS }}\n    query: "from:example@gmail.com is:unread"'
                          }
                        </span>
                      </div>
                    </div>
                  </Accordion>
                </div>
                <div 
                  className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:border-brand-200 hover:shadow-md cursor-pointer transition-all"
                  onClick={() => onSelectTrigger?.("github")}
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-neutral-100">
                      <FeatherGithub className="text-heading-2 font-heading-2 text-neutral-600" />
                    </div>
                    <Badge variant="warning" icon={<FeatherStar />}>
                      Popular
                    </Badge>
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      GitHub
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Trigger workflows on GitHub events like issues, pull
                      requests, and commits
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Badge variant="neutral" icon={null}>
                      Development
                    </Badge>
                  </div>
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-brand-600">
                          View YAML Example
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={false}
                  >
                    <div className="flex w-full flex-col items-start gap-2 px-3 py-2">
                      <div className="flex w-full flex-col items-start gap-2 rounded-md bg-neutral-50 px-3 py-3">
                        <span className="whitespace-pre-wrap text-caption font-caption text-default-font">
                          {
                            "on:\n  github:\n    event: issues\n    token: ${{ secrets.GITHUB_TOKEN }}\n    owner: actionsflow\n    repo: actionsflow"
                          }
                        </span>
                      </div>
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <span className="text-heading-3 font-heading-3 text-default-font">
                All Triggers
              </span>
              <div className="flex w-full flex-wrap items-start gap-4">
                <div 
                  className="flex max-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:border-brand-200 hover:shadow-md cursor-pointer transition-all mobile:max-w-full"
                  onClick={() => onSelectTrigger?.("schedule")}
                >
                  <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-neutral-100">
                    <FeatherClock className="text-heading-2 font-heading-2 text-neutral-600" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Schedule
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Run workflows on a schedule using cron expressions
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Badge variant="neutral" icon={null}>
                      Time
                    </Badge>
                  </div>
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-brand-600">
                          View YAML Example
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={false}
                  >
                    <div className="flex w-full flex-col items-start gap-2 px-3 py-2">
                      <div className="flex w-full flex-col items-start gap-2 rounded-md bg-neutral-50 px-3 py-3">
                        <span className="whitespace-pre-wrap text-caption font-caption text-default-font">
                          {
                            'on:\n  schedule:\n    - cron: "0 */6 * * *"\n    - cron: "0 0 * * *"'
                          }
                        </span>
                      </div>
                    </div>
                  </Accordion>
                </div>
                <div 
                  className="flex max-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:border-brand-200 hover:shadow-md cursor-pointer transition-all mobile:max-w-full"
                  onClick={() => onSelectTrigger?.("poll")}
                >
                  <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-error-100">
                    <FeatherDatabase className="text-heading-2 font-heading-2 text-error-600" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Poll API
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Poll an API endpoint periodically for changes and new data
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Badge variant="neutral" icon={null}>
                      Data Sources
                    </Badge>
                  </div>
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-brand-600">
                          View YAML Example
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={false}
                  >
                    <div className="flex w-full flex-col items-start gap-2 px-3 py-2">
                      <div className="flex w-full flex-col items-start gap-2 rounded-md bg-neutral-50 px-3 py-3">
                        <span className="whitespace-pre-wrap text-caption font-caption text-default-font">
                          {
                            "on:\n  poll:\n    url: https://api.example.com/data\n    every: 5m"
                          }
                        </span>
                      </div>
                    </div>
                  </Accordion>
                </div>
                <div 
                  className="flex max-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:border-brand-200 hover:shadow-md cursor-pointer transition-all mobile:max-w-full"
                  onClick={() => onSelectTrigger?.("slack")}
                >
                  <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-error-100">
                    <FeatherSlack className="text-heading-2 font-heading-2 text-error-600" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Slack
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Monitor Slack channels for messages and mentions
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Badge variant="neutral" icon={null}>
                      Communication
                    </Badge>
                  </div>
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-brand-600">
                          View YAML Example
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={false}
                  >
                    <div className="flex w-full flex-col items-start gap-2 px-3 py-2">
                      <div className="flex w-full flex-col items-start gap-2 rounded-md bg-neutral-50 px-3 py-3">
                        <span className="whitespace-pre-wrap text-caption font-caption text-default-font">
                          {
                            "on:\n  slack:\n    token: ${{ secrets.SLACK_TOKEN }}\n    channel: general"
                          }
                        </span>
                      </div>
                    </div>
                  </Accordion>
                </div>
                <div 
                  className="flex max-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm hover:border-brand-200 hover:shadow-md cursor-pointer transition-all mobile:max-w-full"
                  onClick={() => onSelectTrigger?.("twitter")}
                >
                  <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-brand-100">
                    <FeatherTwitter className="text-heading-2 font-heading-2 text-brand-600" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Twitter
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Monitor Twitter for tweets, mentions, and hashtags
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Badge variant="neutral" icon={null}>
                      Social Media
                    </Badge>
                  </div>
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-brand-600">
                          View YAML Example
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={false}
                  >
                    <div className="flex w-full flex-col items-start gap-2 px-3 py-2">
                      <div className="flex w-full flex-col items-start gap-2 rounded-md bg-neutral-50 px-3 py-3">
                        <span className="whitespace-pre-wrap text-caption font-caption text-default-font">
                          {
                            'on:\n  twitter:\n    credentials: ${{ secrets.TWITTER_CREDENTIALS }}\n    search: "actionsflow"'
                          }
                        </span>
                      </div>
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-solid border-brand-200 bg-brand-50 px-6 py-6">
              <div className="flex w-full items-center gap-4">
                <div className="flex h-12 w-12 flex-none items-center justify-center gap-2 rounded-lg bg-brand-100">
                  <FeatherCode className="text-heading-2 font-heading-2 text-brand-600" />
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="text-heading-3 font-heading-3 text-brand-900">
                    Need a custom trigger?
                  </span>
                  <span className="text-body font-body text-brand-700">
                    Build your own trigger with custom logic and configuration
                  </span>
                </div>
                <Button
                  variant="brand-primary"
                  icon={<FeatherPlus />}
                  onClick={() => onCreateCustomTrigger?.()}
                >
                  Create Custom Trigger
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default TriggerActionPage;