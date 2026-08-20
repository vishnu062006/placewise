import { cookies } from "next/headers"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ token: null }, { status: 401 })
  }

  const cookieStore = await cookies()
  // NextAuth v5 cookie name — check both, since it varies by env (secure/non-secure)
  const token =
    cookieStore.get("authjs.session-token")?.value ??
    cookieStore.get("__Secure-authjs.session-token")?.value

  return NextResponse.json({ token })
}