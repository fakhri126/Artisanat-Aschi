const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { name: 'Miroir Jasmin' },
    include: { images: true }
  });
  console.log(JSON.stringify(product?.images, null, 2));
}

main().finally(() => prisma.$disconnect());
