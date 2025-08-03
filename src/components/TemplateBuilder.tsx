import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Plus, Save, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormTemplate, FormSection, FormField } from '@/types/form';
import { FieldTypeSelector } from './FieldTypeSelector';
import { SectionEditor } from './SectionEditor';
import { FormRenderer } from './FormRenderer';
import { useAppContext } from '@/context/AppContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


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
  const [originalTemplate] = useState<FormTemplate>(template);
  const [isDirty, setIsDirty] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { saveTemplate } = useAppContext();


  const isTemplateValid =
    currentTemplate.name.trim() !== '' &&
    currentTemplate.sections.length > 0 &&
    currentTemplate.sections.some(section => section.fields.length > 0);

  useEffect(() => {
    if (JSON.stringify(currentTemplate) !== JSON.stringify(originalTemplate)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [currentTemplate, originalTemplate]);

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
      label: field.label || 'New Field',
      labelStyle: field.labelStyle,
      options: field.options,
      required: field.required ?? false,
      value: field.type === 'boolean' ? false : '',
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

  const updateFieldInSection = useCallback((sectionId: string, fieldId: string, updatedProperties: Partial<FormField>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map(field => {
              if (field.id === fieldId) {
                return { ...field, ...updatedProperties };
              }
              return field;
            }),
          };
        }
        return section;
      }),
    }));
  }, []);


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
    if (!isTemplateValid) return;
    saveTemplate(currentTemplate);
    onSave(currentTemplate);
  };

  const handleBack = () => {
    if (isDirty) {
      setIsAlertOpen(true);
    } else {
      onBack();
    }
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
            let targetSectionId = currentTemplate.sections[currentTemplate.sections.length - 1]?.id;
            if (!targetSectionId) {
                const newSectionId = `section_${Date.now()}`;
                const newSection: FormSection = { id: newSectionId, title: 'New Section', fields: [] };
                setCurrentTemplate(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
                targetSectionId = newSectionId;
            }
            addFieldToSection(targetSectionId, field);
          }}
        />

        <div className="flex-1 flex flex-col">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleBack}>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div tabIndex={0}>
                        <Button onClick={handleSave} disabled={!isTemplateValid}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Template
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!isTemplateValid && (
                      <TooltipContent>
                        <p>Please add a name and at least one field to save.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
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
                onUpdateField={updateFieldInSection}
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
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes!</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onBack} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Discard & Exit
            </AlertDialogAction>
            <AlertDialogAction onClick={() => { handleSave(); onBack(); }}>
                Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DragDropContext>
  );
};
