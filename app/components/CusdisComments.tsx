'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../ThemeProvider'

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
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const { theme } = useTheme()

  const sendThemeToIframe = useCallback((newTheme: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          from: 'cusdis',
          event: 'setTheme',
          data: newTheme,
        }),
        '*'
      )
    }
  }, [])

  // Update theme when it changes
  useEffect(() => {
    sendThemeToIframe(theme)
  }, [theme, sendThemeToIframe])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear existing content
    container.innerHTML = ''

    // Build iframe srcdoc manually for full control
    const cssUrl = `${attrs.host}/js/style.css`
    const iframeJsUrl = `${attrs.host}/js/iframe.umd.js`

    const iframeContent = `<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="${cssUrl}">
    <base target="_parent" />
    <script>
      window.CUSDIS_LOCALE = {};
      window.__DATA__ = ${JSON.stringify({
        host: attrs.host,
        appId: attrs.appId,
        pageId: attrs.pageId,
        pageUrl: attrs.pageUrl || '',
        pageTitle: attrs.pageTitle || '',
      })};
    </script>
    <style>
      :root {
        color-scheme: light;
      }
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: transparent;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="${iframeJsUrl}" type="module"></script>
  </body>
</html>`

    // Create iframe
    const iframe = document.createElement('iframe')
    iframe.srcdoc = iframeContent
    iframe.style.width = '100%'
    iframe.style.border = '0'
    iframe.style.display = 'block'
    iframe.style.overflow = 'hidden'
    iframe.style.minHeight = '300px'
    iframe.style.colorScheme = 'normal'

    iframeRef.current = iframe

    // Listen for messages from the iframe
    const onMessage = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.from === 'cusdis') {
          if (msg.event === 'resize') {
            // Add some padding to prevent any scrollbar
            iframe.style.height = (msg.data + 20) + 'px'
          }
          if (msg.event === 'onload') {
            // Send current theme once iframe loads
            sendThemeToIframe(theme)
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    }

    window.addEventListener('message', onMessage)
    container.appendChild(iframe)

    return () => {
      window.removeEventListener('message', onMessage)
      iframeRef.current = null
      container.innerHTML = ''
    }
  }, [attrs, sendThemeToIframe, theme])

  return (
    <div>
      <h3 className="text-base font-display font-medium mb-4 text-muted-foreground">comentarios</h3>
      <div 
        ref={containerRef} 
        className="w-full"
      />
    </div>
  )
}
