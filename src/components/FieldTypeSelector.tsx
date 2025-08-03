import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/types/form';

interface FieldTypeSelectorProps {
  onAddField: (field: Partial<FormField>) => void;
}

const fieldTypes = [
  { type: 'label' as const, name: 'Label', description: 'Display text with heading styles' },
  { type: 'text' as const, name: 'Text Input', description: 'Single line text field' },
  { type: 'number' as const, name: 'Number Input', description: 'Numeric input field' },
  { type: 'boolean' as const, name: 'Checkbox', description: 'True/false toggle' },
  { type: 'enum' as const, name: 'Dropdown', description: 'Select from options' },
];

export const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = ({ onAddField }) => {
  const handleAddField = (type: FormField['type']) => {
    const baseField: Partial<FormField> = {
      id: `field_${Date.now()}`,
      type,
      label: type === 'label' ? 'New Label' : `New ${type} field`,
      required: type !== 'label',
    };

    if (type === 'label') {
      baseField.labelStyle = 'h2';
    } else if (type === 'enum') {
      const options = prompt('Enter options separated by commas:');
      if (options) {
        baseField.options = options.split(',').map(opt => opt.trim());
      } else {
        return;
      }
    }

    onAddField(baseField);
  };

  return (
    <div className="w-64 border-r border-border bg-muted/30 p-4">
      <h3 className="font-semibold text-lg mb-4">Field Types</h3>
      <div className="space-y-2">
        {fieldTypes.map((fieldType) => (
          <Button
            key={fieldType.type}
            variant="outline"
            className="w-full justify-start text-left h-auto p-3"
            onClick={() => handleAddField(fieldType.type)}
          >
            <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">{fieldType.name}</div>
              <div className="text-xs text-muted-foreground">{fieldType.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};