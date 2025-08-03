import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { GripVertical, Trash2 } from 'lucide-react';
import { FormField } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; // Import the Switch component

interface DraggableFieldProps {
  field: FormField;
  index: number;
  onUpdateField: (updatedProperties: Partial<FormField>) => void;
  onDeleteField: () => void;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  index,
  onUpdateField,
  onDeleteField,
}) => {
  const renderFieldEditor = () => {
   
    if (field.type === 'label') {
      return (
        <div className="space-y-2">
            <Label className="text-sm font-medium mb-1 block">Display Text</Label>
            <Input
                placeholder="Enter display text..."
                value={field.label}
                onChange={(e) => onUpdateField({ label: e.target.value })}
            />
            <Label className="text-sm font-medium mb-1 block">Style</Label>
            <Select
                value={field.labelStyle || 'h3'}
                onValueChange={(value) => onUpdateField({ labelStyle: value as 'h1' | 'h2' | 'h3' })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="h1">Heading 1</SelectItem>
                    <SelectItem value="h2">Heading 2</SelectItem>
                    <SelectItem value="h3">Heading 3</SelectItem>
                </SelectContent>
            </Select>
        </div>
      );
    }

   
    let mainEditor;
    switch (field.type) {
      case 'text':
      case 'number':
        mainEditor = (
          <Input
            placeholder="Enter question label..."
            value={field.label}
            onChange={(e) => onUpdateField({ label: e.target.value })}
          />
        );
        break;
      case 'boolean':
        mainEditor = (
          <div className="flex items-center space-x-3">
            <Checkbox
              id={field.id}
            
              defaultChecked={false} 
            />
            <Input
              id={`label-for-${field.id}`}
              placeholder="Enter question label..."
              value={field.label}
              onChange={(e) => onUpdateField({ label: e.target.value })}
              className="flex-1"
            />
          </div>
        );
        break;
      case 'enum':
        mainEditor = (
          <div className="space-y-2">
            <Input
              placeholder="Enter question label..."
              value={field.label}
              onChange={(e) => onUpdateField({ label: e.target.value })}
            />
            <Input
              placeholder="Comma-separated options (e.g. Yes,No,Maybe)"
              value={field.options?.join(',')}
              onChange={(e) => onUpdateField({ options: e.target.value.split(',').map(opt => opt.trim()) })}
            />
          </div>
        );
        break;
      default:
        mainEditor = <p className="text-destructive">Unknown field type: {field.type}</p>;
    }

    return (
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium mb-1 block">Label/Question</Label>
          {mainEditor}
        </div>
        {/* --- REQUIRED TOGGLE SWITCH --- */}
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor={`required-${field.id}`} className="text-sm font-medium">
            Required
          </Label>
          <Switch
            id={`required-${field.id}`}
            checked={field.required}
            onCheckedChange={(isChecked) => onUpdateField({ required: isChecked })}
          />
        </div>
      </div>
    );
  };

  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-3 border rounded-lg flex items-start space-x-3 bg-card transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
          }`}
        >
          <div {...provided.dragHandleProps} className="cursor-grab pt-2 text-muted-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1">
            {renderFieldEditor()}
          </div>
          <Button variant="ghost" size="icon" onClick={onDeleteField} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Draggable>
  );
};
