"use client"
import { useSession, signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { saveCurrentResume } from "@/lib/api"

export default function SaveResumePrompt() {
  const { data: session, status } = useSession()
  const [dismissed, setDismissed] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (session && !saved) {
      const raw = sessionStorage.getItem("placewise_result")
      if (raw) {
        const data = JSON.parse(raw)
        saveCurrentResume(
          data.extractedData,
          data.role,
          data.track,
          data.score
        ).then((ok) => {
          if (ok) setSaved(true)
        })
      }
    }
  }, [session, saved])

  if (status === "loading" || dismissed) return null

  if (session) {
    return (
      <div className="rounded-lg border p-4 text-sm text-green-600">
        {saved ? `✓ Saved to your account, ${session.user?.name}` : "Saving..."}
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium">Want to track your progress?</p>
        <p className="text-sm text-gray-500">
          Sign in to save this score and compare it next time.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => signIn("google", { callbackUrl: window.location.href })}
          className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium"
        >
          Sign in with Google
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-sm text-gray-400 underline"
        >
          Not now
        </button>
      </div>
    </div>
  )
}