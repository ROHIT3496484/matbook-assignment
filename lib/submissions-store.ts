// Shared in-memory store for submissions
export interface Submission {
  id: string
  createdAt: string
  data: Record<string, unknown>
}

class SubmissionsStore {
  private submissions: Submission[] = []

  getAll(): Submission[] {
    return [...this.submissions]
  }

  add(data: Record<string, unknown>): Submission {
    const submission: Submission = {
      id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
      data,
    }
    this.submissions.push(submission)
    return submission
  }

  findById(id: string): Submission | undefined {
    return this.submissions.find((s) => s.id === id)
  }

  delete(id: string): boolean {
    const index = this.submissions.findIndex((s) => s.id === id)
    if (index === -1) return false
    this.submissions.splice(index, 1)
    return true
  }

  count(): number {
    return this.submissions.length
  }
}

// Singleton instance
export const submissionsStore = new SubmissionsStore()
