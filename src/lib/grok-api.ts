const GROK_API_URL = process.env.GROK_API_URL || 'https://transition-ecology-dragon-educated.trycloudflare.com'
const GROK_API_KEY = process.env.GROK_API_KEY || ''

interface GrokImageResponse {
  created: number
  data: Array<{
    url: string
    revised_prompt: string
  }>
}

interface GrokVideoResponse {
  created: number
  data: Array<{
    url: string
    duration: number
    resolution: string
  }>
}

interface GrokModelsResponse {
  object: string
  data: Array<{
    id: string
    capabilities: string[]
  }>
}

async function grokFetch(endpoint: string, body: Record<string, unknown>, timeout = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(`${GROK_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Grok API error (${res.status}): ${errorText}`)
    }

    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function generateImage(
  prompt: string,
  options: {
    n?: number
    model?: string
    resolution?: string
    aspect_ratio?: string
  } = {}
): Promise<GrokImageResponse> {
  return grokFetch('/v1/images/generations', {
    prompt,
    n: options.n ?? 1,
    model: options.model ?? 'grok-imagine-image',
    resolution: options.resolution ?? '1k',
    aspect_ratio: options.aspect_ratio ?? '1:1',
  })
}

export async function editImage(
  prompt: string,
  imageUrl: string,
  options: {
    n?: number
    model?: string
    resolution?: string
  } = {}
): Promise<GrokImageResponse> {
  return grokFetch('/v1/images/edits', {
    prompt,
    n: options.n ?? 1,
    model: options.model ?? 'grok-imagine-image',
    resolution: options.resolution ?? '1k',
    image: { url: imageUrl },
  })
}

export async function generateVideo(
  prompt: string,
  options: {
    model?: string
    duration?: number
    resolution?: string
    aspect_ratio?: string
    imageUrl?: string
  } = {}
): Promise<GrokVideoResponse> {
  const body: Record<string, unknown> = {
    prompt,
    model: options.model ?? 'grok-imagine-video',
    duration: options.duration ?? 5,
    resolution: options.resolution ?? '480p',
    aspect_ratio: options.aspect_ratio ?? '16:9',
  }

  if (options.imageUrl) {
    body.image = { url: options.imageUrl }
  }

  // Video generation can take 15-60 seconds, set timeout to 120s
  return grokFetch('/v1/videos/generations', body, 120000)
}

export async function listModels(): Promise<GrokModelsResponse> {
  const res = await fetch(`${GROK_API_URL}/v1/models`, {
    headers: {
      'Authorization': `Bearer ${GROK_API_KEY}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Grok API error (${res.status})`)
  }

  return res.json()
}
