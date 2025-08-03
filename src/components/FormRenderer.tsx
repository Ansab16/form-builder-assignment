import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormTemplate } from '@/types/form';

interface FormRendererProps {
  template: FormTemplate;
  values?: Record<string, any>;
  onChange?: (fieldId: string, value: any) => void;
  errors?: Record<string, string>;
  isPreview?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  template,
  values = {},
  onChange,
  errors = {},
  isPreview = false,
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
        <p className="text-muted-foreground">
          {isPreview ? 'This is a preview of your form' : 'Please fill out all fields'}
        </p>
      </div>

      {template.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">
            {section.title}
          </h2>

          {section.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type === 'label' ? (
                <div>
                  {field.labelStyle === 'h1' && (
                    <h1 className="text-3xl font-bold">{field.label}</h1>
                  )}
                  {field.labelStyle === 'h2' && (
                    <h2 className="text-2xl font-semibold">{field.label}</h2>
                  )}
                  {field.labelStyle === 'h3' && (
                    <h3 className="text-xl font-medium">{field.label}</h3>
                  )}
                </div>
              ) : (
                <>
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <Input
                      value={values[field.id] || ''}
                      onChange={(e) => onChange?.(field.id, e.target.value)}
                      disabled={isPreview}
                      className={errors[field.id] ? 'border-destructive' : ''}
                    />
                  )}

                  {field.type === 'number' && (
                    <Input
                      type="number"
                      value={values[field.id] || ''}
                      onChange={(e) => onChange?.(field.id, e.target.value)}
                      disabled={isPreview}
                      className={errors[field.id] ? 'border-destructive' : ''}
                    />
                  )}

                  {field.type === 'boolean' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={values[field.id] || false}
                        onCheckedChange={(checked) => onChange?.(field.id, checked)}
                        disabled={isPreview}
                      />
                      <span className="text-sm">Yes</span>
                    </div>
                  )}

                  {field.type === 'enum' && field.options && (
                    <select
                      value={values[field.id] || ''}
                      onChange={(e) => onChange?.(field.id, e.target.value)}
                      disabled={isPreview}
                      className={`w-full p-2 border rounded-md bg-background ${
                        errors[field.id] ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">Select an option...</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {errors[field.id] && (
                    <p className="text-sm text-destructive">{errors[field.id]}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};