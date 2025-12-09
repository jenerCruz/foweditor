import React, { useState } from "react";
import { FeatherLink, FeatherFilter, FeatherCode } from "@subframe/core";
import { TextField } from "../ui/components/TextField";
import { TextArea } from "../ui/components/TextArea";
import { Switch } from "../ui/components/Switch";
import { Select } from "../ui/components/Select";
import { Accordion } from "../ui/components/Accordion";

export interface TriggerConfig {
  filter?: any;
  filterOutputs?: Record<string, number>;
  filterScript?: string;
  format?: string;
  outputsMode?: "separate" | "combine";
  exportOutputs?: boolean;
  deduplicationKey?: string;
}

interface TriggerConfigFormProps {
  config: TriggerConfig;
  onChange: (config: TriggerConfig) => void;
}

export function TriggerConfigForm({ config, onChange }: TriggerConfigFormProps) {
  const [filterOutputs, setFilterOutputs] = useState<string[]>(
    config.filterOutputs ? Object.keys(config.filterOutputs) : []
  );

  const handleFilterOutputsChange = (field: string, enabled: boolean) => {
    const newOutputs = enabled
      ? [...filterOutputs, field]
      : filterOutputs.filter(f => f !== field);
    
    setFilterOutputs(newOutputs);
    
    const filterOutputsObj = newOutputs.reduce((acc, key) => {
      acc[key] = 1;
      return acc;
    }, {} as Record<string, number>);

    onChange({
      ...config,
      filterOutputs: Object.keys(filterOutputsObj).length > 0 ? filterOutputsObj : undefined
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 px-4 py-3">
            <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
              Filter Configuration
            </span>
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={true}
      >
        <div className="flex w-full flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-2 rounded-md border border-solid border-brand-200 bg-brand-50 p-3">
            <span className="text-caption-bold font-caption-bold text-brand-900">
              Filter Outputs
            </span>
            <span className="text-caption font-caption text-brand-700">
              Select which fields to include in outputs. Only selected fields will be passed to jobs.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-body-bold font-body-bold text-default-font">Common Fields</span>
            {["title", "link", "description", "contentSnippet", "date", "pubDate"].map(field => (
              <div key={field} className="flex items-center justify-between">
                <span className="text-body font-body text-default-font">{field}</span>
                <Switch
                  checked={filterOutputs.includes(field)}
                  onCheckedChange={(checked) => handleFilterOutputsChange(field, checked)}
                />
              </div>
            ))}
          </div>

          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="Custom Field"
            helpText="Add custom field to filter"
          >
            <TextField.Input
              placeholder="customField"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value;
                  if (value && !filterOutputs.includes(value)) {
                    handleFilterOutputsChange(value, true);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
          </TextField>
        </div>
      </Accordion>

      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 px-4 py-3">
            <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
              Filter Script (JavaScript)
            </span>
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={false}
      >
        <div className="flex w-full flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-2 rounded-md border border-solid border-warning-200 bg-warning-50 p-3">
            <span className="text-caption-bold font-caption-bold text-warning-900">
              JavaScript Filter
            </span>
            <span className="text-caption font-caption text-warning-700">
              Like Array.prototype.filter(). Return true to keep the item. Available variables: item, index, items
            </span>
          </div>

          <TextArea
            className="h-auto w-full flex-none"
            variant="filled"
            label=""
            helpText="Example: if(item.title.includes('important')) return true;"
          >
            <TextArea.Input
              placeholder={`if(item.title.includes('keyword')) {
  return true;
}`}
              value={config.filterScript || ""}
              onChange={(e) => onChange({ ...config, filterScript: e.target.value || undefined })}
              rows={6}
              style={{ fontFamily: "monospace", fontSize: "12px" }}
            />
          </TextArea>
        </div>
      </Accordion>

      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 px-4 py-3">
            <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
              Format Function
            </span>
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={false}
      >
        <div className="flex w-full flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-2 rounded-md border border-solid border-success-200 bg-success-50 p-3">
            <span className="text-caption-bold font-caption-bold text-success-900">
              Format Function
            </span>
            <span className="text-caption font-caption text-success-700">
              Transform item fields. Must return the modified item. Called after filterOutputs.
            </span>
          </div>

          <TextArea
            className="h-auto w-full flex-none"
            variant="filled"
            label=""
            helpText="Example: item.title = item.title.substring(0, 50); return item;"
          >
            <TextArea.Input
              placeholder={`item.title = item.title.substring(0, 50);
return item;`}
              value={config.format || ""}
              onChange={(e) => onChange({ ...config, format: e.target.value || undefined })}
              rows={6}
              style={{ fontFamily: "monospace", fontSize: "12px" }}
            />
          </TextArea>
        </div>
      </Accordion>

      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 px-4 py-3">
            <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
              Advanced Options
            </span>
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={false}
      >
        <div className="flex w-full flex-col gap-4 px-4 pb-4">
          <Select
            className="h-auto w-full flex-none"
            variant="filled"
            label="Outputs Mode"
            placeholder="Select mode"
            helpText="separate: call job for each item | combine: call job once with all items"
            icon={null}
            value={config.outputsMode || "separate"}
            onValueChange={(value: string) =>
              onChange({ ...config, outputsMode: value as "separate" | "combine" })
            }
          >
            <Select.Item value="separate">Separate (default)</Select.Item>
            <Select.Item value="combine">Combine (digest mode)</Select.Item>
          </Select>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-body-bold font-body-bold text-default-font">
                Export Outputs to File
              </span>
              <span className="text-caption font-caption text-subtext-color">
                Export outputs as file to avoid "argument list too long" error
              </span>
            </div>
            <Switch
              checked={config.exportOutputs || false}
              onCheckedChange={(checked) => onChange({ ...config, exportOutputs: checked })}
            />
          </div>

          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="Deduplication Key"
            helpText="Field to use for deduplication (e.g., 'id', 'link')"
          >
            <TextField.Input
              placeholder="id"
              value={config.deduplicationKey || ""}
              onChange={(e) =>
                onChange({ ...config, deduplicationKey: e.target.value || undefined })
              }
            />
          </TextField>
        </div>
      </Accordion>
    </div>
  );
}
