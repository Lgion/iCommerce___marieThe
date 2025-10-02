import prisma from '@/lib/prisma';
import ServicesPageClient from '@/components/___ServicesPageClient';
import '@/assets/scss/components/BOOKING/booking-calendar.scss';
import '@/assets/scss/components/PAGES/___services-page_.scss';
import '@/assets/scss/components/ADMIN/admin-panel.scss';

export default async function ServicesPage() {
  const slots = await prisma.serviceSlot.findMany({
    where: { isBooked: false },
    include: {
      product: {
        select: {
          title: true,
          price: true
        }
      }
    },
    orderBy: { startTime: 'asc' }
  });

  return <ServicesPageClient initialSlots={slots} />;
}
