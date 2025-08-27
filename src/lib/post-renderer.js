if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope)
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error)
    })
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const media = entry.target

      if (media.tagName === "IMG") {
        // Only set src if not already loading
        if (!media.src && media.dataset.src) {
          media.src = media.dataset.src
          media.onload = () => {
            media.classList.add("loaded")
            observer.unobserve(media)
          }
          media.onerror = () => {
            console.error("Failed to load image:", media.dataset.src)
            observer.unobserve(media)
          }
        }
      } else if (media.tagName === "VIDEO") {
        const video = media

        if (entry.isIntersecting) {
          // Only set src if not already loaded
          if (!video.src && video.dataset.src) {
            video.src = video.dataset.src
            video.load()

            const playVideo = () => {
              video.play().catch((error) => {
                if (error.name === "NotAllowedError") {
                  video.muted = true
                  video.play()
                }
              })
            }

            if (video.readyState >= 2) {
              playVideo()
            } else {
              video.onloadeddata = playVideo
            }
          }
        } else {
          // Unload video completely when out of view
          if (!video.paused) {
            video.pause()
          }
          video.currentTime = 0 // Reset to beginning
          video.removeAttribute("src") // Remove source
          video.load() // Clear the video element
        }
      }
    })
  },
  {
    rootMargin: "0px 0px 200px 0px",
    threshold: 0.1,
  },
)

let essentialLinksCache = null
let currentPage = 1
let isLoading = false

// Search-related variables
const currentTag = ""
const gtag = window.gtag // Declare gtag variable

// Track scroll position
let lastScrollTop = 0
const headerContainer = document.querySelector(".header-container")

let previousPosts = null // Add this at the top with other variables

let isSearchBarOpen = false // Track search bar state
const searchButton = document.getElementById("searchButton") // Declare searchButton variable

async function fetchPosts(page = 1) {
  try {
    const response = await fetch(`/posts?page=${page}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log(`[Fetch Posts] Fetched ${data.posts.length} posts for page ${page}`, data.posts)
    return data.posts
  } catch (error) {
    console.error("[Fetch Posts] Error fetching posts:", error)
    return []
  }
}
// Fetch the list of tags from the backend
function fetchTags() {
  const tags = [
    "asian",
    "ebony",
    "snowbunny",
    "lightskin",
    "latina",
    "egirl",
    "goth",
    "tatted",
    "fitness",
    "brunete",
    "blonde",
    "redhead",
    "ginger",
    "skinny",
    "thick",
    "bigass",
    "bigtits",
    "petite",
    "natural",
    "pretty",
    "prettypussy",
    "pinkpussy",
    "teen",
    "MILF",
  ]
  console.log(`[Fetch Tags] Fetched ${tags.length} tags`, tags)
  return tags
}

// Render the tags inside the search panel
function renderTags(tags) {
  const tagListContainer = document.getElementById("tagList")
  tagListContainer.innerHTML = "" // Clear any existing tags

  tags.forEach((tag) => {
    const tagElement = document.createElement("div")
    tagElement.classList.add(
      "bg-transparent", // Grey background for the tag
      "text-[#8EB945]", // Green text color
      "px-3", // Reduced horizontal padding for smaller size
      "py-1", // Reduced vertical padding for smaller size
      "rounded-full", // Rounded corners
      "cursor-pointer", // Pointer cursor on hover
      "transition", // Smooth transition on hover
      "hover:bg-green-600", // Darker green on hover
      "inline-block", // Inline-block to make them behave like buttons
      "mr-2", // Margin-right to add some space between tags
      "mb-2", // Margin-bottom to avoid sticking together
      "text-sm", // Smaller font size
    )
    tagElement.innerText = `#${tag}`

    // Add a click event to fetch posts for the selected tag
    tagElement.addEventListener("click", () => {
      fetchPostsByTag(tag)
      // Update the URL to include the active tag
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.set("tags", tag) // Set 'tag' parameter in the URL
      window.history.pushState({}, "", `${window.location.pathname}?${urlParams.toString()}`)

      document.getElementById("searchInput").value = `#${tag}` // Optionally set the search input to the clicked tag
      document.getElementById("searchPanel").classList.add("hidden") // Hide the search panel after selection
    })

    tagListContainer.appendChild(tagElement)
  })
}

