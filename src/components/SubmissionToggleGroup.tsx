
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SubmissionToggleGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}

const SubmissionToggleGroup: React.FC<SubmissionToggleGroupProps> = ({
  value,
  onValueChange,
  options,
  ariaLabel
}) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onValueChange(val);
      }}
      className="border border-gray-300 rounded-full p-1 bg-gray-50 w-fit"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className={`px-6 py-1.5 rounded-full data-[state=on]:bg-blue-600 data-[state=on]:text-white transition-all`}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default SubmissionToggleGroup;
