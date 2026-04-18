import { ImageResponse } from 'next/og'

export async function GET(_: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params
  const size = parseInt(sizeParam) || 192
  const radius = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.38)

  return new ImageResponse(
    <div
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #7c3aed 0%, #dc2626 100%)',
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize,
        fontWeight: 800,
        letterSpacing: '-2px',
      }}
    >
      ST
    </div>,
    { width: size, height: size }
  )
}