async function getEssentialLinks() {
  if (essentialLinksCache) return essentialLinksCache

  try {
    const response = await fetch("/essential_links")
    if (!response.ok) throw new Error("Network response was not ok")
    essentialLinksCache = await response.json()
    return essentialLinksCache
  } catch (error) {
    console.error("Error fetching essential links:", error)
    // Only use fallback if we haven't cached anything
    if (!essentialLinksCache) {
      essentialLinksCache = {
        tutorial_link: "/essential_link?type=tutorial",
        vip_channel: "/essential_link?type=vip",
        ads_free_channel: "/essential_link?type=adsfree",
      }
    }
    return essentialLinksCache
  }
}

function createVideoModal(type) {
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"

  const vipText = `
        <span class="font-bold">👑 New VIP group available 🥳</span>

        We decided to launch a brand new exclusive group that solves all the existing problems and limitations in the main channel + many more daily content including:

        ⭐️ Ads-Free
        ⭐️ Backup system
        ⭐️ Unlimited downloads
        ⭐️ Unlimited requests
        ⭐️ Report system
        ⭐️ Cheaper prices on loaded accounts
        ⭐️ Much more daily content
        ⭐️ Exclusive chat

        All this and much more features coming soon!

        👑JOIN NOW THE BEST VIP ON TELEGRAM! 👑

        Learn more about this new service and features below 👇
    `

  const tutorialText = `
        <span class="font-bold">💬TUTORIAL: How to open links On Linkvertise and access MEGA files💬</span>

        Improved and detailed step by step guide:

        - Press the "Get Download Service" orange button.
        - Press the "I'M INTERESTED" orange button.
        - Press the "Learn more" orange button and wait a few seconds until the page loads.
        - Return to the linkvertise tab and press "I HAVE ALREADY COMPLETED THIS STEP" when it shows up, it will take a few seconds.
        - Wait for the countdown to go to 0 and then press the "Get Download Service" black button.
        - After completing the linkvertise step you will be redirected to a MEGA link, here's where all the content is located.

        Enjoy all the FREE content! 🎉
    `

  modal.innerHTML = `
        <div class="bg-gray-900 rounded-lg w-full max-w-3xl p-6 flex flex-col" style="height: 90vh;">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">
                    ${type === "tutorial" ? "How to get the MEGA link" : "👑 PREMIUM VIP 👑"}
                </h2>
                <button class="text-gray-400 hover:text-white transition-colors">
                    &times;
                </button>
            </div>
            <div class="video-container h-[70%] bg-black rounded-lg overflow-hidden">
                Loading video...
            </div>
            <div class="mt-4 h-[30%] overflow-y-auto">
                <p class="text-gray-300 whitespace-pre-line">
                    ${type === "tutorial" ? tutorialText : vipText}
                </p>
            </div>
            <div class="mt-4">
                <button class="w-full ${
                  type === "tutorial"
                    ? "bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-full border border-white hover:bg-gray-700/50 transition-all"
                    : "bg-gradient-to-r from-purple-600 to-indigo-800 border border-purple-300 shadow-lg hover:shadow-purple-500/20 font-semibold text-white py-3 rounded-full"
                }">
                    ${type === "tutorial" ? "Got it" : "Subscribe VIP"}
                </button>
            </div>
        </div>
    `

  // Close modal handler
  const closeButton = modal.querySelector("button.text-gray-400")
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      document.body.removeChild(modal)
    })
  }

  // Bottom button handler
  const bottomButton = modal.querySelector("button.w-full")
  if (bottomButton) {
    bottomButton.addEventListener("click", () => {
      if (type === "tutorial") {
        // Close the modal for the tutorial
        document.body.removeChild(modal)
      } else {
        // Redirect to VIP link
        window.location.href = essentialLinksCache.vip_channel
      }
    })
  }

  // Fetch and load video
  const videoContainer = modal.querySelector(".video-container")
  if (videoContainer) {
    const endpoint = type === "tutorial" ? "/video_tuto" : "/video_vip"

    // Create a video element
    const videoElement = document.createElement("video")
    videoElement.controls = true
    videoElement.autoplay = true
    videoElement.className = "w-full h-full object-cover"

    // Create a source element
    const sourceElement = document.createElement("source")
    sourceElement.src = endpoint
    sourceElement.type = "video/mp4" // Set the correct MIME type

    // Append source to video and video to container
    videoElement.appendChild(sourceElement)
    videoContainer.innerHTML = "" // Clear loading message
    videoContainer.appendChild(videoElement)

    // Handle errors
    videoElement.addEventListener("error", (e) => {
      console.error("Error loading video:", e)
      videoContainer.innerHTML = "<p>Failed to load video</p>"
    })
  } else {
    console.error("Video container not found in modal")
  }

  document.body.appendChild(modal)
  return modal
}

