import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import ActivityLog from '@/components/dashboard/ActivityLog';
import StatCard from '@/components/dashboard/StatCard';

export default async function DashboardHomePage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Récupérer l'utilisateur
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    return null;
  }

  // Récupérer les sessions dashboard récentes
  const sessions = await prisma.dashboardSession.findMany({
    where: { userId: user.id },
    orderBy: { loginAt: 'desc' },
    take: 20,
    include: {
      actions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  // Statistiques rapides
  const stats = {
    totalSessions: await prisma.dashboardSession.count({
      where: { userId: user.id },
    }),
    activeSessions: await prisma.dashboardSession.count({
      where: {
        userId: user.id,
        logoutAt: null,
      },
    }),
    totalActions: await prisma.dashboardAction.count({
      where: {
        session: {
          userId: user.id,
        },
      },
    }),
  };

  // Calculer la durée moyenne des sessions
  const completedSessions = sessions.filter((s) => s.duration);
  const avgDuration =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
            completedSessions.length
        )
      : 0;

  // Formater les données pour ActivityLog
  const activityItems = sessions.map((session) => {
    const duration = session.duration
      ? `${Math.floor(session.duration / 60)} min`
      : 'En cours';
    
    return {
      id: session.id,
      action: session.logoutAt ? 'Déconnexion' : 'Connexion',
      description: `Session dashboard - Durée: ${duration} - IP: ${session.ipAddress || 'N/A'}`,
      time: session.loginAt.toISOString(),
      icon: session.logoutAt ? '🚪' : '🔓',
      iconVariant: (session.logoutAt ? 'logout' : 'login') as 'login' | 'logout',
      details: session.actions.length > 0
        ? `Actions effectuées: ${session.actions.map((a) => a.action).join(', ')}`
        : undefined,
    };
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Tableau de bord
        </h1>
        <p style={{ color: 'var(--dashboardTextSecondary)', fontSize: '16px' }}>
          Bienvenue sur votre dashboard d'administration
        </p>
      </div>

      {/* Statistiques rapides */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <StatCard
          label="Sessions totales"
          value={stats.totalSessions}
          icon="📊"
          variant="bookings"
          subtitle="Depuis le début"
        />
        <StatCard
          label="Sessions actives"
          value={stats.activeSessions}
          icon="🟢"
          variant="services"
          subtitle="En ce moment"
        />
        <StatCard
          label="Actions effectuées"
          value={stats.totalActions}
          icon="⚡"
          variant="products"
          subtitle="Total des opérations"
        />
        <StatCard
          label="Durée moyenne"
          value={formatDuration(avgDuration)}
          icon="⏱️"
          variant="customers"
          subtitle="Par session"
        />
      </div>

      {/* Historique des connexions */}
      <ActivityLog
        items={activityItems}
        title="Historique des connexions au dashboard"
        variant="timeline"
      />
    </div>
  );
}
