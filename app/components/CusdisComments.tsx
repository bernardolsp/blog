'use client'

import { useEffect, useRef } from 'react'

interface CusdisCommentsProps {
  attrs: {
    host: string
    appId: string
    pageId: string
    pageTitle?: string
    pageUrl?: string
  }
}

export default function CusdisComments({ attrs }: CusdisCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear existing content
    container.innerHTML = ''

    // Create the Cusdis thread div with proper styling
    const threadDiv = document.createElement('div')
    threadDiv.id = 'cusdis_thread'
    threadDiv.setAttribute('data-host', attrs.host)
    threadDiv.setAttribute('data-app-id', attrs.appId)
    threadDiv.setAttribute('data-page-id', attrs.pageId)
    threadDiv.setAttribute('data-page-url', attrs.pageUrl || '')
    threadDiv.setAttribute('data-page-title', attrs.pageTitle || '')
    
    // Custom CSS to match site design
    const customCss = `
      .cusdis-thread {
        font-family: var(--font-body), Georgia, serif !important;
      }
      .cusdis-thread * {
        font-family: var(--font-body), Georgia, serif !important;
      }
      .cusdis-textarea {
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 0.5rem !important;
        background: hsl(var(--background)) !important;
        color: hsl(var(--foreground)) !important;
        font-size: 1rem !important;
        resize: vertical !important;
      }
      .cusdis-textarea:focus {
        outline: none !important;
        border-color: hsl(var(--accent)) !important;
      }
      .cusdis-btn {
        background: hsl(var(--foreground)) !important;
        color: hsl(var(--background)) !important;
        border-radius: 0.5rem !important;
        font-weight: 500 !important;
        padding: 0.5rem 1rem !important;
      }
      .cusdis-btn:hover {
        opacity: 0.9 !important;
      }
      .cusdis-comment-content {
        line-height: 1.8 !important;
      }
      .cusdis-comment-author {
        font-family: var(--font-display), Georgia, serif !important;
        font-weight: 500 !important;
      }
    `
    threadDiv.setAttribute('data-css', customCss)
    
    container.appendChild(threadDiv)

    // Load the Cusdis script
    const script = document.createElement('script')
    script.src = `${attrs.host}/js/cusdis.es.js`
    script.async = true
    script.defer = true
    
    container.appendChild(script)
    scriptRef.current = script

    return () => {
      // Cleanup
      if (scriptRef.current && container.contains(scriptRef.current)) {
        container.removeChild(scriptRef.current)
      }
      if (container.contains(threadDiv)) {
        container.removeChild(threadDiv)
      }
    }
  }, [attrs])

  return (
    <div>
      <h3 className="text-base font-display font-medium mb-4 text-muted-foreground">comentários</h3>
      <div 
        ref={containerRef} 
        className="min-h-[300px]" 
        style={{ minHeight: '300px' }}
      />
    </div>
  )
}
