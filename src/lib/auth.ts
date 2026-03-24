import { auth, currentUser } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") return null;
  return userId;
}

export async function getAuthUser() {
  const { userId } = await auth();
  return userId;
}

export async function getFullUser() {
  return currentUser();
}
