export interface FormField {
  id: string;
  type: 'label' | 'text' | 'number' | 'boolean' | 'enum';
  label: string;
  labelStyle?: 'h1' | 'h2' | 'h3';
  options?: string[];
  required?: boolean;
  value?: any;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  name: string;
  sections: FormSection[];
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  templateId: string;
  data: Record<string, any>;
  submittedAt: string;
}