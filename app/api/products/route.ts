import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const defaultProductInclude = {
  variations: {
    include: {
      options: true
    }
  },
  shop: {
    select: {
      id: true,
      name: true
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const digital = searchParams.get('digital');
    const productId = searchParams.get('id');

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: defaultProductInclude
      });

      if (!product) {
        return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    const whereClause: Record<string, unknown> = {};

    if (digital === 'true') {
      whereClause.digitalFile = { not: null };
    } else if (digital === 'false') {
      whereClause.digitalFile = null;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: defaultProductInclude,
      orderBy: { title: 'asc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[API][products][GET] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const {
      title,
      description,
      price,
      imageUrl,
      imagePublicId,
      imageFolder,
      digitalFile,
      shopId,
      variations = []
    } = payload ?? {};

    if (!title || !description || typeof price !== 'number' || !shopId) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const createdProduct = await prisma.product.create({
      data: {
        title,
        description,
        price,
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
        imageFolder: imageFolder || null,
        digitalFile: digitalFile || null,
        shop: {
          connect: { id: shopId }
        },
        variations: {
          create: variations
            .filter((variation: any) => variation?.name)
            .map((variation: any) => ({
              name: variation.name,
              options: {
                create: (variation.options || [])
                  .filter((option: any) => option?.value)
                  .map((option: any) => ({ value: option.value }))
              }
            }))
        }
      },
      include: defaultProductInclude
    });

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    console.error('[API][products][POST] Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();
    const {
      id,
      title,
      description,
      price,
      imageUrl,
      imagePublicId,
      imageFolder,
      digitalFile,
      shopId,
      variations = []
    } = payload ?? {};

    if (!id) {
      return NextResponse.json({ error: 'Identifiant requis' }, { status: 400 });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.product.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
          ...(typeof price === 'number' ? { price } : {}),
          imageUrl: imageUrl || null,
          imagePublicId: imagePublicId || null,
          imageFolder: imageFolder || null,
          digitalFile: digitalFile || null,
          ...(shopId ? { shop: { connect: { id: shopId } } } : {})
        }
      });

      const existingVariations = await transaction.variation.findMany({
        where: { productId: id },
        select: { id: true }
      });

      if (existingVariations.length > 0) {
        await transaction.variationOption.deleteMany({
          where: {
            variationId: {
              in: existingVariations.map((variation) => variation.id)
            }
          }
        });

        await transaction.variation.deleteMany({ where: { productId: id } });
      }

      if (variations.length > 0) {
        for (const variation of variations) {
          const createdVariation = await transaction.variation.create({
            data: {
              name: variation.name,
              productId: id
            }
          });

          const options = (variation.options || []).filter((option: any) => option?.value);
          if (options.length > 0) {
            await transaction.variationOption.createMany({
              data: options.map((option: any) => ({
                value: option.value,
                variationId: createdVariation.id
              }))
            });
          }
        }
      }
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: defaultProductInclude
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[API][products][PUT] Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Identifiant requis' }, { status: 400 });
    }

    await prisma.$transaction(async (transaction) => {
      const relatedVariations = await transaction.variation.findMany({
        where: { productId: id },
        select: { id: true }
      });

      if (relatedVariations.length > 0) {
        await transaction.variationOption.deleteMany({
          where: {
            variationId: {
              in: relatedVariations.map((variation) => variation.id)
            }
          }
        });

        await transaction.variation.deleteMany({ where: { productId: id } });
      }

      await transaction.orderItem.deleteMany({ where: { productId: id } });

      await transaction.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API][products][DELETE] Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 });
  }
}
