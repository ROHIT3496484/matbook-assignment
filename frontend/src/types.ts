export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'textarea'
  | 'switch';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  regex?: string;
  min?: number;
  max?: number;
  minDate?: string;
  minSelected?: number;
  maxSelected?: number;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder: string;
  required: boolean;
  options?: FieldOption[];
  validations?: FieldValidation;
  helpText?: string; // optional helper text to guide users
}

export interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
}

export interface Submission {
  id: string;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface PaginatedSubmissions {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  items: Submission[];
}
