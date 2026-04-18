import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: 'linear-gradient(135deg, #7c3aed 0%, #dc2626 100%)',
        borderRadius: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 72,
        fontWeight: 800,
        letterSpacing: '-2px',
      }}
    >
      ST
    </div>,
    { ...size }
  )
}
