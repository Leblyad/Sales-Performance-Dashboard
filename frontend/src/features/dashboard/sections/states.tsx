import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type TransitionEvent } from 'react'
import { ApiError } from '../../../lib/api'

export function errorText(error: unknown) {
  if (error instanceof ApiError) {
    return `Ошибка загрузки (${error.status})`
  }

  return 'Ошибка загрузки'
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePresence(open: boolean) {
  const [present, setPresent] = useState(open)
  const [shown, setShown] = useState(open && reducedMotion())

  useEffect(() => {
    if (open) {
      setPresent(true)
      if (reducedMotion()) {
        setShown(true)
        return
      }

      let inner = 0
      const frame = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true))
      })
      return () => {
        cancelAnimationFrame(frame)
        cancelAnimationFrame(inner)
      }
    }

    if (reducedMotion()) {
      setShown(false)
      setPresent(false)
      return
    }

    setShown(false)
  }, [open])

  function onTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || open) {
      return
    }

    if (event.propertyName !== 'opacity' && event.propertyName !== 'grid-template-rows') {
      return
    }

    setPresent(false)
  }

  return { present, shown, onTransitionEnd }
}

export function BlockLoader({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4" role="status" aria-label="Загрузка">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-8 rounded-md bg-line motion-safe:animate-pulse" />
      ))}
    </div>
  )
}

type ToastItem = {
  id: number
  text: string
  leaving: boolean
}

const toastDuration = 10000
const toastLeave = 180
let nextToastId = 1
let toasts: ToastItem[] = []
const toastListeners = new Set<() => void>()
const toastTimers = new Set<number>()

function later(delay: number, action: () => void) {
  const timer = window.setTimeout(() => {
    toastTimers.delete(timer)
    action()
  }, delay)
  toastTimers.add(timer)
}

function emitToasts() {
  toastListeners.forEach((listener) => listener())
}

function subscribeToasts(listener: () => void) {
  toastListeners.add(listener)
  return () => toastListeners.delete(listener)
}

export function dismissToast(id: number) {
  const toast = toasts.find((item) => item.id === id)
  if (!toast || toast.leaving) {
    return
  }

  if (reducedMotion()) {
    toasts = toasts.filter((item) => item.id !== id)
    emitToasts()
    return
  }

  toasts = toasts.map((item) => (item.id === id ? { ...item, leaving: true } : item))
  emitToasts()
  later(toastLeave, () => {
    toasts = toasts.filter((item) => item.id !== id)
    emitToasts()
  })
}

export function pushToast(text: string) {
  const id = nextToastId
  nextToastId += 1
  toasts = [...toasts, { id, text, leaving: false }]
  emitToasts()
  later(toastDuration, () => dismissToast(id))
}

export function clearToasts() {
  for (const timer of toastTimers) {
    window.clearTimeout(timer)
  }

  toastTimers.clear()
  toasts = []
  emitToasts()
}

export function useErrorToast(active: boolean, error: unknown) {
  const reported = useRef(false)

  useEffect(() => {
    if (!active) {
      reported.current = false
      return
    }

    if (reported.current) {
      return
    }

    reported.current = true
    pushToast(errorText(error))
  }, [active, error])
}

export function ToastHost() {
  const items = useSyncExternalStore(subscribeToasts, () => toasts)

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-80 flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          role="alert"
          className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-white px-3 py-2 text-sm text-red-700 shadow-lg ${
            item.leaving ? 'toast-out' : 'toast-in'
          }`}
        >
          <p className="flex-1">{item.text}</p>
          <button
            type="button"
            aria-label="Закрыть"
            className="text-base leading-none text-ink hover:text-menu focus-visible:outline-2 focus-visible:outline-menu"
            onClick={() => dismissToast(item.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export function Collapse({
  open,
  colSpan,
  children,
}: {
  open: boolean
  colSpan: number
  children: ReactNode
}) {
  const { present, shown, onTransitionEnd } = usePresence(open)
  if (!present) {
    return null
  }

  return (
    <tr className="border-b border-line bg-white">
      <td colSpan={colSpan} className="bg-white p-0">
        <div className={`collapse-row ${shown ? 'collapse-row-open' : ''}`} onTransitionEnd={onTransitionEnd}>
          <div className="overflow-hidden">
            <div className="px-3 py-3">{children}</div>
          </div>
        </div>
      </td>
    </tr>
  )
}

export function SidePanel({ open, children }: { open: boolean; children: ReactNode }) {
  const { present, shown, onTransitionEnd } = usePresence(open)
  const last = useRef(children)
  if (children) {
    last.current = children
  }

  if (!present) {
    return null
  }

  return (
    <div className={`panel-slide ${shown ? 'panel-slide-in' : ''}`} onTransitionEnd={onTransitionEnd}>
      {open ? children : last.current}
    </div>
  )
}
