import React, { useMemo, useState } from 'react';
import { api } from '../api/client';
import { FormSchema, FormField } from '../types';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';

type Props = {
  schema: FormSchema;
  onSuccess?: () => void;
};

export default function DynamicForm({ schema, onSuccess }: Props) {
  const initialValues = useMemo(() => {
    const values: Record<string, any> = {};
    for (const f of schema.fields) {
      switch (f.type) {
        case 'multi-select':
          values[f.name] = [];
          break;
        case 'switch':
          values[f.name] = false;
          break;
        default:
          values[f.name] = '';
      }
    }
    return values;
  }, [schema]);

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function setFieldValue(field: FormField, v: any) {
    setValues((prev) => ({ ...prev, [field.name]: v }));
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    for (const f of schema.fields) {
      const v = values[f.name];
      const required = f.required ?? false;
      if (required) {
        if (f.type === 'multi-select' && (!Array.isArray(v) || v.length === 0)) {
          errs[f.name] = 'This field is required.';
          continue;
        }
        if ((f.type !== 'switch') && (v === undefined || v === null || v === '')) {
          errs[f.name] = 'This field is required.';
          continue;
        }
      }
      if (v === '' || v === undefined || v === null) continue;
      const rules = f.validations || {};
      if (f.type === 'text' || f.type === 'textarea') {
        const s = String(v);
        if (rules.minLength && s.length < rules.minLength) errs[f.name] = `Minimum length is ${rules.minLength}.`;
        if (!errs[f.name] && rules.maxLength && s.length > rules.maxLength) errs[f.name] = `Maximum length is ${rules.maxLength}.`;
        if (!errs[f.name] && rules.regex) {
          try {
            const re = new RegExp(rules.regex);
            if (!re.test(s)) errs[f.name] = 'Invalid format.';
          } catch {}
        }
      }
      if (f.type === 'number') {
        const n = Number(v);
        if (Number.isNaN(n)) errs[f.name] = 'Invalid number.';
        if (!errs[f.name] && rules.min !== undefined && n < rules.min) errs[f.name] = `Minimum is ${rules.min}.`;
        if (!errs[f.name] && rules.max !== undefined && n > rules.max) errs[f.name] = `Maximum is ${rules.max}.`;
      }
      if (f.type === 'multi-select') {
        const arr = Array.isArray(v) ? v : [];
        if (rules.minSelected && arr.length < rules.minSelected) errs[f.name] = `Select at least ${rules.minSelected}.`;
        if (!errs[f.name] && rules.maxSelected && arr.length > rules.maxSelected) errs[f.name] = `Select at most ${rules.maxSelected}.`;
      }
      if (f.type === 'date' && rules.minDate) {
        try {
          const sel = new Date(v);
          const min = new Date(rules.minDate);
          if (sel.getTime() < min.getTime()) errs[f.name] = `Date must be on or after ${rules.minDate}.`;
        } catch {}
      }
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);
    const vErrs = validate();
    setErrors(vErrs);
    if (Object.keys(vErrs).length > 0) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/submissions', values);
      if (res.status === 201) {
        setSuccessMessage('Submission successful.');
        setValues(initialValues);
        onSuccess?.();
      }
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
        setServerError('Please fix the highlighted errors.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setValues(initialValues);
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.fields.map((f) => {
        const rules = f.validations || {};
        const val = values[f.name];
        const showCount = (f.type === 'text' || f.type === 'textarea') && typeof val === 'string' && rules.maxLength;
        return (
          <div key={f.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={f.name}>
              {f.label} {f.required ? <span className="text-red-600">*</span> : null}
            </label>
            {f.helpText && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{f.helpText}</p>
            )}

            {f.type === 'text' && (
              <Input
                id={f.name}
                placeholder={f.placeholder}
                value={val}
                maxLength={rules.maxLength}
                onChange={(e) => setFieldValue(f, e.target.value)}
              />
            )}

            {f.type === 'number' && (
              <Input
                id={f.name}
                type="number"
                placeholder={f.placeholder}
                value={val}
                min={rules.min as any}
                max={rules.max as any}
                onChange={(e) => setFieldValue(f, e.target.value)}
              />
            )}

            {f.type === 'textarea' && (
              <Textarea
                id={f.name}
                placeholder={f.placeholder}
                value={val}
                maxLength={rules.maxLength}
                onChange={(e) => setFieldValue(f, e.target.value)}
              />
            )}

            {f.type === 'select' && (
              <Select
                id={f.name}
                value={val}
                onChange={(e) => setFieldValue(f, e.target.value)}
              >
                <option value="" disabled={false}>Select...</option>
                {(f.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            )}

            {f.type === 'multi-select' && (
              <Select
                id={f.name}
                multiple
                size={Math.min(5, (f.options || []).length || 5)}
                value={val}
                onChange={(e) => {
                  const selected = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
                  setFieldValue(f, selected);
                }}
              >
                {(f.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            )}

            {f.type === 'date' && (
              <Input
                id={f.name}
                type="date"
                value={val}
                min={rules.minDate as any}
                onChange={(e) => setFieldValue(f, e.target.value)}
              />
            )}

            {f.type === 'switch' && (
              <Switch
                label={f.label}
                checked={Boolean(val)}
                onChange={(e) => setFieldValue(f, e.currentTarget.checked)}
              />
            )}

            {showCount && (
              <div className="text-xs text-gray-500">{String(val).length} / {rules.maxLength}</div>
            )}

            {errors[f.name] && (
              <div className="text-xs text-red-600 mt-1">{errors[f.name]}</div>
            )}
          </div>
        );
      })}

      {serverError && <div className="text-sm text-red-600">{serverError}</div>}
      {successMessage && <div className="text-sm text-green-700">{successMessage}</div>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" disabled={submitting} onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
