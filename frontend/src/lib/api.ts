export function apiUrl(path: string) {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  return `${base}${path}`
}

export type ValidationProblemDetails = {
  type: string | null
  title: string | null
  status: number | null
  detail: string | null
  instance: string | null
  errors: Record<string, string[]> | null
}

export class ApiError extends Error {
  readonly status: number
  readonly problem: ValidationProblemDetails | null

  constructor(status: number, problem: ValidationProblemDetails | null) {
    super(problem?.title ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}

export async function getJson<T>(path: string, query?: object): Promise<T> {
  const search = new URLSearchParams()
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string' || typeof value === 'number') {
        search.set(key, String(value))
      }
    }
  }

  const queryText = search.toString()
  const response = await fetch(queryText.length > 0 ? `${apiUrl(path)}?${queryText}` : apiUrl(path))
  if (!response.ok) {
    throw new ApiError(response.status, await readProblem(response))
  }

  return (await response.json()) as T
}

async function readProblem(response: Response): Promise<ValidationProblemDetails | null> {
  const text = await response.text()
  if (text.length === 0) {
    return null
  }

  try {
    return JSON.parse(text) as ValidationProblemDetails
  } catch {
    return null
  }
}
