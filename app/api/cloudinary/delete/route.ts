import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import cloudinaryService from '@/lib/cloudinaryService';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { publicId, resourceType } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'publicId requis' }, { status: 400 });
    }

    // Vérifier que le publicId appartient bien au tenant (sécurité)
    if (!publicId.includes(userId) && !publicId.includes('default')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const result = await cloudinaryService.deleteFile(publicId, resourceType || 'image');

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    }, { status: 200 });

  } catch (error) {
    console.error('[API][cloudinary][delete] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
