"use client"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import DynamicForm from "@/components/dynamic-form"

const API_BASE = "/api"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function FormPage() {
  const router = useRouter()
  const { data: schema, isLoading, error } = useSWR(`${API_BASE}/form-schema`, fetcher)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading form schema...</div>
      </div>
    )
  }

  if (error || !schema) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">Failed to load form schema</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-semibold">Form Builder</span>
          </div>
          <Button variant="outline" onClick={() => router.push("/submissions")}>
            View Submissions
          </Button>
        </div>
      </header>

      {/* Form Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground">{schema.title}</h1>
        <p className="text-muted-foreground mt-2">{schema.description}</p>

        <div className="mt-8">
          <DynamicForm
            schema={schema}
            onSuccess={() => {
              router.push("/submissions")
            }}
          />
        </div>
      </main>
    </div>
  )
}
