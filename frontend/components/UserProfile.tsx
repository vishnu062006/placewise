// components/UserProfile.tsx
import { auth } from "@/auth";
import UserProfileDropdown from "./UserProfileDropdown";

export default async function UserProfile() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <UserProfileDropdown
      name={session.user.name ?? ""}
      email={session.user.email ?? ""}
      image={session.user.image ?? ""}
    />
  );
}