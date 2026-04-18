import "dotenv/config";
import { PrismaClient, TaskPriority, TaskStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Seed: DATABASE_URL (or DIRECT_URL) must be set in .env.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const user = await db.user.upsert({
    where: { clerkId: "seed_user_clerk_id" },
    update: {},
    create: {
      clerkId: "seed_user_clerk_id",
      email: "seed@lifeos.local",
      name: "Seed User",
      imageUrl: null,
    },
  });

  const categoriesSeed = [
    { name: "Study", color: "#3b82f6", icon: "GraduationCap" },
    { name: "Coding", color: "#8b5cf6", icon: "Code" },
    { name: "Leisure", color: "#22c55e", icon: "Smile" },
  ];

  for (const c of categoriesSeed) {
    const existing = await db.category.findFirst({
      where: { userId: user.id, name: c.name },
    });
    if (!existing) {
      await db.category.create({
        data: {
          userId: user.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
        },
      });
    }
  }

  const existingTasks = await db.task.count({ where: { userId: user.id } });
  if (existingTasks === 0) {
    await db.task.createMany({
      data: [
        {
          userId: user.id,
          title: "Finish Prisma schema",
          description: "Design all LifeOS models and wire up relations.",
          status: TaskStatus.DOING,
          priority: TaskPriority.HIGH,
          quadrant: 1,
          estimatedMinutes: 60,
        },
        {
          userId: user.id,
          title: "Wire up sidebar navigation",
          description: "Make each sidebar link route to its feature page.",
          status: TaskStatus.TODO,
          priority: TaskPriority.MED,
          quadrant: 2,
          estimatedMinutes: 30,
        },
        {
          userId: user.id,
          title: "Plan study schedule for the week",
          description: "Blocks for each subject + review sessions.",
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          quadrant: 3,
          estimatedMinutes: 20,
        },
      ],
    });
  }

  const taskCount = await db.task.count({ where: { userId: user.id } });
  const categoryCount = await db.category.count({ where: { userId: user.id } });

  console.log(
    `Seeded user ${user.email} (${user.id}) — ${categoryCount} categories, ${taskCount} tasks.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
