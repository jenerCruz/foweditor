import React, { useState } from "react";
import { FeatherPlus, FeatherTrash, FeatherCode } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { TextField } from "../ui/components/TextField";
import { TextArea } from "../ui/components/TextArea";
import { Select } from "../ui/components/Select";
import { IconButton } from "../ui/components/IconButton";
import { Accordion } from "../ui/components/Accordion";

export interface JobStep {
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, string>;
  env?: Record<string, string>;
}

export interface Job {
  id: string;
  name: string;
  runsOn: string;
  steps: JobStep[];
}

interface JobStepEditorProps {
  job: Job;
  onChange: (job: Job) => void;
}

const commonActions = [
  { value: "actionsflow/axios@v1", label: "HTTP Request (axios)" },
  { value: "actionsflow/ifttt-webhook-action@v1", label: "IFTTT Webhook" },
  { value: "actions/github-script@v2", label: "GitHub Script" },
  { value: "peter-evans/create-pull-request@v3", label: "Create Pull Request" },
  { value: "dawidd6/action-send-mail@v3", label: "Send Email" }
];

export function JobStepEditor({ job, onChange }: JobStepEditorProps) {
  const addStep = () => {
    const newStep: JobStep = {
      name: "New Step",
      uses: "actionsflow/axios@v1"
    };
    onChange({
      ...job,
      steps: [...job.steps, newStep]
    });
  };

  const updateStep = (index: number, step: JobStep) => {
    const newSteps = [...job.steps];
    newSteps[index] = step;
    onChange({ ...job, steps: newSteps });
  };

  const removeStep = (index: number) => {
    onChange({
      ...job,
      steps: job.steps.filter((_, i) => i !== index)
    });
  };

  const addStepParam = (stepIndex: number, key: string, value: string, type: "with" | "env") => {
    const step = job.steps[stepIndex];
    updateStep(stepIndex, {
      ...step,
      [type]: {
        ...step[type],
        [key]: value
      }
    });
  };

  const removeStepParam = (stepIndex: number, key: string, type: "with" | "env") => {
    const step = job.steps[stepIndex];
    const newParams = { ...step[type] };
    delete newParams[key];
    updateStep(stepIndex, {
      ...step,
      [type]: Object.keys(newParams).length > 0 ? newParams : undefined
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-body-bold font-body-bold text-default-font">
          Job Steps ({job.steps.length})
        </span>
        <Button
          variant="brand-secondary"
          size="small"
          icon={<FeatherPlus />}
          onClick={addStep}
        >
          Add Step
        </Button>
      </div>

      {job.steps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-border py-8">
          <FeatherCode className="text-heading-2 font-heading-2 text-subtext-color" />
          <span className="text-body font-body text-subtext-color">
            No steps added yet
          </span>
          <Button variant="brand-primary" size="small" icon={<FeatherPlus />} onClick={addStep}>
            Add First Step
          </Button>
        </div>
      ) : (
        job.steps.map((step, stepIndex) => (
          <Accordion
            key={stepIndex}
            trigger={
              <div className="flex w-full items-center gap-2 px-4 py-3">
                <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                  Step {stepIndex + 1}: {step.name || step.uses || "Unnamed"}
                </span>
                <IconButton
                  size="small"
                  icon={<FeatherTrash />}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStep(stepIndex);
                  }}
                />
                <Accordion.Chevron />
              </div>
            }
            defaultOpen={stepIndex === job.steps.length - 1}
          >
            <div className="flex w-full flex-col gap-4 px-4 pb-4">
              <TextField
                className="h-auto w-full flex-none"
                variant="filled"
                label="Step Name"
                helpText=""
              >
                <TextField.Input
                  placeholder="Make HTTP Request"
                  value={step.name || ""}
                  onChange={(e) => updateStep(stepIndex, { ...step, name: e.target.value })}
                />
              </TextField>

              <Select
                className="h-auto w-full flex-none"
                variant="filled"
                label="Action (uses)"
                placeholder="Select or enter custom"
                helpText=""
                icon={null}
                value={step.uses || ""}
                onValueChange={(value: string) => updateStep(stepIndex, { ...step, uses: value })}
              >
                {commonActions.map(action => (
                  <Select.Item key={action.value} value={action.value}>
                    {action.label}
                  </Select.Item>
                ))}
              </Select>

              <TextField
                className="h-auto w-full flex-none"
                variant="filled"
                label="Custom Action"
                helpText="Enter custom GitHub action (e.g., owner/repo@version)"
              >
                <TextField.Input
                  placeholder="actionsflow/axios@v1"
                  value={step.uses || ""}
                  onChange={(e) => updateStep(stepIndex, { ...step, uses: e.target.value })}
                />
              </TextField>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    Parameters (with)
                  </span>
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    icon={<FeatherPlus />}
                    onClick={() => {
                      const key = prompt("Parameter name:");
                      const value = prompt("Parameter value:");
                      if (key && value) {
                        addStepParam(stepIndex, key, value, "with");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                {step.with && Object.entries(step.with).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <TextField className="h-auto grow shrink-0 basis-0" variant="filled" label="">
                      <TextField.Input
                        placeholder="key"
                        value={key}
                        disabled
                      />
                    </TextField>
                    <TextField className="h-auto grow shrink-0 basis-0" variant="filled" label="">
                      <TextField.Input
                        placeholder="value"
                        value={value}
                        onChange={(e) => {
                          const newWith = { ...step.with, [key]: e.target.value };
                          updateStep(stepIndex, { ...step, with: newWith });
                        }}
                      />
                    </TextField>
                    <IconButton
                      size="small"
                      icon={<FeatherTrash />}
                      onClick={() => removeStepParam(stepIndex, key, "with")}
                    />
                  </div>
                ))}
              </div>

              <TextArea
                className="h-auto w-full flex-none"
                variant="filled"
                label="Run Script (Alternative to 'uses')"
                helpText="Shell script to execute"
              >
                <TextArea.Input
                  placeholder="echo 'Hello World'"
                  value={step.run || ""}
                  onChange={(e) => updateStep(stepIndex, { ...step, run: e.target.value || undefined })}
                  rows={4}
                  style={{ fontFamily: "monospace", fontSize: "12px" }}
                />
              </TextArea>
            </div>
          </Accordion>
        ))
      )}
    </div>
  );
}
