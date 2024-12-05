'use client'
import { useState } from 'react'
import { PlayIcon, PauseIcon } from 'lucide-react'
import { useTheme } from '../ThemeProvider'

export default function AudioPlayer({ src }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio] = useState(typeof Audio !== "undefined" ? new Audio(src) : null)
  const { theme } = useTheme()

  const togglePlay = () => {
    if (isPlaying) {
      audio?.pause()
    } else {
      audio?.play()
    }
    setIsPlaying(!isPlaying)
  }

  if (audio) {
    audio.onended = () => setIsPlaying(false)
  }

  return (
    <button
      onClick={togglePlay}
      className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full transition-colors duration-200 opacity-70 hover:opacity-100 ${
        theme === 'light' ? 'text-gray-800' : 'text-gray-200'
      }`}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        <PauseIcon size={16} />
      ) : (
        <PlayIcon size={16} />
      )}
      <span className="text-s">Audio complementar</span>
    </button>
  )
}