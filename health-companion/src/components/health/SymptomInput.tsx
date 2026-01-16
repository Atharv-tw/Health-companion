"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMON_SYMPTOMS, SymptomItem } from "@/lib/validators";

interface SymptomInputProps {
  value: { items: SymptomItem[]; freeText?: string };
  onChange: (value: { items: SymptomItem[]; freeText?: string }) => void;
}

export function SymptomInput({ value, onChange }: SymptomInputProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(
    new Set(value.items.map((i) => i.name))
  );

  const handleSymptomToggle = (symptom: string, checked: boolean) => {
    const newSelected = new Set(selectedSymptoms);
    if (checked) {
      newSelected.add(symptom);
      // Add with default severity
      const newItems = [
        ...value.items.filter((i) => i.name !== symptom),
        { name: symptom, severity: "moderate" as const },
      ];
      onChange({ ...value, items: newItems });
    } else {
      newSelected.delete(symptom);
      onChange({
        ...value,
        items: value.items.filter((i) => i.name !== symptom),
      });
    }
    setSelectedSymptoms(newSelected);
  };

  const handleSeverityChange = (symptom: string, severity: "mild" | "moderate" | "severe") => {
    const newItems = value.items.map((item) =>
      item.name === symptom ? { ...item, severity } : item
    );
    onChange({ ...value, items: newItems });
  };

  const handleDurationChange = (symptom: string, duration: string) => {
    const newItems = value.items.map((item) =>
      item.name === symptom ? { ...item, duration } : item
    );
    onChange({ ...value, items: newItems });
  };

  const handleFreeTextChange = (freeText: string) => {
    onChange({ ...value, freeText });
  };

  return (
    <div className="space-y-6">
      {/* Common Symptoms Checklist */}
      <div>
        <Label className="text-base font-medium">Common Symptoms</Label>
        <p className="text-sm text-gray-500 mb-3">Select any symptoms you&apos;re experiencing</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_SYMPTOMS.map((symptom) => (
            <div key={symptom} className="flex items-center space-x-2">
              <Checkbox
                id={symptom}
                checked={selectedSymptoms.has(symptom)}
                onCheckedChange={(checked) =>
                  handleSymptomToggle(symptom, checked as boolean)
                }
              />
              <Label
                htmlFor={symptom}
                className="text-sm font-normal cursor-pointer"
              >
                {symptom}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Symptoms Details */}
      {value.items.length > 0 && (
        <div>
          <Label className="text-base font-medium">Symptom Details</Label>
          <p className="text-sm text-gray-500 mb-3">Specify severity and duration</p>
          <div className="space-y-3">
            {value.items.map((item) => (
              <div
                key={item.name}
                className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Badge variant="secondary" className="font-medium">
                  {item.name}
                </Badge>
                <Select
                  value={item.severity}
                  onValueChange={(val) =>
                    handleSeverityChange(item.name, val as "mild" | "moderate" | "severe")
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={item.duration || ""}
                  onValueChange={(val) => handleDurationChange(item.name, val)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="few hours">Few hours</SelectItem>
                    <SelectItem value="1 day">1 day</SelectItem>
                    <SelectItem value="2-3 days">2-3 days</SelectItem>
                    <SelectItem value="4-7 days">4-7 days</SelectItem>
                    <SelectItem value="more than a week">More than a week</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSymptomToggle(item.name, false)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Text */}
      <div>
        <Label htmlFor="freeText" className="text-base font-medium">
          Additional Notes
        </Label>
        <p className="text-sm text-gray-500 mb-2">
          Describe any other symptoms or relevant information
        </p>
        <Textarea
          id="freeText"
          placeholder="E.g., symptoms started after eating, pain worsens when lying down..."
          value={value.freeText || ""}
          onChange={(e) => handleFreeTextChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
