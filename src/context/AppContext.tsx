import React, { createContext, useContext, useState, useEffect } from 'react';
import { FormTemplate, FormSubmission } from '@/types/form';

interface AppContextType {
  templates: FormTemplate[];
  submissions: FormSubmission[];
  saveTemplate: (template: FormTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  saveSubmission: (submission: FormSubmission) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  useEffect(() => {
    const savedTemplates = localStorage.getItem('formTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }

    const savedSubmissions = localStorage.getItem('formSubmissions');
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
  }, []);

  const saveTemplate = (template: FormTemplate) => {
    const updatedTemplate = {
      ...template,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = templates.findIndex(t => t.id === template.id);
    let newTemplates;

    if (existingIndex >= 0) {
      newTemplates = [...templates];
      newTemplates[existingIndex] = updatedTemplate;
    } else {
      newTemplates = [...templates, updatedTemplate];
      if (newTemplates.length > 5) {
        newTemplates = newTemplates.slice(-5);
      }
    }

    setTemplates(newTemplates);
    localStorage.setItem('formTemplates', JSON.stringify(newTemplates));
  };

  const deleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(newTemplates);
    localStorage.setItem('formTemplates', JSON.stringify(newTemplates));
  };

  const saveSubmission = (submission: FormSubmission) => {
    const newSubmissions = [...submissions, submission];
    setSubmissions(newSubmissions);
    localStorage.setItem('formSubmissions', JSON.stringify(newSubmissions));
  };

  return (
    <AppContext.Provider value={{
      templates,
      submissions,
      saveTemplate,
      deleteTemplate,
      saveSubmission,
    }}>
      {children}
    </AppContext.Provider>
  );
};