import { auth, currentUser } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) return null;
  const role = user.publicMetadata?.role as string | undefined;
  if (role !== "admin") return null;
  return user.id;
}

export async function getAuthUser() {
  const { userId } = await auth();
  return userId;
}

export async function getFullUser() {
  return currentUser();
}
