import { type NextRequest, NextResponse } from "next/server"
import { submissionsStore } from "@/lib/submissions-store"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const deleted = submissionsStore.delete(id)

  if (!deleted) {
    return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const submission = submissionsStore.findById(id)

  if (!submission) {
    return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, submission })
}
