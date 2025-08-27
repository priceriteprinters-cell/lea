
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Share2, Download, Crown, Lock, Shield, ArrowLeft, Flame, Star, Eye } from "lucide-react"
import AgeVerification from "@/components/age-verification"
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

export default function PostPage() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [post, setPost] = useState<RSSItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  useEffect(() => {
    const storedVerification = localStorage.getItem("isAgeVerified") === "true";
    setIsVerified(storedVerification);
  }, []);

  const handleVerification = () => {
    localStorage.setItem("isAgeVerified", "true");
    setIsVerified(true);
  };

  useEffect(() => {
    if (isVerified === true && postId) {
      // In a real app, you'd fetch the specific post from your API
      // For now, we'll simulate loading the post
      const loadPost = async () => {
        try {
          // This would be replaced with actual API call
          // const response = await fetch(`/api/posts/${postId}`)
          // const postData = await response.json()

          // For demo purposes, we'll create a mock post
          const mockPost: RSSItem = {
            title: "🔥 Exclusive Content - VIP Leaked",
            description: "Premium exclusive content",
            link: "https://mega.nz/example",
            pubDate: new Date().toISOString(),
            guid: postId,
            image: "/exclusive-content.png",
            media_group_id: postId,
            text: "Exclusive leaked content available for download",
          }

          setPost(mockPost)
        } catch (err) {
          setError("Failed to load post")
        } finally {
          setLoading(false)
        }
      }

      loadPost()
    }
  }, [isVerified, postId])

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

  const handleShare = async () => {
    const postUrl = window.location.href
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  if (isVerified === null) {
    return null; // Don't render anything until verification status is known
  }
  
  if (!isVerified) {
    return <AgeVerification onVerified={handleVerification} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading exclusive content...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Post not found"}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isRecent = post.pubDate && new Date(post.pubDate) > new Date(Date.now() - 24 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent">
            Exclusive Content
          </h1>
        </div>

        {/* Post Content */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-red-900/30 shadow-2xl">
          <CardContent className="p-0">
            {/* Media */}
            {post.image && (
              <div className="relative">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <Badge className="bg-red-600 text-white font-bold text-sm px-3 py-1 flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    LEAKED
                  </Badge>
                  
                </div>
                <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-900 overflow-hidden relative group">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={stripHtml(post.title)}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-gray-300 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-400" />
                  {formatDate(post.pubDate)}
                </div>
                <button
                  onClick={handleShare}
                  className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-2 transition-colors relative"
                >
                  <Share2 className="h-4 w-4" />
                  {copiedLink ? "Copied!" : "Share"}
                  {copiedLink && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      Link copied!
                    </div>
                  )}
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-6 leading-tight">
                {stripHtml(post.title)}
              </h1>

              {/* Description */}
              {post.text && <div className="text-gray-300 text-lg leading-relaxed mb-8">{post.text}</div>}

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                {post.link && (
                  <Button
                    asChild
                    className="w-full text-black text-center font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-400 transform hover:scale-105 border-2 border-yellow-600 text-lg"
                  >
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3"
                    >
                      <Image src="https://cdn.freebiesupply.com/logos/large/2x/mega-icon-logo-png-transparent.png" alt="Mega" width={20} height={20} className="w-5 h-5"/>
                      {post.link.includes("mega.nz")
                        ? "GET MEGA"
                        : post.link.includes("drive.google.com")
                          ? "GET DRIVE"
                          : post.link.includes("mediafire.com")
                            ? "GET MEDIAFIRE"
                            : "GET MEGA"}
                    </a>
                  </Button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="text-white text-center py-3 px-4 rounded-full border-2 border-gray-600 hover:border-red-500 hover:bg-red-500/10 transition-all bg-transparent flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    How to Download
                  </Button>

                  <Button
                    asChild
                    className="text-white text-center py-3 px-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 shadow-lg hover:shadow-pink-500/30 font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <a href="https://t.me/+JCGqAfWyUtRlMGVk" target="_blank" rel="noopener noreferrer">
                      <Crown className="w-4 h-4" />
                      VIP ACCESS
                    </a>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="text-white text-center py-3 px-4 rounded-full border-2 border-green-600 hover:border-green-500 hover:bg-green-500/10 transition-all bg-transparent flex items-center justify-center gap-2"
                  >
                    <a href="https://t.me/+WxLO3q9bnxJkYTZk" target="_blank" rel="noopener noreferrer">
                      <Lock className="w-4 h-4" />
                      Ad-Free Zone
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section Placeholder */}
        <Card className="mt-8 bg-gray-900/80 border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Comments</h3>
            <p className="text-gray-400">Comments section coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
