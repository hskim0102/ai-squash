'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoUploaderProps {
  onFileSelect: (file: File) => void
}

export function VideoUploader({ onFileSelect }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('video/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileName(file.name)
    onFileSelect(file)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        className={`glass-card border-2 border-dashed cursor-pointer transition-colors p-6 md:p-10 text-center
          ${isDragging ? 'border-accent bg-accent/5' : 'border-glass-border hover:border-accent/40'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onInputChange}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <video
                src={preview}
                className="w-full max-w-xs h-28 md:h-36 object-cover rounded-lg border border-glass-border"
                muted
              />
              <p className="text-foreground/70 text-sm truncate max-w-xs">{fileName}</p>
              <p className="text-accent text-xs">클릭하여 다시 선택</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="text-5xl">🎬</div>
              <div>
                <p className="text-foreground font-medium">영상을 드래그하거나 클릭하세요</p>
                <p className="text-foreground/40 text-sm mt-1">최대 1분 클립 권장 · MP4, MOV, AVI</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
