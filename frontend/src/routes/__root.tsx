import { Outlet, createRootRoute } from '@tanstack/react-router'
import { dashboardSections } from '../features/dashboard/sections'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="flex h-full bg-canvas text-ink">
      <aside className="flex w-60 shrink-0 flex-col bg-menu text-white">
        <p className="px-5 py-6 text-lg font-semibold">Панель продаж</p>
        <nav aria-label="Блоки экрана" className="flex flex-col">
          {dashboardSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-5 py-3 text-sm font-medium text-white hover:bg-menu-hover focus-visible:bg-menu-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </aside>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
