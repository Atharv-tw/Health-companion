"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lifestyle } from "@/lib/validators";

interface LifestyleInputProps {
  value: Lifestyle;
  onChange: (value: Lifestyle) => void;
}

export function LifestyleInput({ value = {}, onChange }: LifestyleInputProps) {
  const handleChange = <K extends keyof NonNullable<Lifestyle>>(
    field: K,
    newValue: NonNullable<Lifestyle>[K]
  ) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Lifestyle Factors</Label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Track factors that may affect your health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep Hours */}
        <div className="space-y-2">
          <Label htmlFor="sleepHours">Hours of Sleep (last night)</Label>
          <div className="relative">
            <Input
              id="sleepHours"
              type="number"
              placeholder="7"
              step="0.5"
              min={0}
              max={24}
              value={value?.sleepHours ?? ""}
              onChange={(e) =>
                handleChange(
                  "sleepHours",
                  e.target.value === "" ? undefined : parseFloat(e.target.value)
                )
              }
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
              hrs
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Recommended: 7-9 hours</p>
        </div>

        {/* Stress Level */}
        <div className="space-y-2">
          <Label htmlFor="stressLevel">Stress Level</Label>
          <Select
            value={value?.stressLevel || ""}
            onValueChange={(val) =>
              handleChange("stressLevel", val as "low" | "moderate" | "high")
            }
          >
            <SelectTrigger id="stressLevel">
              <SelectValue placeholder="Select stress level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Feeling relaxed</SelectItem>
              <SelectItem value="moderate">Moderate - Some pressure</SelectItem>
              <SelectItem value="high">High - Very stressed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hydration */}
        <div className="space-y-2">
          <Label htmlFor="hydration">Hydration</Label>
          <Select
            value={value?.hydration || ""}
            onValueChange={(val) =>
              handleChange("hydration", val as "poor" | "adequate" | "good")
            }
          >
            <SelectTrigger id="hydration">
              <SelectValue placeholder="Select hydration level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="poor">Poor - Less than 4 glasses</SelectItem>
              <SelectItem value="adequate">Adequate - 4-6 glasses</SelectItem>
              <SelectItem value="good">Good - 8+ glasses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Meals */}
        <div className="space-y-2">
          <Label htmlFor="meals">Meals Today</Label>
          <Input
            id="meals"
            type="number"
            placeholder="3"
            min={0}
            max={10}
            value={value?.meals ?? ""}
            onChange={(e) =>
              handleChange(
                "meals",
                e.target.value === "" ? undefined : parseInt(e.target.value)
              )
            }
          />
        </div>
      </div>

      {/* Exercise */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <Checkbox
          id="exercise"
          checked={value?.exercise || false}
          onCheckedChange={(checked) => handleChange("exercise", checked as boolean)}
        />
        <div>
          <Label htmlFor="exercise" className="cursor-pointer font-medium">
            Exercised Today
          </Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Any physical activity (walking, gym, sports, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}
