import { prisma } from "@/utils/prisma";
import { getUserSession } from "@/utils/auth";

export async function getCurrentUser() {
  const session = await getUserSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, blacklisted: true },
  });

  if (!user || user.blacklisted) return null;
  return user;
}

