"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR, { mutate } from "swr"
import {
  FileText,
  Plus,
  Eye,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const API_BASE = "/api"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Submission {
  id: string
  createdAt: string
  data: Record<string, unknown>
}

interface PaginatedSubmissions {
  success: boolean
  page: number
  limit: number
  total: number
  totalPages: number
  sortBy: string
  sortOrder: "asc" | "desc"
  items: Submission[]
}

export default function SubmissionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  )
  const [viewItem, setViewItem] = useState<Submission | null>(null)

  const queryString = `page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=${sortOrder}`
  const { data, isLoading, error } = useSWR<PaginatedSubmissions>(`${API_BASE}/submissions?${queryString}`, fetcher)

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this submission?")) return

    try {
      const res = await fetch(`${API_BASE}/submissions/${id}`, { method: "DELETE" })
      if (res.ok) {
        mutate(`${API_BASE}/submissions?${queryString}`)
      }
    } catch (err) {
      console.error("Failed to delete submission", err)
    }
  }

  function exportCsv() {
    if (!data?.items?.length) return
    const header = ["id", "createdAt", "data"]
    const rows = data.items.map((item) => {
      const json = JSON.stringify(item.data).replace(/"/g, '""')
      return [item.id, item.createdAt, `"${json}"`].join(",")
    })
    const csv = [header.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `submissions_page${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading submissions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">Failed to load submissions</div>
      </div>
    )
  }

  const totalPages = data?.totalPages || 1
  const total = data?.total || 0
  const items = data?.items || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-semibold">Form Builder</span>
          </div>
          <Button onClick={() => router.push("/")}>
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
        <p className="text-muted-foreground mt-1">View and manage all form submissions</p>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Total submissions: {total}</div>
          <Button variant="outline" onClick={exportCsv} className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Table */}
        <div className="mt-4 border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">Submission ID</TableHead>
                <TableHead className="font-medium">
                  <button
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => setSortOrder((s) => (s === "asc" ? "desc" : "asc"))}
                  >
                    Created Date
                    <ArrowDown className={`h-4 w-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
                  </button>
                </TableHead>
                <TableHead className="font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.id}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setViewItem(item)} className="gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setPage(1)} disabled={page <= 1} className="h-8 w-8">
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>ID: {viewItem?.id}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {viewItem &&
              Object.entries(viewItem.data).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-sm">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
