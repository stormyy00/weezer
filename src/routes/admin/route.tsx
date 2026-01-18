import DashboardLayout from '@/components/admin/layout'
import { SearchProvider } from '@/hooks/use-search';
import { authMiddleware, isAdmin } from '@/middleware/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
   server: {
    middleware: [authMiddleware, isAdmin],
  },
})

function RouteComponent() {
  return (
    <SearchProvider>
      <DashboardLayout children={<Outlet />} />
    </SearchProvider>
  );
}
