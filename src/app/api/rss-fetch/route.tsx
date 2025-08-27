import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "RSS URL is required" }, { status: 400 })
    }

    console.log("[v0] Server-side RSS fetch for:", url)

    // Try direct fetch first (server-side bypasses CORS)
    let response: Response
    let data: string

    try {
      response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        // Add timeout
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      data = await response.text()
      console.log("[v0] Direct fetch successful, data length:", data.length)

      // Check if we got HTML instead of XML (Cloudflare protection)
      if (data.includes("<!DOCTYPE html>") || data.includes("<html")) {
        console.log("[v0] Received HTML instead of RSS, trying alternative methods")
        throw new Error("Received HTML page instead of RSS feed")
      }
    } catch (directError) {
      console.log("[v0] Direct fetch failed:", directError)

      // Fallback to RSS proxy services
      const rssProxies = [
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
        `https://rss-to-json-serverless-api.vercel.app/api?feedURL=${encodeURIComponent(url)}`,
      ]

      const proxySuccess = false

      for (const proxyUrl of rssProxies) {
        try {
          console.log("[v0] Trying RSS proxy:", proxyUrl)
          const proxyResponse = await fetch(proxyUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; RSS Reader)",
            },
            signal: AbortSignal.timeout(15000),
          })

          if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json()

            // Convert JSON response back to RSS XML format
            if (proxyData.items || proxyData.feed) {
              const rssXml = convertJsonToRss(proxyData)
              return NextResponse.json({
                success: true,
                data: rssXml,
                source: "proxy",
              })
            }
          }
        } catch (proxyError) {
          console.log("[v0] RSS proxy failed:", proxyError)
          continue
        }
      }

      if (!proxySuccess) {
        return NextResponse.json(
          {
            error: "Failed to fetch RSS feed. The feed may be protected by Cloudflare or temporarily unavailable.",
            details: directError instanceof Error ? directError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    }

    // Validate that we have XML content
    if (!data.includes("<rss") && !data.includes("<feed") && !data.includes("<?xml")) {
      return NextResponse.json(
        {
          error: "Invalid RSS feed format - not XML content",
          preview: data.substring(0, 200),
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      source: "direct",
    })
  } catch (error) {
    console.error("[v0] RSS fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch RSS feed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function convertJsonToRss(jsonData: any): string {
  const feed = jsonData.feed || jsonData
  const items = jsonData.items || []

  const rssItems = items
    .map(
      (item: any) => `
    <item>
      <title><![CDATA[${item.title || "Untitled"}]]></title>
      <description><![CDATA[${item.description || item.content || ""}]]></description>
      <link>${item.link || item.url || ""}</link>
      <pubDate>${item.pubDate || item.isoDate || new Date().toISOString()}</pubDate>
      <guid>${item.guid || item.link || Math.random().toString()}</guid>
      ${item.enclosure ? `<enclosure url="${item.enclosure.link}" type="${item.enclosure.type}" />` : ""}
    </item>
  `,
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${feed.title || "RSS Feed"}]]></title>
    <description><![CDATA[${feed.description || ""}]]></description>
    <link>${feed.link || ""}</link>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`
}
