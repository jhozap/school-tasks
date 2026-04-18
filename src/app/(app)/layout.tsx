import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  )
}
