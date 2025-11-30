"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { mutate } from "swr"
import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_BASE = "/api"

interface FieldOption {
  label: string
  value: string
}

interface FieldValidation {
  minLength?: number
  maxLength?: number
  regex?: string
  min?: number
  max?: number
  minDate?: string
  minSelected?: number
  maxSelected?: number
}

interface FormField {
  name: string
  label: string
  type: "text" | "number" | "select" | "multi-select" | "date" | "textarea" | "switch"
  placeholder: string
  required: boolean
  options?: FieldOption[]
  validations?: FieldValidation
}

interface FormSchema {
  title: string
  description: string
  fields: FormField[]
}

interface Props {
  schema: FormSchema
  onSuccess?: () => void
}

export default function DynamicForm({ schema, onSuccess }: Props) {
  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = {}
    for (const f of schema.fields) {
      switch (f.type) {
        case "multi-select":
          values[f.name] = []
          break
        case "switch":
          values[f.name] = false
          break
        default:
          values[f.name] = ""
      }
    }
    return values
  }, [schema])

  const [values, setValues] = useState<Record<string, unknown>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function setFieldValue(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  function toggleMultiSelect(name: string, optionValue: string) {
    const current = (values[name] as string[]) || []
    if (current.includes(optionValue)) {
      setFieldValue(
        name,
        current.filter((v) => v !== optionValue),
      )
    } else {
      setFieldValue(name, [...current, optionValue])
    }
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    for (const f of schema.fields) {
      const v = values[f.name]
      const required = f.required ?? false

      if (required) {
        if (f.type === "multi-select" && (!Array.isArray(v) || v.length === 0)) {
          errs[f.name] = "This field is required."
          continue
        }
        if (f.type !== "switch" && (v === undefined || v === null || v === "")) {
          errs[f.name] = "This field is required."
          continue
        }
      }

      if (v === "" || v === undefined || v === null) continue

      const rules = f.validations || {}

      if (f.type === "text" || f.type === "textarea") {
        const s = String(v)
        if (rules.minLength && s.length < rules.minLength) {
          errs[f.name] = `Minimum length is ${rules.minLength}.`
        }
        if (!errs[f.name] && rules.maxLength && s.length > rules.maxLength) {
          errs[f.name] = `Maximum length is ${rules.maxLength}.`
        }
        if (!errs[f.name] && rules.regex) {
          try {
            const re = new RegExp(rules.regex)
            if (!re.test(s)) errs[f.name] = "Invalid format."
          } catch {}
        }
      }

      if (f.type === "number") {
        const n = Number(v)
        if (Number.isNaN(n)) errs[f.name] = "Invalid number."
        if (!errs[f.name] && rules.min !== undefined && n < rules.min) {
          errs[f.name] = `Minimum is ${rules.min}.`
        }
        if (!errs[f.name] && rules.max !== undefined && n > rules.max) {
          errs[f.name] = `Maximum is ${rules.max}.`
        }
      }

      if (f.type === "multi-select") {
        const arr = Array.isArray(v) ? v : []
        if (rules.minSelected && arr.length < rules.minSelected) {
          errs[f.name] = `Select at least ${rules.minSelected}.`
        }
        if (!errs[f.name] && rules.maxSelected && arr.length > rules.maxSelected) {
          errs[f.name] = `Select at most ${rules.maxSelected}.`
        }
      }

      if (f.type === "date" && rules.minDate) {
        try {
          const sel = new Date(v as string)
          const min = new Date(rules.minDate)
          if (sel.getTime() < min.getTime()) {
            errs[f.name] = `Date must be on or after ${rules.minDate}.`
          }
        } catch {}
      }
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setSuccessMessage(null)

    const vErrs = validate()
    setErrors(vErrs)
    if (Object.keys(vErrs).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (res.status === 201) {
        setSuccessMessage("Submission successful.")
        setValues(initialValues)
        mutate((key) => typeof key === "string" && key.includes("/submissions"))
        onSuccess?.()
      } else {
        const data = await res.json()
        if (data?.errors) {
          setErrors(data.errors)
          setServerError("Please fix the highlighted errors.")
        } else {
          setServerError("Something went wrong. Please try again.")
        }
      }
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setValues(initialValues)
    setErrors({})
    setServerError(null)
    setSuccessMessage(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.fields.map((f) => {
        const val = values[f.name]

        return (
          <div key={f.name} className="space-y-2">
            <Label htmlFor={f.name} className="text-sm font-medium text-foreground">
              {f.label} {f.required && <span className="text-destructive">*</span>}
            </Label>

            {f.type === "text" && (
              <Input
                id={f.name}
                placeholder={f.placeholder}
                value={val as string}
                onChange={(e) => setFieldValue(f.name, e.target.value)}
              />
            )}

            {f.type === "number" && (
              <Input
                id={f.name}
                type="number"
                placeholder={f.placeholder}
                value={val as string}
                onChange={(e) => setFieldValue(f.name, e.target.value)}
              />
            )}

            {f.type === "textarea" && (
              <Textarea
                id={f.name}
                placeholder={f.placeholder}
                value={val as string}
                onChange={(e) => setFieldValue(f.name, e.target.value)}
                className="min-h-[100px] resize-y"
              />
            )}

            {f.type === "select" && (
              <Select value={val as string} onValueChange={(value) => setFieldValue(f.name, value)}>
                <SelectTrigger className="w-auto min-w-[200px]">
                  <SelectValue placeholder={f.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {(f.options || []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {f.type === "multi-select" && (
              <div className="border border-input rounded-md p-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {(f.options || []).map((opt) => {
                    const selected = ((val as string[]) || []).includes(opt.value)
                    return (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${f.name}-${opt.value}`}
                          checked={selected}
                          onCheckedChange={() => toggleMultiSelect(f.name, opt.value)}
                        />
                        <label htmlFor={`${f.name}-${opt.value}`} className="text-sm font-normal cursor-pointer">
                          {opt.label}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {f.type === "date" && (
              <div className="relative">
                <Input
                  id={f.name}
                  type="date"
                  placeholder={f.placeholder}
                  value={val as string}
                  onChange={(e) => setFieldValue(f.name, e.target.value)}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            )}

            {f.type === "switch" && (
              <div className="flex items-center gap-2">
                <Switch
                  id={f.name}
                  checked={val as boolean}
                  onCheckedChange={(checked) => setFieldValue(f.name, checked)}
                />
                <Label htmlFor={f.name} className="text-sm font-normal cursor-pointer">
                  {val ? "Yes" : "No"}
                </Label>
              </div>
            )}

            {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
          </div>
        )
      })}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? "Submitting..." : "Submit"}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={submitting}>
          Reset
        </Button>
      </div>
    </form>
  )
}
