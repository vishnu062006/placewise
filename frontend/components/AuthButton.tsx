"use client"
import { useSession, signIn, signOut } from "next-auth/react"

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") return null

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm">{session.user?.name}</span>
        <button onClick={() => signOut()} className="text-sm underline">
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/upload" })}
      className="text-sm font-medium"
    >
      Sign in with Google
    </button>
  )
}