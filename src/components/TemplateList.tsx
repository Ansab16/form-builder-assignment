import React from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormTemplate } from '@/types/form';
import { useAppContext } from '@/context/AppContext';

interface TemplateListProps {
  onCreateTemplate: () => void;
  onEditTemplate: (template: FormTemplate) => void;
  onFillForm: (template: FormTemplate) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  onCreateTemplate,
  onEditTemplate,
  onFillForm,
}) => {
  const { templates, deleteTemplate } = useAppContext();

  const handleDelete = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Form Template Builder</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your form templates
            </p>
          </div>
          <Button 
            onClick={onCreateTemplate}
            disabled={templates.length >= 5}
            className="h-12 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </div>

        {templates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first form template to get started
              </p>
              <Button onClick={onCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(template.id, e)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{template.sections.length} sections</span>
                    <span>
                      {template.sections.reduce((acc, section) => acc + section.fields.length, 0)} fields
                    </span>
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => onEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => onFillForm(template)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Use Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {templates.length >= 5 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              You've reached the maximum of 5 templates. Delete a template to create a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};