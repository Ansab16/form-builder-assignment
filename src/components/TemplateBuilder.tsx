import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Plus, Save, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormTemplate, FormSection, FormField } from '@/types/form';
import { FieldTypeSelector } from './FieldTypeSelector';
import { SectionEditor } from './SectionEditor';
import { FormRenderer } from './FormRenderer';
import { useAppContext } from '@/context/AppContext';

interface TemplateBuilderProps {
  template: FormTemplate;
  onSave: (template: FormTemplate) => void;
  onBack: () => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  template,
  onSave,
  onBack,
}) => {
  const [currentTemplate, setCurrentTemplate] = useState<FormTemplate>(template);
  const [showPreview, setShowPreview] = useState(false);
  const { saveTemplate } = useAppContext();

  const updateTemplateName = (name: string) => {
    setCurrentTemplate(prev => ({ ...prev, name }));
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      fields: [],
    };
    setCurrentTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const updateSection = (updatedSection: FormSection) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === updatedSection.id ? updatedSection : section
      ),
    }));
  };

  const deleteSection = (sectionId: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId),
    }));
  };

  const addFieldToSection = (sectionId: string, field: Partial<FormField>) => {
    const completeField: FormField = {
      id: field.id || `field_${Date.now()}`,
      type: field.type || 'text',
      label: field.label || '',
      labelStyle: field.labelStyle,
      options: field.options,
      required: field.required ?? true,
    };

    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, completeField] }
          : section
      ),
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const section = currentTemplate.sections.find(s => s.id === source.droppableId);
      if (!section) return;

      const newFields = Array.from(section.fields);
      const [reorderedField] = newFields.splice(source.index, 1);
      newFields.splice(destination.index, 0, reorderedField);

      updateSection({ ...section, fields: newFields });
    }
  };

  const handleSave = () => {
    saveTemplate(currentTemplate);
    onSave(currentTemplate);
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Editor
              </Button>
              <h1 className="text-2xl font-bold">Preview: {currentTemplate.name}</h1>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <FormRenderer template={currentTemplate} />
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background flex">
        <FieldTypeSelector
          onAddField={(field) => {
            if (currentTemplate.sections.length === 0) {
              addSection();
            }
            addFieldToSection(currentTemplate.sections[currentTemplate.sections.length - 1].id, field);
          }}
        />

        <div className="flex-1 flex flex-col">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Input
                  value={currentTemplate.name}
                  onChange={(e) => updateTemplateName(e.target.value)}
                  className="text-xl font-bold border-none shadow-none p-0 h-auto"
                  placeholder="Template Name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {currentTemplate.sections.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                onUpdateSection={updateSection}
                onDeleteSection={deleteSection}
              />
            ))}

            <Button
              variant="outline"
              onClick={addSection}
              className="w-full h-20 border-dashed"
            >
              <Plus className="h-6 w-6 mr-2" />
              Add New Section
            </Button>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};