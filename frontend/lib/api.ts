export async function getBackendToken(): Promise<string | null> {
    const res = await fetch("/api/auth/backend-token")
    if (!res.ok) return null
    const data = await res.json()
    return data.token
  }
  
  export async function analyzeResume(
    file: File,
    role: string,
    track: string,
    jdText?: string
  ) {
    const token = await getBackendToken()
  
    const formData = new FormData()
    formData.append("file", file)
    formData.append("role", role)
    formData.append("track", track)
    if (jdText) formData.append("jd_text", jdText)
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
  
    if (!res.ok) {
      throw new Error(`Analyze failed: ${res.status}`)
    }
  
    return res.json()
  }
  
  export async function saveCurrentResume(
    extractedData: any,
    role: string,
    track: string,
    score: number
  ): Promise<boolean> {
    const token = await getBackendToken()
    if (!token) return false
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        extracted_data: extractedData,
        role,
        track,
        score,
      }),
    })
  
    return res.ok
  }