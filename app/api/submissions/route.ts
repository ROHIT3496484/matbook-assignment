import { type NextRequest, NextResponse } from "next/server"
import { submissionsStore } from "@/lib/submissions-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "10", 10)))
  const sortBy = searchParams.get("sortBy") || "createdAt"
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

  const submissions = submissionsStore.getAll()

  // Sort submissions
  const sorted = [...submissions].sort((a, b) => {
    if (sortBy === "createdAt") {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    }
    return 0
  })

  // Paginate
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const items = sorted.slice(start, start + limit)

  return NextResponse.json({
    success: true,
    page,
    limit,
    total,
    totalPages,
    sortBy,
    sortOrder,
    items,
  })
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Basic validation
    const errors: Record<string, string> = {}

    if (!data.fullName || typeof data.fullName !== "string" || data.fullName.length < 2) {
      errors.fullName = "Full name is required and must be at least 2 characters."
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Valid email address is required."
    }

    if (!data.phone || !/^[+]?[0-9 ()-]{7,20}$/.test(data.phone)) {
      errors.phone = "Valid phone number is required."
    }

    if (!data.age || isNaN(Number(data.age)) || Number(data.age) < 18 || Number(data.age) > 100) {
      errors.age = "Age must be between 18 and 100."
    }

    if (!data.department) {
      errors.department = "Department is required."
    }

    if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
      errors.skills = "At least one skill is required."
    }

    if (!data.startDate) {
      errors.startDate = "Start date is required."
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const submission = submissionsStore.add(data)

    return NextResponse.json(
      {
        success: true,
        id: submission.id,
        createdAt: submission.createdAt,
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body",
      },
      { status: 400 },
    )
  }
}
