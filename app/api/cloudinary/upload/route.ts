import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import cloudinaryService from '@/lib/cloudinaryService';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string; // 'products', 'services', 'service-details'
    const entityId = formData.get('entityId') as string | null;
    const tenantId = formData.get('tenantId') as string || userId;

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
    }

    if (!entityType) {
      return NextResponse.json({ error: 'Type d\'entité requis' }, { status: 400 });
    }

    // Convertir File en buffer pour Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Générer folder et publicId
    const folder = cloudinaryService.getFolderPath(entityType, tenantId);
    const publicId = cloudinaryService.generatePublicId(entityType, tenantId, entityId);

    // Upload vers Cloudinary
    const result = await cloudinaryService.uploadFile(base64File, {
      folder,
      publicId,
      tags: [entityType, tenantId, entityId].filter(Boolean)
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    }, { status: 200 });

  } catch (error) {
    console.error('[API][cloudinary][upload] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}
