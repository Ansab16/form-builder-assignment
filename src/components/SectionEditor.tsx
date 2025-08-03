import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSection, FormField } from '@/types/form';
import { DraggableField } from './DraggableField';

interface SectionEditorProps {
  section: FormSection;
  onUpdateSection: (section: FormSection) => void;
  onDeleteSection: (sectionId: string) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onUpdateSection,
  onDeleteSection,
}) => {
  const updateSectionTitle = (title: string) => {
    onUpdateSection({ ...section, title });
  };

  const updateField = (updatedField: FormField) => {
    const updatedFields = section.fields.map(field =>
      field.id === updatedField.id ? updatedField : field
    );
    onUpdateSection({ ...section, fields: updatedFields });
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = section.fields.filter(field => field.id !== fieldId);
    onUpdateSection({ ...section, fields: updatedFields });
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <Input
          value={section.title}
          onChange={(e) => updateSectionTitle(e.target.value)}
          className="text-xl font-semibold border-none shadow-none p-0 h-auto"
          placeholder="Section Title"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteSection(section.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Droppable droppableId={section.id} type="field">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[100px] ${
              snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg' : ''
            }`}
          >
            {section.fields.map((field, index) => (
              <DraggableField
                key={field.id}
                field={field}
                index={index}
                onUpdateField={updateField}
                onDeleteField={deleteField}
              />
            ))}
            {provided.placeholder}
            {section.fields.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Drag fields here or use the sidebar to add fields
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};