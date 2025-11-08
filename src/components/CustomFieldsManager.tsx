import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { CustomFieldDefinition } from "@/store/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TagField = ({ fieldId, fieldName, tags, onTagAdd, onTagRemove }: {
  fieldId: string;
  fieldName: string;
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}) => {
  const [newTag, setNewTag] = useState("");

  return (
    <div className="space-y-2">
      <Label>{fieldName}</Label>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => onTagRemove(tag)}
              className="hover:bg-primary/20 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder="Add tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (newTag.trim()) {
                onTagAdd(newTag.trim());
                setNewTag("");
              }
            }
          }}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
        />
      </div>
    </div>
  );
};

interface CustomFieldsManagerProps {
  customFields: Record<string, string>;
  customFieldDefinitions: CustomFieldDefinition[];
  onChange: (fields: Record<string, string>) => void;
}

export const CustomFieldsManager = ({
  customFields,
  customFieldDefinitions,
  onChange,
}: CustomFieldsManagerProps) => {
  const [localFields, setLocalFields] = useState<Record<string, string>>(customFields || {});

  const handleFieldChange = (fieldId: string, value: string) => {
    const updated = { ...localFields, [fieldId]: value };
    setLocalFields(updated);
    onChange(updated);
  };

  const handleTagAdd = (fieldId: string, tag: string) => {
    const currentValue = localFields[fieldId] || "";
    const tags = currentValue ? currentValue.split(",").map(t => t.trim()) : [];
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
      const updated = { ...localFields, [fieldId]: tags.join(", ") };
      setLocalFields(updated);
      onChange(updated);
    }
  };

  const handleTagRemove = (fieldId: string, tagToRemove: string) => {
    const currentValue = localFields[fieldId] || "";
    const tags = currentValue.split(",").map(t => t.trim()).filter(t => t !== tagToRemove);
    const updated = { ...localFields, [fieldId]: tags.join(", ") };
    setLocalFields(updated);
    onChange(updated);
  };

  if (customFieldDefinitions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {customFieldDefinitions.map((fieldDef) => {
        const value = localFields[fieldDef.id] || fieldDef.defaultValue || "";

        if (fieldDef.type === "tag") {
          const tags = value ? value.split(",").map(t => t.trim()).filter(Boolean) : [];
          
          return (
            <TagField
              key={fieldDef.id}
              fieldId={fieldDef.id}
              fieldName={fieldDef.name}
              tags={tags}
              onTagAdd={(tag) => handleTagAdd(fieldDef.id, tag)}
              onTagRemove={(tag) => handleTagRemove(fieldDef.id, tag)}
            />
          );
        }

        if (fieldDef.type === "select") {
          return (
            <div key={fieldDef.id} className="space-y-2">
              <Label>{fieldDef.name}</Label>
              <Select value={value} onValueChange={(val) => handleFieldChange(fieldDef.id, val)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${fieldDef.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {fieldDef.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (fieldDef.type === "date") {
          return (
            <div key={fieldDef.id} className="space-y-2">
              <Label>{fieldDef.name}</Label>
              <Input
                type="date"
                value={value}
                onChange={(e) => handleFieldChange(fieldDef.id, e.target.value)}
              />
            </div>
          );
        }

        if (fieldDef.type === "number") {
          return (
            <div key={fieldDef.id} className="space-y-2">
              <Label>{fieldDef.name}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => handleFieldChange(fieldDef.id, e.target.value)}
              />
            </div>
          );
        }

        // Default to text
        return (
          <div key={fieldDef.id} className="space-y-2">
            <Label>{fieldDef.name}</Label>
            <Input
              value={value}
              onChange={(e) => handleFieldChange(fieldDef.id, e.target.value)}
              placeholder={`Enter ${fieldDef.name}`}
            />
          </div>
        );
      })}
    </div>
  );
};

