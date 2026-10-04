import axios from 'axios'

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

const client = axios.create()

export async function getJson<T>(path: string, query?: object): Promise<T> {
  const params: Record<string, string | number> = {}
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string' || typeof value === 'number') {
        params[key] = value
      }
    }
  }

  try {
    const response = await client.get<T>(apiUrl(path), { params })
    return response.data
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw error
    }

    throw new ApiError(error.response?.status ?? 0, readProblem(error.response?.data))
  }
}

function readProblem(data: unknown): ValidationProblemDetails | null {
  if (typeof data === 'string') {
    if (data.length === 0) {
      return null
    }

    try {
      return JSON.parse(data) as ValidationProblemDetails
    } catch {
      return null
    }
  }

  if (data !== null && typeof data === 'object') {
    return data as ValidationProblemDetails
  }

  return null
}
