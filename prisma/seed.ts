import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";
import {
  categories as MOCK_CATEGORIES,
  products as MOCK_PRODUCTS,
  testimonials as MOCK_TESTIMONIALS,
} from "../src/lib/mock-data";
import { siteContentDefaults } from "../src/lib/site-content-defaults";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories…");
  const cats = await Promise.all(
    MOCK_CATEGORIES.map((c, i) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, blurb: c.blurb, image: c.image, sortOrder: i },
        create: { slug: c.slug, name: c.name, blurb: c.blurb, image: c.image, sortOrder: i },
      }),
    ),
  );
  const bySlug = new Map(cats.map((c) => [c.slug, c]));

  console.log("Seeding products…");
  for (let i = 0; i < MOCK_PRODUCTS.length; i++) {
    const p = MOCK_PRODUCTS[i];
    const cat = bySlug.get(p.categorySlug);
    if (!cat) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: cat.id,
        priceKobo: p.priceKobo,
        compareAtKobo: p.compareAtKobo ?? null,
        featured: i < 8,
        rating: p.rating,
        images: {
          create: p.images.map((url, n) => ({ url, sortOrder: n, alt: p.name })),
        },
        variants: {
          create: [
            { name: "Gold", stock: 25 },
            { name: "Rose gold", stock: 18 },
            { name: "Silver", stock: 12 },
          ],
        },
      },
    });
  }

  console.log("Seeding users…");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@timisjewels.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  await ensureUser(adminEmail, adminPassword, "Timi Admin", "admin");
  const client = await ensureUser("client@timisjewels.local", "changeme123", "Demo Client", "client");
  await ensureUser("manager@timisjewels.local", "changeme123", "Demo Manager", "manager");
  await ensureUser("cashier@timisjewels.local", "changeme123", "Demo Cashier", "cashier");
  await ensureUser("storekeeper@timisjewels.local", "changeme123", "Demo Store Keeper", "storekeeper");

  console.log("Seeding site content…");
  for (const [key, value] of Object.entries(siteContentDefaults)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object },
    });
  }

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: MOCK_TESTIMONIALS.map((t, i) => ({
      name: t.name,
      location: t.location,
      quote: t.quote,
      rating: 5,
      sortOrder: i,
    })),
  });

  await prisma.announcement.deleteMany();
  await prisma.announcement.createMany({
    data: [
      "Complimentary gift on orders over ₦30,000",
      "Nationwide delivery in 2–4 days",
      "60-day sparkle guarantee",
      "Handmade with care",
    ].map((text, i) => ({ text, sortOrder: i })),
  });

  await prisma.journalPost.upsert({
    where: { slug: "how-to-layer-necklaces" },
    update: {},
    create: {
      title: "How to layer necklaces without the tangle",
      slug: "how-to-layer-necklaces",
      excerpt: "Three lengths, one rule, and the clasp trick that saves your evening.",
      status: "published",
      publishedAt: new Date(),
      contentHtml:
        "<p>Start with your shortest chain and work down in 5cm steps. Keep textures varied — a fine box chain next to a chunkier curb reads richer than two of the same.</p><h2>The clasp trick</h2><p>Hook every clasp through the last two links of the chain above it. They stay separated all night.</p>",
    },
  });
  await prisma.journalPost.upsert({
    where: { slug: "caring-for-gold-tone" },
    update: {},
    create: {
      title: "Caring for gold-tone jewelry",
      slug: "caring-for-gold-tone",
      excerpt: "A two-minute routine that keeps the shine for years.",
      status: "draft",
      contentHtml: "<p>Wipe with a soft cloth after wear. Keep away from perfume and water.</p>",
    },
  });

  console.log("Seeding sample orders & inbox…");
  const someProducts = await prisma.product.findMany({ take: 6, include: { images: true } });
  await prisma.order.deleteMany();
  for (let i = 0; i < 6; i++) {
    const p = someProducts[i % someProducts.length];
    const qty = 1 + (i % 3);
    const subtotal = p.priceKobo * qty;
    const shipping = 250000;
    await prisma.order.create({
      data: {
        reference: `TJ-SEED${1000 + i}`,
        status: (["paid", "fulfilled", "pending", "paid", "cancelled", "fulfilled"] as const)[i],
        email: i % 2 ? "client@timisjewels.local" : `buyer${i}@example.com`,
        userId: i % 2 ? client?.id : null,
        subtotalKobo: subtotal,
        shippingKobo: shipping,
        totalKobo: subtotal + shipping,
        createdAt: new Date(Date.now() - i * 4 * 86400000),
        shippingAddress: {
          fullName: `Buyer ${i}`,
          street: "12 Market Rd",
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
          phone: "09013804907",
        },
        items: {
          create: [{ productId: p.id, name: p.name, unitPriceKobo: p.priceKobo, qty }],
        },
      },
    });
  }

  await prisma.contactMessage.deleteMany();
  await prisma.contactMessage.createMany({
    data: [
      { name: "Ada", email: "ada@example.com", message: "Do you restock the Aurelia neck chain?" },
      { name: "Bola", email: "bola@example.com", message: "My order TJ-1024 hasn't arrived — can you check?", read: true },
      { name: "Chidi", email: "chidi@example.com", message: "Interested in a wholesale price list for a Lagos boutique." },
      { name: "Deola", email: "deola@example.com", message: "The rose-gold hoops are gorgeous. Thank you!" },
    ],
  });

  await prisma.newsletterSubscriber.deleteMany();
  await prisma.newsletterSubscriber.createMany({
    data: Array.from({ length: 8 }, (_, i) => ({ email: `subscriber${i + 1}@example.com` })),
  });

  console.log("Done.");
}

async function ensureUser(email: string, password: string, name: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await auth.api.signUpEmail({ body: { email, password, name } });
  }
  const user = await prisma.user.update({ where: { email }, data: { role, emailVerified: true } });
  console.log(`  ${role}: ${email}`);
  return user;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
