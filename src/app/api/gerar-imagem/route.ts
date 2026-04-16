import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    const falKey = process.env.FAL_API_KEY
    if (!falKey) return NextResponse.json({ error: 'FAL_API_KEY não configurada' }, { status: 500 })

    const fullPrompt = `children's coloring book illustration, thick black outline only, pure white background, cute kawaii cartoon style, simple clean lines, no color fill, no shading, isolated object on white background, ${prompt}`

    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: 'square_hd',
        num_inference_steps: 4,
        num_images: 1,
      }),
    })

    const data = await res.json()
    const url = data.images?.[0]?.url ?? null

    if (!url) return NextResponse.json({ error: 'Sem imagem gerada', data }, { status: 500 })

    return NextResponse.json({ url })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
