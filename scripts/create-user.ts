import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

console.log("DATABASE_URL =", process.env.DATABASE_URL);

async function main() {
  const email = "admin@test.com";
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("Utilisateur déjà existant");
    return;
  }

  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: "Admin",
      password,
    },
  });

  console.log("Utilisateur créé :", user.email);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });