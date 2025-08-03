import React, { useState } from 'react';
import { FormTemplate } from '@/types/form';
import { AppProvider } from '@/context/AppContext';
import { TemplateList } from '@/components/TemplateList';
import { TemplateBuilder } from '@/components/TemplateBuilder';
import { FormFiller } from '@/components/FormFiller';

const AppContent = () => {
  const [currentView, setCurrentView] = useState<'list' | 'builder' | 'filler'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const createNewTemplate = () => {
    const newTemplate: FormTemplate = {
      id: `template_${Date.now()}`,
      name: 'Untitled Template',
      sections: [{
        id: `section_${Date.now()}`,
        title: 'Section 1',
        fields: []
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedTemplate(newTemplate);
    setCurrentView('builder');
  };

  const editTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('builder');
  };

  const fillForm = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('filler');
  };

  const saveTemplate = (template: FormTemplate) => {
    setCurrentView('list');
  };

  return (
    <>
      {currentView === 'list' && (
        <TemplateList 
          onCreateTemplate={createNewTemplate}
          onEditTemplate={editTemplate}
          onFillForm={fillForm}
        />
      )}

      {currentView === 'builder' && selectedTemplate && (
        <TemplateBuilder
          template={selectedTemplate}
          onSave={saveTemplate}
          onBack={() => setCurrentView('list')}
        />
      )}

      {currentView === 'filler' && selectedTemplate && (
        <FormFiller
          template={selectedTemplate}
          onBack={() => setCurrentView('list')}
        />
      )}
    </>
  );
};

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;