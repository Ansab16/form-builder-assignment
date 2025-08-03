import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/types/form';

interface DraggableFieldProps {
  field: FormField;
  index: number;
  onUpdateField: (field: FormField) => void;
  onDeleteField: (fieldId: string) => void;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  index,
  onUpdateField,
  onDeleteField,
}) => {
  const updateField = (updates: Partial<FormField>) => {
    onUpdateField({ ...field, ...updates });
  };

  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-4 border border-border rounded-lg bg-card ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteField(field.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Field Type</label>
              <div className="text-sm text-muted-foreground capitalize">{field.type}</div>
            </div>

            {field.type === 'label' ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Text</label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField({ label: e.target.value })}
                    placeholder="Label text"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Style</label>
                  <select
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={field.labelStyle || 'h2'}
                    onChange={(e) => updateField({ labelStyle: e.target.value as 'h1' | 'h2' | 'h3' })}
                  >
                    <option value="h1">H1 (Large)</option>
                    <option value="h2">H2 (Medium)</option>
                    <option value="h3">H3 (Small)</option>
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1 block">Label/Question</label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField({ label: e.target.value })}
                  placeholder="Field label"
                />
              </div>
            )}

            {field.type === 'enum' && field.options && (
              <div>
                <label className="text-sm font-medium mb-1 block">Options</label>
                <div className="text-sm text-muted-foreground">
                  {field.options.join(', ')}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => {
                    const newOptions = prompt('Enter options separated by commas:', field.options?.join(', '));
                    if (newOptions) {
                      updateField({ options: newOptions.split(',').map(opt => opt.trim()) });
                    }
                  }}
                >
                  Edit Options
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};