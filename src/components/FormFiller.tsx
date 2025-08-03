import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormTemplate, FormSubmission } from '@/types/form';
import { FormRenderer } from './FormRenderer';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

interface FormFillerProps {
  template: FormTemplate;
  onBack: () => void;
}

export const FormFiller: React.FC<FormFillerProps> = ({ template, onBack }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { saveSubmission } = useAppContext();
  const { toast } = useToast();

  const handleFieldChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type !== 'label' && field.required) {
          const value = values[field.id];
          
          if (!value || value === '' || (typeof value === 'string' && value.trim() === '')) {
            newErrors[field.id] = `${field.label} is required`;
          } else if (field.type === 'number' && isNaN(Number(value))) {
            newErrors[field.id] = `${field.label} must be a valid number`;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    const submission: FormSubmission = {
      templateId: template.id,
      data: values,
      submittedAt: new Date().toISOString(),
    };

    saveSubmission(submission);
    
    toast({
      title: "Form Submitted!",
      description: "Your form has been submitted successfully.",
    });

    // Reset form
    setValues({});
    setErrors({});
  };

  const isFormValid = () => {
    // Check if all required fields are filled
    return template.sections.every(section =>
      section.fields.every(field => {
        if (field.type === 'label' || !field.required) return true;
        const value = values[field.id];
        return value && value !== '' && (field.type !== 'number' || !isNaN(Number(value)));
      })
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="ml-auto"
          >
            Submit Form
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <FormRenderer
          template={template}
          values={values}
          onChange={handleFieldChange}
          errors={errors}
        />
      </div>
    </div>
  );
};