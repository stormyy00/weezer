import { createServerFn } from "@tanstack/react-start"
import type { RawEvent } from "@/types/events"

export const getEvents = createServerFn().handler(async () => {
  const events: RawEvent[] = [
    {
      id: "ig_acm_ucr_DTb7i-8ETGI",
      source: "instagram",
      organization: "acm_ucr",
      title: "UI/UX & Design Principles Workshop",
      description: "Learn about an overview of UI/UX and design principles. Free snacks!",
      start_time: "2026-01-14T15:00:00",
      end_time: "2026-01-14T16:00:00",
      location: {
        name: "Winston Chung Hall 127",
        campus: "UCR"
      },
      tags: ["workshop", "design", "uiux", "free food"],
      media: [
        "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-15/612633806_18180753748366323_6300980935064379730_n.jpg",
        "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-15/613622968_18180753751366323_7470387773662588189_n.jpg"
      ],
      original_post: "https://instagram.com/p/DTb7i-8ETGI",
      confidence: 0.91
    },
    {
      id: "ig_acm_ucr_DTW4sTJlJCa",
      source: "instagram",
      organization: "acm_ucr",
      title: "ACM Alumni Panel",
      description: "Alumni panel featuring industry professionals from Instagram, Google, Alvandi Law Group, Sage, and Amazon.",
      start_time: null,
      end_time: null,
      location: null,
      tags: ["panel", "career", "industry", "networking"],
      media: [
        "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-15/612462451_18180589888366323_636023518819205745_n.jpg",
        "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-15/610898537_18180589897366323_4917527943884481332_n.jpg"
      ],
      original_post: "https://instagram.com/p/DTW4sTJlJCa",
      confidence: 0.55
    },
    {
      id: "ig_acm_ucr_DTTwjK-Ej2D",
      source: "instagram",
      organization: "gamespawn.ucr",
      title: "ACM x GSP Social",
      description: "Social event with video games, board games, scrapbooking, and refreshments.",
      start_time: "2026-01-12T17:00:00",
      end_time: null,
      location: {
        name: "Winston Chung Hall 127",
        campus: "UCR"
      },
      tags: ["social", "games", "collab", "hangout"],
      media: [
        "https://scontent-lax3-1.cdninstagram.com/v/t51.2885-15/610698134_18547708957053086_7570187351866176804_n.jpg"
      ],
      original_post: "https://instagram.com/p/DTTwjK-Ej2D",
      confidence: 0.88
    },
    {
      id: "ig_acm_ucr_DTMMmOYDyxy",
      source: "instagram",
      organization: "winc_ucr",
      title: "LeetCode Workshop #1",
      description: "Intro to LeetCode + Kadane's Algorithm. Free pizza provided.",
      start_time: "2026-01-08T18:30:00",
      end_time: "2026-01-08T19:30:00",
      location: {
        name: "Winston Chung 205/206",
        campus: "UCR"
      },
      tags: ["coding", "leetcode", "workshop", "free food"],
      media: [
        "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-15/610567101_18180241921366323_9020359875804148798_n.jpg",
        "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-15/611750022_18180241918366323_6377594807298154481_n.jpg"
      ],
      original_post: "https://instagram.com/p/DTMMmOYDyxy",
      confidence: 0.93
    }
  ]

  return events
})
