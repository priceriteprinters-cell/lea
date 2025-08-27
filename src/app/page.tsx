
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Calendar,
  RefreshCw,
  Upload,
  Share2,
  Download,
  Crown,
  Zap,
  Flame,
  Diamond,
  Star,
  Shield,
  Eye,
  Lock,
  X,
} from "lucide-react"
import AgeVerification from "@/components/age-verification"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  guid: string
  image?: string
  originalImage?: string
  text?: string
  media?: Array<{
    type: "image" | "video"
    url: string
    resolutions?: { [key: string]: string }
  }>
  media_group_id?: string
}

interface RSSFeed {
  title: string
  description: string
  items: RSSItem[]
}

export default function RSSReader() {
  const [isMounted, setIsMounted] = useState(false)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [rssUrl, setRssUrl] = useState("https://rsshub.app/telegram/channel/admavenpost?limit=100")
  const [feed, setFeed] = useState<RSSFeed | null>(null)
  const [progressiveItems, setProgressiveItems] = useState<RSSItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null)

  const [currentBatch, setCurrentBatch] = useState(0)
  const [hasMoreContent, setHasMoreContent] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cachedItems, setCachedItems] = useState<RSSItem[]>([])
  const [allFeedItems, setAllFeedItems] = useState<RSSItem[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const BATCH_SIZE = 12 // Posts per batch
  const MAX_RETRIES = 3

  useEffect(() => {
    setIsMounted(true)
    const storedVerification = localStorage.getItem("isAgeVerified")
    if (storedVerification) {
      setIsVerified(storedVerification === 'true')
    } else {
      setIsVerified(false)
    }
  }, [])
  
  const handleVerification = () => {
    localStorage.setItem("isAgeVerified", "true")
    setIsVerified(true)
  }
  
  const uploadImageToImgbb = async (imageUrl: string): Promise<string | null> => {
    try {
      console.log("[v0] Uploading image:", imageUrl)

      // First fetch the image data
      const imageResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(imageUrl)}`)
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch image")
      }

      const imageData = await imageResponse.json()
      const imageBlob = await fetch(imageData.contents).then((r) => r.blob())

      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          resolve(result.split(",")[1]) // Remove data:image/...;base64, prefix
        }
        reader.readAsDataURL(imageBlob)
      })

      // Upload to imgbb (using their free API)
      const formData = new FormData()
      formData.append("image", base64)

      const uploadResponse = await fetch("https://api.imgbb.com/1/upload?key=YOUR_API_KEY", {
        method: "POST",
        body: formData,
      })

      if (uploadResponse.ok) {
        const result = await uploadResponse.json()
        console.log("[v0] Image uploaded successfully:", result.data.url)
        return result.data.url
      } else {
        // Fallback to a simpler approach - use a different free service
        return await uploadToFreeImageHost(imageUrl)
      }
    } catch (error) {
      console.log("[v0] Image upload failed:", error)
      return await uploadToFreeImageHost(imageUrl)
    }
  }

  const uploadToFreeImageHost = async (imageUrl: string): Promise<string | null> => {
    try {
      // Use a simple proxy service that doesn't block Telegram images
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=400&h=300&fit=cover`

      // Test if the proxy URL works
      const testResponse = await fetch(proxyUrl, { method: "HEAD" })
      if (testResponse.ok) {
        console.log("[v0] Using proxy URL for image:", proxyUrl)
        return proxyUrl
      }

      // Another fallback - use a different proxy
      const fallbackProxy = `https://proxy.cors.sh/${imageUrl}`
      console.log("[v0] Using fallback proxy for image:", fallbackProxy)
      return fallbackProxy
    } catch (error) {
      console.log("[v0] All image proxies failed:", error)
      return null
    }
  }

  const formatTitleWithGemini = async (originalTitle: string, description: string): Promise<string> => {
    try {
      // Extract model name from title or description
      const modelNameMatch = originalTitle.match(/NAME:\s*([^<\n]+)/i) || description.match(/NAME:\s*([^<\n]+)/i)

      if (!modelNameMatch) {
        return originalTitle
      }

      const modelName = modelNameMatch[1].trim()

      // Use Gemini API to create provocative title
      const response = await fetch("/api/gemini-format", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelName,
          originalContent: description,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        return result.formattedTitle || `🔥 ${modelName} - Exclusive Content Leaked`
      }
    } catch (error) {
      console.log("[v0] Gemini API error:", error)
    }

    // Fallback formatting
    const modelNameMatch = originalTitle.match(/NAME:\s*([^<\n]+)/i) || description.match(/NAME:\s*([^<\n]+)/i)

    if (modelNameMatch) {
      const modelName = modelNameMatch[1].trim()
      const provocativeTitles = [
        `🔥 ${modelName} - Exclusive Leaked Content`,
        `💦 ${modelName} - Private Collection Exposed`,
        `🍑 ${modelName} - Hottest Leaks Available`,
        `💋 ${modelName} - Uncensored Content Leaked`,
        `🔞 ${modelName} - Premium Content Exposed`,
      ]
      return provocativeTitles[Math.floor(Math.random() * provocativeTitles.length)]
    }

    return originalTitle
  }

  const extractDownloadLinks = (description: string): string | null => {
    if (!description) return null

    // Priority order: mega.nz, fast-links.org, drive.google.com, mediafire.com
    const linkPatterns = [
      /href=["']([^"']*mega\.nz[^"']*)["']/i,
      /href=["']([^"']*fast-links\.org[^"']*)["']/i,
      /href=["']([^"']*drive\.google\.com[^"']*)["']/i,
      /href=["']([^"']*mediafire\.com[^"']*)["']/i,
      /href=["']([^"']*dropbox\.com[^"']*)["']/i,
    ]

    for (const pattern of linkPatterns) {
      const match = description.match(pattern)
      if (match && match[1]) {
        console.log("[v0] Found download link:", match[1])
        return match[1]
      }
    }

    // Fallback: look for any https link that's not an image
    const genericLinkMatch = description.match(/href=["']([^"']*https?:\/\/[^"']+)["']/i)
    if (genericLinkMatch && genericLinkMatch[1] && !genericLinkMatch[1].match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      console.log("[v0] Found generic download link:", genericLinkMatch[1])
      return genericLinkMatch[1]
    }

    return null
  }

  const fetchRSSFeed = async (url: string, isInitialLoad = true) => {
    if (isInitialLoad) {
      setLoading(true)
      setError(null)
      setUploadProgress("")
      setProgressiveItems([])
      setCachedItems([])
      setAllFeedItems([])
      setCurrentBatch(0)
      setHasMoreContent(true)
      setRetryCount(0)
    } else {
      setLoadingMore(true)
    }

    try {
      console.log("[v0] Fetching content from:", url)

      // Check cache first for non-initial loads
      if (!isInitialLoad && cachedItems.length > 0) {
        const startIndex = currentBatch * BATCH_SIZE
        const endIndex = startIndex + BATCH_SIZE
        const batchItems = cachedItems.slice(startIndex, endIndex)

        if (batchItems.length > 0) {
          console.log("[v0] Loading from cache, batch:", currentBatch, "items:", batchItems.length)
          setProgressiveItems((prev) => [...prev, ...batchItems])
          setCurrentBatch((prev) => prev + 1)
          setHasMoreContent(endIndex < cachedItems.length)
          setLoadingMore(false)
          return
        }
      }

      const response = await fetch("/api/rss-fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch content feed")
      }

      const data = result.data
      console.log("[v0] Content data received from server, length:", data.length)

      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(data, "text/xml")

      // Check for parsing errors
      const parserError = xmlDoc.querySelector("parsererror")
      if (parserError) {
        console.log("[v0] Parser error found:", parserError.textContent)
        throw new Error(`Content parsing error: ${parserError.textContent}`)
      }

      let channel = xmlDoc.querySelector("channel")
      let isAtom = false

      // Check if it's an Atom feed
      if (!channel) {
        channel = xmlDoc.querySelector("feed")
        isAtom = true
        console.log("[v0] Detected Atom feed format")
      }

      if (!channel) {
        console.log("[v0] No channel or feed element found")
        console.log("[v0] XML structure:", xmlDoc.documentElement?.tagName)
        throw new Error("Invalid content feed format - no channel or feed element found")
      }

      const title = channel.querySelector(isAtom ? "title" : "title")?.textContent || "Direct Leaks"
      const description = channel.querySelector(isAtom ? "subtitle" : "description")?.textContent || ""

      console.log("[v0] Feed title:", title)
      console.log("[v0] Feed description:", description)

      const itemSelector = isAtom ? "entry" : "item"
      const itemElements = Array.from(xmlDoc.querySelectorAll(itemSelector))

      if (isInitialLoad) {
        setFeed({ title, description, items: [] })
      }

      const allItems: RSSItem[] = []

      // Process all items for caching
      for (let index = 0; index < itemElements.length; index++) {
        const item = itemElements[index]

        if (isInitialLoad) {
          setUploadProgress(`Processing exclusive content ${index + 1} of ${itemElements.length}...`)
        }

        console.log("[v0] Processing item", index)

        const itemTitle = item.querySelector("title")?.textContent || "Untitled"

        // Handle different description/content fields
        let itemDescription = ""
        if (isAtom) {
          itemDescription =
            item.querySelector("content")?.textContent || item.querySelector("summary")?.textContent || ""
        } else {
          itemDescription =
            item.querySelector("description")?.textContent || item.querySelector("content:encoded")?.textContent || ""
        }

        // Handle different link formats
        let itemLink = ""
        if (isAtom) {
          const linkElement = item.querySelector("link")
          itemLink = linkElement?.getAttribute("href") || linkElement?.textContent || ""
        } else {
          itemLink = item.querySelector("link")?.textContent || ""
        }

        const itemPubDate =
          item.querySelector(isAtom ? "published" : "pubDate")?.textContent ||
          item.querySelector(isAtom ? "updated" : "lastBuildDate")?.textContent ||
          ""

        const itemGuid =
          item.querySelector("guid")?.textContent ||
          item.querySelector("id")?.textContent ||
          `item-${index}-${Date.now()}`

        let originalImage: string | undefined
        let hostedImage: string | undefined

        // Try to find image in enclosure
        const enclosure = item.querySelector("enclosure[type^='image']")
        if (enclosure) {
          originalImage = enclosure.getAttribute("url") || undefined
        }

        // Try to find image in media:content
        if (!originalImage) {
          const mediaContent = item.querySelector("media\\:content, content")
          if (mediaContent && mediaContent.getAttribute("type")?.startsWith("image")) {
            originalImage = mediaContent.getAttribute("url") || undefined
          }
        }

        // Extract image from description/content HTML
        if (!originalImage && itemDescription) {
          const imgMatch = itemDescription.match(/<img[^>]+src=["']([^"']+)["']/i)
          originalImage = imgMatch ? imgMatch[1] : undefined
        }

        if (originalImage) {
          if (isInitialLoad) {
            setUploadProgress(`Processing media for item ${index + 1}...`)
          }
          hostedImage = await uploadToFreeImageHost(originalImage)
        }

        console.log("[v0] Item processed:", {
          title: itemTitle,
          hasOriginalImage: !!originalImage,
          hasHostedImage: !!hostedImage,
          link: itemLink,
        })

        const mediaItems: Array<{ type: "image" | "video"; url: string; resolutions?: { [key: string]: string } }> = []

        // Extract all images from description HTML
        if (itemDescription) {
          const imgMatches = itemDescription.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
          for (const match of imgMatches) {
            const imageUrl = match[1]
            if (imageUrl) {
              const hostedUrl = await uploadToFreeImageHost(imageUrl)
              mediaItems.push({
                type: "image",
                url: hostedUrl || imageUrl,
                resolutions: {
                  original: imageUrl,
                  "640x360": hostedUrl || imageUrl,
                },
              })
            }
          }
        }

        const formattedTitle = await formatTitleWithGemini(itemTitle, itemDescription)
        const downloadLink = extractDownloadLinks(itemDescription)

        const processedItem: RSSItem = {
          title: formattedTitle,
          description: itemDescription,
          link: downloadLink || itemLink,
          pubDate: itemPubDate,
          guid: itemGuid,
          image: hostedImage || originalImage,
          originalImage,
          text: stripHtml(itemDescription),
          media: mediaItems.length > 0 ? mediaItems : undefined,
          media_group_id: itemGuid,
        }

        allItems.push(processedItem)

        // For initial load, show first batch progressively
        if (isInitialLoad && index < BATCH_SIZE) {
          setProgressiveItems((prev) => [...prev, processedItem])
        }
      }

      console.log("[v0] Total items parsed:", allItems.length)

      // Cache all items and set up pagination
      setCachedItems(allItems)
      setAllFeedItems(allItems)

      if (isInitialLoad) {
        setFeed({ title, description, items: allItems })
        setCurrentBatch(1) // First batch already loaded
        setHasMoreContent(allItems.length > BATCH_SIZE)
      } else {
        // Load next batch from newly cached items
        const startIndex = currentBatch * BATCH_SIZE
        const endIndex = startIndex + BATCH_SIZE
        const batchItems = allItems.slice(startIndex, endIndex)

        if (batchItems.length > 0) {
          setProgressiveItems((prev) => [...prev, ...batchItems])
          setCurrentBatch((prev) => prev + 1)
          setHasMoreContent(endIndex < allItems.length)
        } else {
          setHasMoreContent(false)
        }
      }

      setUploadProgress("")
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error("[v0] Content fetch error:", err)

      // Implement retry mechanism
      if (retryCount < MAX_RETRIES) {
        console.log(`[v0] Retrying... Attempt ${retryCount + 1}/${MAX_RETRIES}`)
        setRetryCount((prev) => prev + 1)
        setTimeout(
          () => {
            fetchRSSFeed(url, isInitialLoad)
          },
          2000 * (retryCount + 1),
        ) // Exponential backoff
        return
      }

      setError(err instanceof Error ? err.message : "An error occurred while fetching the exclusive content")
      setUploadProgress("")
      setHasMoreContent(false)
    } finally {
      if (isInitialLoad) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  const loadMoreContent = useCallback(() => {
    if (!loadingMore && hasMoreContent && cachedItems.length > 0) {
      console.log("[v0] Loading more content, batch:", currentBatch)
      fetchRSSFeed(rssUrl, false)
    }
  }, [loadingMore, hasMoreContent, cachedItems.length, currentBatch, rssUrl])

  useEffect(() => {
    if (loadingRef.current && hasMoreContent) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && !loadingMore && !loading) {
            console.log("[v0] Intersection detected, loading more content")
            loadMoreContent()
          }
        },
        {
          rootMargin: "100px", // Start loading 100px before reaching the bottom
          threshold: 0.1,
        },
      )

      observerRef.current.observe(loadingRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMoreContent, hasMoreContent, loadingMore, loading])

  useEffect(() => {
    if (isVerified === true && rssUrl) {
      fetchRSSFeed(rssUrl)
    }
  }, [isVerified, rssUrl])

  const handleLoadFeed = () => {
    if (rssUrl.trim()) {
      fetchRSSFeed(rssUrl.trim())
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const stripHtml = (html: string) => {
    if (typeof document === 'undefined') return html;
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const renderAdvancedPost = (item: RSSItem, index: number) => {
    return (
      <div
        key={item.guid || index}
        className="bg-card rounded-2xl overflow-hidden border border-red-900/30 shadow-2xl hover:shadow-red-500/20 transition-all hover:border-red-500/50 hover:scale-[1.02] w-full"
      >
        {/* Media Grid */}
        {item.media && item.media.length > 0 && (
          <div className="w-full relative">
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              <Badge className="bg-red-600 text-white font-bold text-[10px] sm:text-xs px-2 py-1 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                LEAKED
              </Badge>
            </div>
            <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-900 overflow-hidden relative group">
              <img
                src={item.media[0]?.url || "/placeholder.svg"}
                alt={stripHtml(item.title)}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (item.media?.[0]?.resolutions?.original && target.src !== item.media[0].resolutions.original) {
                    target.src = item.media[0].resolutions.original
                  } else {
                    target.style.display = "none"
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-2 mb-3 sm:mb-4">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-xs sm:text-sm flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                {formatDate(item.pubDate)}
              </div>
              <button
                className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors relative"
                onClick={async () => {
                  const postUrl = `${window.location.origin}/post/${item.media_group_id}`
                  try {
                    await navigator.clipboard.writeText(postUrl)
                    setCopiedPostId(item.media_group_id || "")

                    setTimeout(() => {
                      setCopiedPostId(null)
                    }, 2000)

                    setTimeout(() => {
                      window.open(postUrl, "_blank")
                    }, 500)
                  } catch (err) {
                    console.error("Failed to copy link:", err)
                    window.open(postUrl, "_blank")
                  }
                }}
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{copiedPostId === item.media_group_id ? "Copied!" : "Share"}</span>
                {copiedPostId === item.media_group_id && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Link copied!
                  </div>
                )}
              </button>
            </div>

          </div>

          <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight line-clamp-2">
            {stripHtml(item.title)}
          </h3>

          <div className="flex flex-col gap-2 sm:gap-3">
            {item.link && (
              <Button
                asChild
                className="w-full text-black text-center font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-400 transform hover:scale-105 border-2 border-yellow-600 text-xs sm:text-sm"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Image src="https://cdn.freebiesupply.com/logos/large/2x/mega-icon-logo-png-transparent.png" alt="Mega" width={16} height={16} className="w-3 h-3 sm:w-4 sm:h-4"/>
                  {item.link.includes("mega.nz")
                    ? "GET MEGA"
                    : item.link.includes("drive.google.com")
                      ? "GET DRIVE"
                      : item.link.includes("mediafire.com")
                        ? "GET MEDIAFIRE"
                        : "GET MEGA"}
                </a>
              </Button>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTutorialModal(true)}
                className="flex-1 text-white text-center py-2 sm:py-3 px-2 sm:px-4 rounded-full border-2 border-gray-600 hover:border-red-500 hover:bg-red-500/10 transition-all bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-[10px] sm:text-xs flex items-center justify-center gap-1"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:w-4" />
                <span className="truncate">How to Download</span>
              </Button>

              <Button
                asChild
                className="flex-1 text-white text-center py-2 sm:py-3 px-2 sm:px-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 shadow-lg hover:shadow-pink-500/30 font-semibold transition-all text-[10px] sm:text-xs flex items-center justify-center gap-1"
              >
                <a href="https.t.me/+JCGqAfWyUtRlMGVk" target="_blank" rel="noopener noreferrer">
                  <Crown className="w-3 h-3 sm:w-4 sm:w-4" />
                  <span className="truncate">VIP ACCESS</span>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex-1 text-white text-center py-2 sm:py-3 px-2 sm:px-4 rounded-full border-2 border-green-600 hover:border-green-500 hover:bg-green-500/10 transition-all bg-gradient-to-r from-teal-400 to-yellow-200 font-semibold text-[10px] sm:text-xs flex items-center justify-center gap-1"
              >
                <a href="https.t.me/+WxLO3q9bnxJkYTZk" target="_blank" rel="noopener noreferrer">
                  <Lock className="w-3 h-3 sm:w-4 sm:w-4" />
                  <span className="truncate">Ad-Free Zone</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isMounted || isVerified === null) {
    return null;
  }
  
  if (!isVerified) {
    return <AgeVerification onVerified={handleVerification} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                <Flame className="w-10 h-10 sm:w-16 sm:h-16 text-red-500" />
                DIRECT LEAKS
            </h1>
            <ThemeToggle />
        </div>
        <div className="text-center mb-8 sm:mb-12">
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-medium px-4">
            Premium Content • Exclusive Access • Latest Leaks
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
            <Badge className="bg-red-600 text-white px-4 py-2 text-sm font-bold flex items-center justify-center gap-1">
              <Shield className="w-4 h-4" />
              18+ ONLY
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-bold flex items-center justify-center gap-1">
              <Diamond className="w-4 h-4" />
              PREMIUM CONTENT
            </Badge>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 bg-destructive/10 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive-foreground">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-destructive-foreground/80 text-sm mt-2">
                Please check the content feed URL and try again. Make sure the feed is accessible and properly
                formatted.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && progressiveItems.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <span className="ml-2 text-muted-foreground">Loading exclusive content...</span>
          </div>
        )}

        {/* Feed Content - Progressive Display with Infinite Scroll */}
        {(feed || progressiveItems.length > 0) && (
          <div>
            {/* Feed Items - Progressive Display */}
            {progressiveItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {progressiveItems.map((item, index) =>
                    item.media && item.media.length > 0 ? (
                      renderAdvancedPost(item, index)
                    ) : (
                      <Card
                        key={item.guid || index}
                        className="bg-card border-border hover:bg-muted/50 transition-colors w-full"
                      >
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                          <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Image */}
                            {item.image && (
                              <div className="w-full h-40 sm:h-48 lg:h-56 flex-shrink-0 overflow-hidden rounded-lg">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={stripHtml(item.title)}
                                  className="w-full h-full object-cover bg-muted"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    if (item.originalImage && target.src !== item.originalImage) {
                                      target.src = item.originalImage
                                    } else {
                                      target.style.display = "none"
                                    }
                                  }}
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1">
                              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-2 sm:mb-3 line-clamp-2 leading-tight">
                                {stripHtml(item.title)}
                              </h3>

                              <div className="flex flex-col gap-2 text-xs sm:text-sm text-muted-foreground">
                                {item.pubDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:w-4" />
                                    <span className="truncate">{formatDate(item.pubDate)}</span>
                                  </div>
                                )}

                                {item.link && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="border-border text-foreground hover:bg-accent bg-transparent w-full text-xs py-2"
                                  >
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1"
                                    >
                                      <Image src="https://cdn.freebiesupply.com/logos/large/2x/mega-icon-logo-png-transparent.png" alt="Mega" width={16} height={16} className="w-3 h-3 sm:w-4 sm:h-4"/>
                                      <span className="truncate">
                                        {item.link.includes("mega.nz")
                                          ? "Get Mega"
                                          : item.link.includes("drive.google.com")
                                            ? "Get Drive"
                                            : item.link.includes("mediafire.com")
                                              ? "Get MediaFire"
                                              : "GET MEGA"}
                                      </span>
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>

                {hasMoreContent && (
                  <div ref={loadingRef} className="flex justify-center items-center py-8 mt-8">
                    {loadingMore ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                        <span className="text-muted-foreground font-medium">Loading more exclusive content...</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">Scroll down for more content</div>
                    )}
                  </div>
                )}

                {!hasMoreContent && progressiveItems.length > 0 && (
                  <div className="flex justify-center items-center py-8 mt-8">
                    <div className="text-center">
                      <div className="text-muted-foreground font-medium mb-2">🔥 You've seen all exclusive content!</div>
                      <div className="text-muted-foreground/80 text-sm">Check back later for new leaks</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              !loading && (
                <Card className="bg-card border-border">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      {error
                        ? "Unable to load posts at this time. Please try again later."
                        : "No exclusive content found in this feed."}
                    </p>
                    {error && retryCount < MAX_RETRIES && (
                      <Button onClick={() => handleLoadFeed()} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry Loading
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </div>

      {/* Tutorial Video Modal */}
      {showTutorialModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-500" />
                How to Download Tutorial
              </h2>
              <button
                onClick={() => setShowTutorialModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="flex-1 p-6">
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <video controls autoPlay className="w-full h-full" poster="/video-tutorial-thumbnail.png">
                  <source src="https://megaleakz.net/images/tutorial.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border">
              <div className="text-muted-foreground text-sm mb-4">
                <p className="font-semibold mb-2 text-foreground">📋 Quick Steps:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Click the "GET MEGA" button on any post</li>
                  <li>Complete the verification steps if required</li>
                  <li>Access your exclusive content download</li>
                  <li>Enjoy premium leaked content!</li>
                </ul>
              </div>
              <Button
                onClick={() => setShowTutorialModal(false)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-full"
              >
                Got It!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
