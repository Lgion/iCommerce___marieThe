// Fabrique handler CRUD générique pour Next.js + Prisma
// Usage dans une route Next.js :
// import { createPrismaCrudHandlers } from '../_/utils/genericCrudHandlerPrisma';
// export const { GET, POST, PUT, DELETE } = createPrismaCrudHandlers('user');
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export function createPrismaCrudHandlers(modelName) {
  const model = prisma[modelName];
  return {
    async GET() {
      const items = await model.findMany();
      return NextResponse.json(items);
    },
    async POST(request) {
      const body = await request.json();
      const newItem = await model.create({ data: body });
      return NextResponse.json(newItem, { status: 201 });
    },
    async PUT(request) {
      const { id, ...data } = await request.json();
      try {
        const updated = await model.update({ where: { id }, data });
        return NextResponse.json(updated);
      } catch (e) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    },
    async DELETE(request) {
      const { id } = await request.json();
      try {
        await model.delete({ where: { id } });
        return NextResponse.json({ success: true });
      } catch (e) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }
  };
}
