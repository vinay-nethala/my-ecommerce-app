import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40);
}

async function main() {
  console.log("Starting database seed...");

  // Clear existing data
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  const productDefs = [
    { name: "Wireless Headphones", price: 199.99 },
    { name: "Smart Watch", price: 299.99 },
    { name: "4K Webcam", price: 149.99 },
    { name: "Portable Speaker", price: 79.99 },
    { name: "USB-C Hub", price: 49.99 },
    { name: "Mechanical Keyboard", price: 129.99 },
    { name: "Wireless Mouse", price: 39.99 },
    { name: "Monitor Stand", price: 59.99 },
    { name: "Laptop Stand", price: 34.99 },
    { name: "External SSD", price: 149.99 },
    { name: "USB-C Cable", price: 14.99 },
    { name: "Wireless Charger", price: 29.99 },
    { name: "LED Desk Lamp", price: 44.99 },
    { name: "Desk Organizer", price: 24.99 },
    { name: "Phone Mount", price: 19.99 },
  ];

  const products = await Promise.all(
    productDefs.map((p) => {
      const slug = slugify(p.name);
      // Use picsum.photos (stable) seeded by product name to avoid external hotlinking issues
      const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(slug)}/600/600`;
      return prisma.product.create({
        data: {
          name: p.name,
          description: `Product from our collection`,
          price: p.price,
          imageUrl,
        },
      });
    })
  );

  console.log(`Created ${products.length} products`);

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: "test.user@example.com",
      name: "Test User",
      cart: {
        create: {},
      },
    },
  });

  console.log(`Created test user: ${testUser.email}`);
  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
