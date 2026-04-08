'use client'

import { useRef, useEffect } from 'react'

interface VideoPlayerProps {
  src: string
  seekTo?: number | null   // 초 단위
}

export function VideoPlayer({ src, seekTo }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (seekTo !== null && seekTo !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTo
      videoRef.current.play()
    }
  }, [seekTo])

  return (
    <div className="glass-card overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full aspect-video object-contain bg-black"
      />
    </div>
  )
}
