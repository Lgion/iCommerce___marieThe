import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const randomId = Math.random().toString(36).substring(2, 8);
  const testEmail = `test-${randomId}@example.com`;
  try {
    const testProduct = await prisma.product.create({
      data: {
        title: 'Test Product',
        description: 'A test product',
        price: 9.99,
        type: 'PHYSICAL',
        shop: {
          create: {
            name: 'Test Shop',
            owner: {
              create: {
                email: testEmail,
                password: 'test',
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, product: testProduct });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
