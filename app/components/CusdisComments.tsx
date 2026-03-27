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
