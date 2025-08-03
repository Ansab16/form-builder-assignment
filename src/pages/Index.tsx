import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Plus, Trash2, Edit, Eye, GripVertical, ArrowLeft, Save, FileText } from 'lucide-react';

// TypeScript interfaces
interface FormField {
  id: string;
  type: 'label' | 'text' | 'number' | 'boolean' | 'enum';
  label: string;
  required?: boolean;
  options?: string[]; // For enum type
  style?: 'h1' | 'h2' | 'h3'; // For label type
}

interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormTemplate {
  id: string;
  name: string;
  sections: FormSection[];
  createdAt: string;
  updatedAt: string;
}

interface FormSubmission {
  id: string;
  templateId: string;
  templateName: string;
  data: Record<string, any>;
  submittedAt: string;
}

interface AppContextType {
  templates: FormTemplate[];
  submissions: FormSubmission[];
  setTemplates: React.Dispatch<React.SetStateAction<FormTemplate[]>>;
  setSubmissions: React.Dispatch<React.SetStateAction<FormSubmission[]>>;
  saveTemplate: (template: FormTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  submitForm: (templateId: string, templateName: string, data: Record<string, any>) => void;
}

// Context for global state management
const AppContext = createContext<AppContextType | null>(null);

// Custom hook to use app context
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// App Provider component
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('formTemplates');
    const savedSubmissions = localStorage.getItem('formSubmissions');
    
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
    
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
  }, []);

  // Save templates to localStorage
  useEffect(() => {
    localStorage.setItem('formTemplates', JSON.stringify(templates));
  }, [templates]);

  // Save submissions to localStorage
  useEffect(() => {
    localStorage.setItem('formSubmissions', JSON.stringify(submissions));
  }, [submissions]);

  const saveTemplate = useCallback((template: FormTemplate) => {
    setTemplates(prev => {
      const existing = prev.findIndex(t => t.id === template.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...template, updatedAt: new Date().toISOString() };
        return updated;
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Template Limit Reached",
            description: "You can only save up to 5 templates. Please delete one first.",
            variant: "destructive"
          });
          return prev;
        }
        return [...prev, template];
      }
    });
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    // Also remove related submissions
    setSubmissions(prev => prev.filter(s => s.templateId !== templateId));
  }, []);

  const submitForm = useCallback((templateId: string, templateName: string, data: Record<string, any>) => {
    const submission: FormSubmission = {
      id: Date.now().toString(),
      templateId,
      templateName,
      data,
      submittedAt: new Date().toISOString()
    };
    setSubmissions(prev => [...prev, submission]);
  }, []);

  const value: AppContextType = {
    templates,
    submissions,
    setTemplates,
    setSubmissions,
    saveTemplate,
    deleteTemplate,
    submitForm
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Field Configuration Modal
const FieldConfigModal: React.FC<{
  field: FormField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
}> = ({ field, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<FormField>>({});
  const [enumOptions, setEnumOptions] = useState('');

  useEffect(() => {
    if (field) {
      setFormData(field);
      setEnumOptions(field.options?.join(', ') || '');
    } else {
      setFormData({ type: 'text', label: '', required: true });
      setEnumOptions('');
    }
  }, [field, isOpen]);

  const handleSave = () => {
    if (!formData.label && formData.type !== 'label') {
      toast({
        title: "Validation Error",
        description: "Field label is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'enum' && !enumOptions.trim()) {
      toast({
        title: "Validation Error", 
        description: "Options are required for dropdown fields",
        variant: "destructive"
      });
      return;
    }

    const newField: FormField = {
      id: field?.id || Date.now().toString(),
      type: formData.type as FormField['type'],
      label: formData.label || '',
      required: formData.required ?? true,
      ...(formData.type === 'enum' && { 
        options: enumOptions.split(',').map(opt => opt.trim()).filter(Boolean) 
      }),
      ...(formData.type === 'label' && { 
        style: formData.style || 'h2' 
      })
    };

    onSave(newField);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Field' : 'Add Field'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fieldType">Field Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as FormField['type'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="label">Label</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="enum">Dropdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'label' ? (
            <div>
              <Label htmlFor="labelStyle">Label Style</Label>
              <Select 
                value={formData.style} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, style: value as 'h1' | 'h2' | 'h3' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="fieldLabel">Field Label</Label>
              <Input
                id="fieldLabel"
                value={formData.label || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Enter field label"
              />
            </div>
          )}

          {formData.type === 'enum' && (
            <div>
              <Label htmlFor="enumOptions">Options (comma-separated)</Label>
              <Textarea
                id="enumOptions"
                value={enumOptions}
                onChange={(e) => setEnumOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                rows={3}
              />
            </div>
          )}

          {formData.type !== 'label' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: Boolean(checked) }))}
              />
              <Label htmlFor="required">Make as required</Label>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Form Field Component for rendering in builder and preview
const FormFieldComponent: React.FC<{
  field: FormField;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
  isBuilder?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ field, value, onChange, error, isBuilder, onEdit, onDelete }) => {
  const renderField = () => {
    switch (field.type) {
      case 'label':
        const LabelTag = field.style as keyof JSX.IntrinsicElements;
        const labelClasses = {
          h1: 'text-3xl font-bold',
          h2: 'text-2xl font-semibold', 
          h3: 'text-xl font-medium'
        };
        return (
          <LabelTag className={labelClasses[field.style || 'h2']}>
            {field.label}
          </LabelTag>
        );

      case 'text':
        return (
          <div>
            <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div>
            <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={(checked) => onChange?.(checked)}
            />
            <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      case 'enum':
        return (
          <div>
            <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
            <Select value={value || ''} onValueChange={onChange}>
              <SelectTrigger className={error ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (isBuilder) {
    return (
      <div className="group relative p-3 border border-border rounded-lg hover:border-primary transition-colors">
        <div className="flex items-center justify-between mb-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {renderField()}
      </div>
    );
  }

  return renderField();
};

// Template Builder Component
const TemplateBuilder: React.FC<{
  template: FormTemplate;
  onSave: (template: FormTemplate) => void;
  onBack: () => void;
}> = ({ template, onSave, onBack }) => {
  const [currentTemplate, setCurrentTemplate] = useState<FormTemplate>(template);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');

  const addSection = () => {
    const newSection: FormSection = {
      id: Date.now().toString(),
      title: 'New Section',
      fields: []
    };
    setCurrentTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, title } : section
      )
    }));
  };

  const deleteSection = (sectionId: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const addField = (sectionId: string, fieldType: FormField['type']) => {
    setCurrentSectionId(sectionId);
    const newField: FormField = {
      id: Date.now().toString(),
      type: fieldType,
      label: fieldType === 'label' ? 'Label Text' : '',
      required: fieldType !== 'label',
      ...(fieldType === 'label' && { style: 'h2' })
    };
    setSelectedField(newField);
    setIsFieldModalOpen(true);
  };

  const editField = (field: FormField) => {
    setSelectedField(field);
    setIsFieldModalOpen(true);
  };

  const saveField = (field: FormField) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === currentSectionId || section.fields.some(f => f.id === field.id)) {
          return {
            ...section,
            fields: section.fields.some(f => f.id === field.id)
              ? section.fields.map(f => f.id === field.id ? field : f)
              : [...section.fields, field]
          };
        }
        return section;
      })
    }));
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(f => f.id !== fieldId) }
          : section
      )
    }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sectionId = source.droppableId;

    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          const newFields = Array.from(section.fields);
          const [reorderedField] = newFields.splice(source.index, 1);
          newFields.splice(destination.index, 0, reorderedField);
          return { ...section, fields: newFields };
        }
        return section;
      })
    }));
  };

  const handleSave = () => {
    if (!currentTemplate.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    if (currentTemplate.sections.length === 0) {
      toast({
        title: "Validation Error",
        description: "Template must have at least one section",
        variant: "destructive"
      });
      return;
    }

    onSave(currentTemplate);
    toast({
      title: "Success",
      description: "Template saved successfully"
    });
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setIsPreview(false)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold">Preview: {currentTemplate.name}</h1>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          <FormFiller template={currentTemplate} isPreview />
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-background">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Input
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="text-xl font-semibold border-none p-0 h-auto bg-transparent"
                placeholder="Template Name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setIsPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-80 border-r border-border bg-muted/30 p-6">
            <h3 className="font-semibold mb-4">Add Fields</h3>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">TEXT ELEMENTS</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => currentTemplate.sections.length > 0 && addField(currentTemplate.sections[0].id, 'text')}
                >
                  Short Answer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => currentTemplate.sections.length > 0 && addField(currentTemplate.sections[0].id, 'label')}
                >
                  Paragraph
                </Button>
              </div>
              
              <h4 className="text-sm font-medium text-muted-foreground mt-4">INPUT FIELDS</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => currentTemplate.sections.length > 0 && addField(currentTemplate.sections[0].id, 'number')}
                >
                  Number
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => currentTemplate.sections.length > 0 && addField(currentTemplate.sections[0].id, 'enum')}
                >
                  Dropdown
                </Button>
              </div>
              
              <h4 className="text-sm font-medium text-muted-foreground mt-4">MULTIPLE CHOICE</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => currentTemplate.sections.length > 0 && addField(currentTemplate.sections[0].id, 'enum')}
                >
                  Radio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => currentTemplate.sections.length > 0 && addField(currentTemplate.sections[0].id, 'boolean')}
                >
                  Yes / No
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {currentTemplate.sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No sections yet</h3>
                <p className="text-muted-foreground mb-4">Add your first section to get started</p>
                <Button onClick={addSection}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {currentTemplate.sections.map((section) => (
                  <Card key={section.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Droppable droppableId={section.id}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                          {section.fields.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No fields in this section yet.</p>
                              <p className="text-sm">Use the field palette on the right to add fields.</p>
                            </div>
                          ) : (
                            section.fields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <FormFieldComponent
                                      field={field}
                                      isBuilder
                                      onEdit={() => editField(field)}
                                      onDelete={() => deleteField(section.id, field.id)}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Card>
                ))}

                <div className="flex justify-center">
                  <Button variant="outline" onClick={addSection}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <FieldConfigModal
          field={selectedField}
          isOpen={isFieldModalOpen}
          onClose={() => {
            setIsFieldModalOpen(false);
            setSelectedField(null);
            setCurrentSectionId('');
          }}
          onSave={saveField}
        />
      </div>
    </DragDropContext>
  );
};

// Form Filler Component
const FormFiller: React.FC<{
  template: FormTemplate;
  onBack?: () => void;
  isPreview?: boolean;
}> = ({ template, onBack, isPreview }) => {
  const { submitForm } = useAppContext();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateFieldValue = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type !== 'label' && field.required) {
          const value = formData[field.id];
          if (!value && value !== 0 && value !== false) {
            newErrors[field.id] = 'This field is required';
            isValid = false;
          } else if (field.type === 'number' && isNaN(Number(value))) {
            newErrors[field.id] = 'Please enter a valid number';
            isValid = false;
          }
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPreview) {
      toast({
        title: "Preview Mode",
        description: "This is just a preview. Form submission is disabled."
      });
      return;
    }

    if (validateForm()) {
      submitForm(template.id, template.name, formData);
      setIsSubmitted(true);
      toast({
        title: "Success",
        description: "Form submitted successfully!"
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
    }
  };

  if (isSubmitted && !isPreview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Form Submitted Successfully!</h2>
          <p className="text-muted-foreground mb-6">Thank you for your submission.</p>
          <Button onClick={onBack}>Back to Templates</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isPreview && (
        <div className="border-b border-border bg-background">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold">{template.name}</h1>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {template.sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-xl font-semibold mb-6">{section.title}</h2>
              <div className="space-y-6">
                {section.fields.map((field) => (
                  <FormFieldComponent
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => updateFieldValue(field.id, value)}
                    error={errors[field.id]}
                  />
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex justify-center pt-6">
            <Button type="submit" size="lg" className="px-12">
              {isPreview ? 'Preview Submit' : 'Submit Form'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Template List Component
const TemplateList: React.FC<{
  onCreateTemplate: () => void;
  onEditTemplate: (template: FormTemplate) => void;
  onFillForm: (template: FormTemplate) => void;
  onShowFillSelector: () => void;
}> = ({ onCreateTemplate, onEditTemplate, onFillForm, onShowFillSelector }) => {
  const { templates, deleteTemplate } = useAppContext();

  const handleDelete = (templateId: string) => {
    deleteTemplate(templateId);
    toast({
      title: "Success",
      description: "Template deleted successfully"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Form Templates</h1>
            <p className="text-muted-foreground mt-1">Create and manage your form templates</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onShowFillSelector}>
              <FileText className="w-4 h-4 mr-2" />
              Fill a Form
            </Button>
            <Button onClick={onCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-6">Create your first template to get started</p>
            <Button onClick={onCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {template.sections.length} sections
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditTemplate(template)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFillForm(template)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Template Selector for Form Filling
const TemplateFillSelector: React.FC<{
  onSelectTemplate: (template: FormTemplate) => void;
  onBack: () => void;
}> = ({ onSelectTemplate, onBack }) => {
  const { templates } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">Fill a Form</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Choose a template to fill out</h2>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates available</h3>
            <p className="text-muted-foreground mb-6">Create a template first before you can fill out forms</p>
            <Button onClick={onBack}>Go Back</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{template.sections.length} sections</span>
                        <span>{template.sections.reduce((acc, section) => acc + section.fields.length, 0)} fields</span>
                        <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button onClick={() => onSelectTemplate(template)}>
                      Fill This Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const AppContent = () => {
  const [currentView, setCurrentView] = useState<'list' | 'builder' | 'filler' | 'fill-selector'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const createNewTemplate = () => {
    const newTemplate: FormTemplate = {
      id: Date.now().toString(),
      name: 'Untitled Template',
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

  const { saveTemplate: saveToContext } = useAppContext();
  
  const saveTemplate = (template: FormTemplate) => {
    saveToContext(template);
    setCurrentView('list');
  };

  const showFillSelector = () => {
    setCurrentView('fill-selector');
  };

  return (
    <>
      {currentView === 'list' && (
        <TemplateList 
          onCreateTemplate={createNewTemplate}
          onEditTemplate={editTemplate}
          onFillForm={fillForm}
          onShowFillSelector={showFillSelector}
        />
      )}
      
      {currentView === 'fill-selector' && (
        <TemplateFillSelector
          onSelectTemplate={fillForm}
          onBack={() => setCurrentView('list')}
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