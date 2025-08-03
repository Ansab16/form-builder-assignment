import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSection, FormField } from '@/types/form';
import { DraggableField } from './DraggableField';

// Props are updated to include the new onUpdateField function
interface SectionEditorProps {
  section: FormSection;
  onUpdateSection: (section: FormSection) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateField: (sectionId: string, fieldId: string, updatedProperties: Partial<FormField>) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onUpdateSection,
  onDeleteSection,
  onUpdateField, // The new prop from TemplateBuilder
}) => {
  const updateSectionTitle = (title: string) => {
    onUpdateSection({ ...section, title });
  };

  // This function is now more efficient, as it doesn't re-create the whole array
  const deleteField = (fieldId: string) => {
    const updatedFields = section.fields.filter(field => field.id !== fieldId);
    onUpdateSection({ ...section, fields: updatedFields });
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Input
          value={section.title}
          onChange={(e) => updateSectionTitle(e.target.value)}
          className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
          placeholder="Section Title"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteSection(section.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Droppable droppableId={section.id} type="field">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-4 min-h-[100px] p-2 rounded-md transition-colors ${
              snapshot.isDraggingOver ? 'bg-muted' : ''
            }`}
          >
            {section.fields.map((field, index) => (
              <DraggableField
                key={field.id}
                field={field}
                index={index}
                // We pass a new function to DraggableField that already knows
                // the sectionId and fieldId, making it cleaner to use.
                onUpdateField={(updatedProperties) =>
                  onUpdateField(section.id, field.id, updatedProperties)
                }
                onDeleteField={() => deleteField(field.id)}
              />
            ))}
            {provided.placeholder}
            {section.fields.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                <p>Drag fields here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