function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    console.error("[Render Posts] No posts to render")
    return
  }

  const container = document.getElementById("postContainer")
  if (!container) {
    console.error("[Render Posts] postContainer element not found")
    return
  }

  posts.forEach((post) => {
    const postElement = document.createElement("div")
    postElement.className =
      "bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-gray-600"

    // Media section
    if (post.media && Array.isArray(post.media)) {
      const mediaGrid = document.createElement("div")
      mediaGrid.className = "w-full grid grid-cols-3 gap-1"
      mediaGrid.dataset.count = post.media.length

      post.media.forEach((media) => {
        try {
          // Skip null media items
          if (!media || !media.type || !media.resolutions) {
            return
          }

          const mediaItem = document.createElement("div")
          mediaItem.className = "bg-gray-900 overflow-hidden aspect-[2/3]"

          if (media.type === "image") {
            const mediaElement = document.createElement("img")
            const screenWidth = window.innerWidth
            const resolution = screenWidth < 300 ? "150x150" : "640x360"
            const mediaUrl = `/media?file_id=${media.resolutions[resolution] || media.resolutions.original}`
            mediaElement.dataset.src = mediaUrl
            mediaElement.alt = post.text || "Post image"
            mediaElement.className = "w-full h-full object-cover object-center"
            mediaItem.appendChild(mediaElement)
            observer.observe(mediaElement)
          } else if (media.type === "video") {
            const videoElement = document.createElement("video")
            const mediaUrl = `/media?file_id=${media.resolutions.preview}`
            videoElement.dataset.src = mediaUrl
            videoElement.controls = true
            videoElement.muted = true
            videoElement.loop = true
            videoElement.preload = "none"
            videoElement.className = "w-full h-full object-cover object-center"

            // Add loading indicator
            const loadingIndicator = document.createElement("div")
            loadingIndicator.className = "absolute inset-0 flex items-center justify-center bg-black/50"
            loadingIndicator.innerHTML = "Loading..."
            videoElement.appendChild(loadingIndicator)

            // Remove loading indicator when video plays
            videoElement.onplaying = () => {
              videoElement.removeChild(loadingIndicator)
            }

            mediaItem.appendChild(videoElement)
            observer.observe(videoElement)
          }

          mediaGrid.appendChild(mediaItem)
        } catch (error) {
          console.error("Error processing media:", error)
        }
      })

      postElement.appendChild(mediaGrid)
    }

    // Post Content
    const content = document.createElement("div")
    content.className = "p-4"

    // Header Section
    const header = document.createElement("div")
    header.className = "flex items-center justify-between mb-2"

    // Left Side (Date and Recently Added)
    const leftSide = document.createElement("div")
    leftSide.className = "flex items-center gap-2"

    // Add date
    const date = document.createElement("div")
    date.className = "text-gray-400 text-sm"
    date.textContent = new Date().toISOString().split("T")[0]
    leftSide.appendChild(date)

    // Check for RE-UP or UPDATE in text
    if (post.text.includes("RE-UP") || post.text.includes("UPDATE")) {
      const recentLabel = document.createElement("div")
      recentLabel.className = "px-2 py-0.5 rounded-full text-xs font-semibold"
      recentLabel.style.backgroundColor = "#8EB945"
      recentLabel.style.color = "#1A1D22"
      recentLabel.textContent = "Recently added"
      leftSide.appendChild(recentLabel)
    }

    header.appendChild(leftSide)

    // Right Side (Share Button)
    const shareButton = document.createElement("button")
    shareButton.className = "text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
    shareButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span class="hidden sm:inline">Share</span>
        `
    shareButton.addEventListener("click", () => {
      const postUrl = `${window.location.origin}/post?post_id=${post.media_group_id}`
      navigator.clipboard
        .writeText(postUrl)
        .then(() => {
          shareButton.textContent = "Copied!"
          setTimeout(() => {
            shareButton.textContent = "Share"
          }, 2000)
        })
        .catch(() => {
          shareButton.textContent = "Failed!"
          setTimeout(() => {
            shareButton.textContent = "Share"
          }, 2000)
        })
    })
    header.appendChild(shareButton)

    content.appendChild(header)

    const text = document.createElement("div")
    text.className = "prose prose-sm prose-invert max-w-none mb-6"

    // Split the text by new lines and create separate elements
    const lines = post.text.split("\n")
    lines.forEach((line, index) => {
      const lineElement = document.createElement("p")
      lineElement.textContent = line
      text.appendChild(lineElement)

      // Add margin between lines except the last one
      if (index < lines.length - 1) {
        text.appendChild(document.createElement("br"))
      }
    })

    content.appendChild(text)

    // Buttons section
    const buttons = document.createElement("div")
    buttons.className = "flex flex-col gap-3 mt-5"

    if (post.link) {
      const linkButton = document.createElement("a")
      linkButton.href = post.link
      linkButton.className =
        "block w-auto mx-auto text-white text-center font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-[#D9272E] hover:bg-[#C01E24] transform hover:scale-105 whitespace-nowrap"

      // Determine button text based on link type
      if (post.link.includes("mega.nz")) {
        linkButton.textContent = "GET THE FREE MEGA LINK HERE"
      } else if (post.link.includes("drive.google.com")) {
        linkButton.textContent = "GET THE GOOGLE DRIVE LINK HERE"
      } else if (post.link.includes("mediafire.com")) {
        linkButton.textContent = "GET THE MEDIAFIRE LINK HERE"
      } else {
        linkButton.textContent = "GET THE DOWNLOAD LINK HERE"
      }

      linkButton.target = "_blank"
      linkButton.addEventListener("click", () => {
        // Check if gtag is available (Google Analytics)
        if (typeof gtag !== "undefined") {
          const linkLabel = post.link.includes("mega.nz")
            ? "mega"
            : post.link.includes("drive.google.com")
              ? "drive"
              : post.link.includes("mediafire.com")
                ? "mediafire"
                : "other"

          gtag("event", "download_button_click", {
            event_category: "engagement",
            event_label: linkLabel,
            link_url: post.link,
          })
        }
      })

      buttons.appendChild(linkButton)
    }

    const essentialLinksData = [
      {
        text: "How to get the MEGA link",
        url: essentialLinksCache.tutorial_link,
        className:
          "block w-auto mx-auto text-white text-center py-3 px-6 rounded-full border border-white hover:bg-gray-700 transition-all whitespace-nowrap",
      },
      {
        text: "👑 PREMIUM VIP 👑",
        url: essentialLinksCache.vip_channel,
        className:
          "block w-auto mx-auto text-white text-center py-3 px-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-800 border border-purple-300 shadow-lg hover:shadow-purple-500/20 font-semibold transition-all whitespace-nowrap",
      },
      {
        text: "Ads-FREE Channel",
        url: essentialLinksCache.ads_free_channel,
        className:
          "w-auto px-8 mx-auto text-white text-center py-3 rounded-full border border-white hover:bg-gray-700/50 transition-all",
      },
    ]

    essentialLinksData.forEach((link) => {
      const button = document.createElement("a")

      // Check if it's the tutorial or VIP button
      if (link.text.includes("How to get the MEGA link")) {
        // Tutorial button
        button.onclick = () => {
          const modal = createVideoModal("tutorial")
          document.body.appendChild(modal)
        }
      } else if (link.text.includes("PREMIUM VIP")) {
        // VIP button
        button.onclick = () => {
          const modal = createVideoModal("vip")
          document.body.appendChild(modal)
        }
      } else {
        // Regular link behavior
        button.href = link.url
        button.target = "_blank"
      }

      button.className = link.className
      button.textContent = link.text
      buttons.appendChild(button)
    })

    content.appendChild(buttons)
    postElement.appendChild(content)
    container.appendChild(postElement)
  })

  console.log("[Render Posts] Posts rendered successfully")
}

async function initialize() {
  const urlParams = new URLSearchParams(window.location.search)
  const postId = urlParams.get("post_id")
  const searchQuery = urlParams.get("query")

  // Always load essential links first
  await getEssentialLinks()

  if (postId) {
    await loadSinglePost(postId)
  } else if (window.location.pathname === "/s" && searchQuery) {
    // Handle search if we're on /s with a query
    await performSearch(searchQuery)
  } else {
    // Normal initialization
    const posts = await fetchPosts()
    renderPosts(posts)
  }
}

async function loadSinglePost(postId) {
  try {
    const response = await fetch(`/posts/${postId}`)
    if (!response.ok) throw new Error("Post not found")

    const data = await response.json()
    if (data.posts.length === 0) throw new Error("Post not found")
    renderPosts(data.posts)
  } catch (error) {
    document.getElementById("postContainer").innerHTML = `
            <div class="error-message">Post not found or failed to load</div>
        `
    console.error("Error loading post:", error)
  }
}

async function loadMorePosts() {
  if (isLoading) return // Prevent multiple simultaneous requests
  isLoading = true

  const urlParams = new URLSearchParams(window.location.search)
  const activeTag = urlParams.get("tags") // Get the active tag from the URL

  currentPage++
  if (activeTag) {
    // If there’s an active tag in the URL, fetch posts for that tag
    fetchPostsByTag(activeTag, currentPage)
  }
  const posts = await fetchPosts(currentPage)
  if (posts.length > 0) {
    renderPosts(posts)
  }

  isLoading = false
}

// Detect when the user scrolls to the bottom of the page
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    // Load more when 100px from bottom
    loadMorePosts()
  }
})

// Initialize search functionality
async function initializeSearch() {
  const searchInput = document.getElementById("searchInput")
  const searchPanel = document.getElementById("searchPanel")

  if (!searchInput || !searchButton || !searchPanel) {
    console.error("Search elements not found")
    return
  }
  const tags = fetchTags() // Fetch tags from the backend
  renderTags(tags)
  // Modify search input focus handler
  searchInput.addEventListener("focus", () => {
    console.log("Search input focused")
    searchPanel.classList.remove("hidden")

    // Clear any existing content and show message
  })

  // Handle search button click
  searchButton.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    const query = searchInput.value.trim()
    if (query) {
      console.log("Searching for:", query)

      // Store current posts before clearing
      previousPosts = Array.from(document.getElementById("postContainer").children)

      // Clear the post container
      const postContainer = document.getElementById("postContainer")
      if (postContainer) {
        postContainer.innerHTML = ""
      }

      if (query.startsWith("#")) {
        const tag = query.slice(1)
        fetchPostsByTag(tag)
      } else {
        searchPosts(query).then((posts) => renderPosts(posts))
      }

      searchPanel.classList.add("hidden")
    }
  })

  // Handle Enter key in search input
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const query = searchInput.value.trim()
      if (query) {
        // Redirect to /s with the search query
        const searchParams = new URLSearchParams()
        searchParams.set("query", query)
        window.location.href = `/s?${searchParams.toString()}`
      }
    }
  })

  // Close panel when clicking outside
  document.addEventListener("click", (e) => {
    const toggleSearchButton = document.getElementById("toggleSearchButton")
    const searchContainer = document.getElementById("searchContainer")
    if (
      !searchPanel.contains(e.target) &&
      !searchButton.contains(e.target) &&
      !searchInput.contains(e.target) &&
      (!toggleSearchButton || !toggleSearchButton.contains(e.target))
    ) {
      searchPanel.classList.add("hidden")
      if (searchContainer) {
        searchContainer.classList.add("hidden") // Hide the search bar as well
      }
    }
  })
}

// Fetch posts by tag
async function fetchPostsByTag(tag, currentPage = 1) {
  try {
    const response = await fetch(`/tag_api?t=${encodeURIComponent(tag)}&?page=${currentPage}`)
    if (!response.ok) throw new Error("Network response was not ok")
    const data = await response.json()
    console.log("Posts received:", data.posts)

    // Clear the post container before rendering new posts
    const postContainer = document.getElementById("postContainer")
    if (postContainer) {
      postContainer.innerHTML = ""
    }

    renderPosts(data.posts) // Render posts using existing function
  } catch (error) {
    console.error("Error fetching posts by tag:", error)
  }
}

// Initialize everything when the page loads
window.addEventListener("load", () => {
  console.log("Page loaded, initializing...")
  initializeSearch() // Add this line to initialize search
})

// Initial load
initialize()

// Toggle search bar on mobile
const toggleSearchButton = document.getElementById("toggleSearchButton")
const searchContainer = document.getElementById("searchContainer")
const searchInput = document.getElementById("searchInput")
const searchPanel = document.getElementById("searchPanel")

if (toggleSearchButton && searchContainer && searchInput && searchPanel) {
  toggleSearchButton.addEventListener("click", (e) => {
    e.stopPropagation()
    isSearchBarOpen = true
    history.pushState({ searchOpen: true }, "", window.location.pathname)
    searchContainer.classList.remove("hidden")
    searchContainer.classList.add("block")
    searchPanel.classList.remove("hidden")
    searchPanel.classList.add("block")
    searchInput.focus()
  })

  // Handle back button
  window.addEventListener("popstate", () => {
    if (isSearchBarOpen) {
      searchContainer.classList.remove("block")
      searchContainer.classList.add("hidden")
      searchPanel.classList.remove("block")
      searchPanel.classList.add("hidden")
      isSearchBarOpen = false
    }
  })

  // Close search bar when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !searchPanel.contains(e.target) &&
      !searchInput.contains(e.target) &&
      !searchButton.contains(e.target) &&
      !toggleSearchButton.contains(e.target)
    ) {
      searchPanel.classList.remove("block")
      searchPanel.classList.add("hidden")
      searchContainer.classList.remove("block")
      searchContainer.classList.add("hidden")
      isSearchBarOpen = false
    }
  })
}

// Track scroll position
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop

  if (scrollTop > lastScrollTop) {
    // Scrolling down: hide the header
    headerContainer.classList.add("-translate-y-full")
  } else {
    // Scrolling up: show the header
    headerContainer.classList.remove("-translate-y-full")
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop // Reset for overscroll
})

// New function for regular search
async function searchPosts(query) {
  try {
    const response = await fetch(`/search?query=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error("Network response was not ok")
    const data = await response.json()
    console.log("Search results:", data.posts)
    return data.posts
  } catch (error) {
    console.error("Error searching posts:", error)
    return []
  }
}

// Add performSearch function
async function performSearch(query) {
  try {
    const response = await fetch(`/search?query=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error("Network response was not ok")
    const data = await response.json()

    // Clear the post container
    const postContainer = document.getElementById("postContainer")
    if (postContainer) {
      postContainer.innerHTML = ""
    }

    if (data.posts && data.posts.length > 0) {
      renderPosts(data.posts)
    } else {
      // Show no results message
      postContainer.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <p class="text-lg">No posts found for "${query}"</p>
                    <p class="text-sm mt-2">Try searching with different keywords or tags</p>
                </div>
            `
    }
  } catch (error) {
    console.error("Error searching posts:", error)
    // Show error message to user
    const postContainer = document.getElementById("postContainer")
    if (postContainer) {
      postContainer.innerHTML = '<div class="text-red-500 text-center">Failed to load search results</div>'
    }
  }
}
