// Fabrique handler CRUD générique pour Next.js + localStorage
// Usage dans une route Next.js :
// import { createCrudHandlers } from '../_/utils/genericCrudHandler';
// export const { GET, POST, PUT, DELETE } = createCrudHandlers('NomDuModel');
import { NextResponse } from 'next/server';
import localStorageUtil from './localStorage';

export function createCrudHandlers(modelName) {
  const storage = localStorageUtil(modelName);
  return {
    async GET() {
      const items = await storage.getAll();
      return NextResponse.json(items);
    },
    async POST(request) {
      const body = await request.json();
      const newItem = await storage.create(body);
      return NextResponse.json(newItem, { status: 201 });
    },
    async PUT(request) {
      const { id, ...data } = await request.json();
      const updated = await storage.update(id, data);
      if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(updated);
    },
    async DELETE(request) {
      const { id } = await request.json();
      const deleted = await storage.remove(id);
      if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true });
    }
  };
}
