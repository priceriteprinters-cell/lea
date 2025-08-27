import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { modelName, originalContent } = await request.json()

    // Mock Gemini API response for now - replace with actual Gemini API call
    const provocativeTitles = [
      `🔥 ${modelName} - Exclusive Leaked Content`,
      `💦 ${modelName} - Private Collection Exposed`,
      `🍑 ${modelName} - Hottest Leaks Available`,
      `💋 ${modelName} - Uncensored Content Leaked`,
      `🔞 ${modelName} - Premium Content Exposed`,
      `✨ ${modelName} - Secret Files Revealed`,
      `💎 ${modelName} - VIP Content Leaked`,
      `🌶️ ${modelName} - Spicy Content Dropped`,
    ]

    const formattedTitle = provocativeTitles[Math.floor(Math.random() * provocativeTitles.length)]

    return NextResponse.json({ formattedTitle })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json({ error: "Failed to format title" }, { status: 500 })
  }
}
