import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { UserButton } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Vérifier si l'utilisateur est propriétaire
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { isOwner: true, email: true },
  });

  if (!user?.isOwner) {
    redirect('/');
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout__sidebar">
        <DashboardNav />
      </aside>

      <main className="dashboard-layout__main">
        <header className="dashboard-layout__header">
          <div className="dashboard-layout__breadcrumbs">
            {/* Breadcrumbs seront ajoutés dynamiquement */}
          </div>
          <div className="dashboard-layout__header-actions">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="dashboard-layout__content">{children}</div>
      </main>
    </div>
  );
}
