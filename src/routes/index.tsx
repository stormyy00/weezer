import Landing from '@/components/home/landing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  
  return <Landing />;
}
