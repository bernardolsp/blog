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

// Custom CSS injected into the Cusdis iframe to match the blog's aesthetic.
// Light mode uses warm off-white tones; dark mode uses warm dark browns.
// Loads Playfair Display + Source Serif 4 via Google Fonts (CSP updated to allow).
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Serif+4:wght@300;400;500;600&display=swap');

  :root, html {
    color-scheme: light !important;
  }

  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: transparent !important;
    color-scheme: light !important;
  }

  /* ---- Light mode ---- */
  body {
    font-family: 'Source Serif 4', Georgia, serif !important;
    color: hsl(30 10% 15%) !important;
  }

  /* Labels */
  body .font-bold,
  body .font-medium,
  body label {
    font-family: 'Source Serif 4', Georgia, serif !important;
    font-weight: 500 !important;
    color: hsl(30 8% 45%) !important;
    font-size: 0.875rem !important;
  }

  /* Inputs (nickname, email) */
  body input[type="text"],
  body input[type="email"],
  body input {
    background: hsl(40 20% 96%) !important;
    border: 1px solid hsl(35 15% 85%) !important;
    border-radius: 0.375rem !important;
    color: hsl(30 10% 15%) !important;
    font-family: 'Source Serif 4', Georgia, serif !important;
    padding: 0.5rem 0.75rem !important;
    font-size: 0.9rem !important;
    transition: border-color 0.2s ease !important;
    outline: none !important;
  }
  body input:focus {
    border-color: hsl(35 80% 55%) !important;
  }

  /* Textarea */
  body textarea {
    background: hsl(40 20% 96%) !important;
    border: 1px solid hsl(35 15% 85%) !important;
    border-radius: 0.375rem !important;
    color: hsl(30 10% 15%) !important;
    font-family: 'Source Serif 4', Georgia, serif !important;
    padding: 0.75rem !important;
    font-size: 0.9rem !important;
    resize: vertical !important;
    transition: border-color 0.2s ease !important;
    outline: none !important;
    min-height: 5rem !important;
  }
  body textarea:focus {
    border-color: hsl(35 80% 55%) !important;
  }

  /* Submit button */
  body button,
  body .bg-blue-500 {
    background: hsl(30 10% 15%) !important;
    color: hsl(40 20% 98%) !important;
    border: none !important;
    border-radius: 0.375rem !important;
    font-family: 'Source Serif 4', Georgia, serif !important;
    font-weight: 500 !important;
    padding: 0.5rem 1.25rem !important;
    font-size: 0.875rem !important;
    cursor: pointer !important;
    transition: opacity 0.2s ease !important;
  }
  body button:hover,
  body .bg-blue-500:hover {
    opacity: 0.85 !important;
  }

  /* Comment author name */
  body .font-bold {
    font-family: 'Playfair Display', Georgia, serif !important;
    font-weight: 600 !important;
    color: hsl(30 10% 15%) !important;
    font-size: 0.9rem !important;
  }

  /* Comment date */
  body .text-gray-500 {
    color: hsl(30 8% 45%) !important;
    font-size: 0.8rem !important;
  }

  /* Comment text */
  body .text-gray-900 {
    color: hsl(30 10% 20%) !important;
    line-height: 1.7 !important;
  }

  /* Reply link */
  body .underline {
    color: hsl(35 80% 55%) !important;
    text-decoration: none !important;
    font-size: 0.8rem !important;
    font-weight: 500 !important;
    transition: opacity 0.2s ease !important;
  }
  body .underline:hover {
    opacity: 0.75 !important;
  }

  /* Borders - comment separators */
  body .border-gray-200 {
    border-color: hsl(35 15% 88%) !important;
  }

  /* Nested reply indicator */
  body .border-l-2 {
    border-color: hsl(35 80% 55%) !important;
  }

  /* "Powered by Cusdis" footer */
  body .text-center {
    color: hsl(30 8% 65%) !important;
    font-size: 0.75rem !important;
  }
  body .text-center a {
    color: hsl(30 8% 45%) !important;
  }

  /* Grid gap tweaks */
  body .gap-4 {
    gap: 0.75rem !important;
  }

  /* ---- Dark mode ---- */
  .dark body,
  body.dark {
    color: hsl(40 15% 92%) !important;
  }

  .dark input[type="text"],
  .dark input[type="email"],
  .dark input,
  body.dark input[type="text"],
  body.dark input[type="email"],
  body.dark input {
    background: hsl(30 12% 14%) !important;
    border-color: hsl(30 10% 25%) !important;
    color: hsl(40 15% 92%) !important;
  }
  .dark input:focus,
  body.dark input:focus {
    border-color: hsl(35 80% 60%) !important;
  }

  .dark textarea,
  body.dark textarea {
    background: hsl(30 12% 14%) !important;
    border-color: hsl(30 10% 25%) !important;
    color: hsl(40 15% 92%) !important;
  }
  .dark textarea:focus,
  body.dark textarea:focus {
    border-color: hsl(35 80% 60%) !important;
  }

  .dark button,
  .dark .bg-blue-500,
  body.dark button,
  body.dark .bg-blue-500 {
    background: hsl(40 15% 92%) !important;
    color: hsl(30 10% 8%) !important;
  }

  .dark .font-bold,
  body.dark .font-bold {
    color: hsl(40 15% 92%) !important;
  }

  .dark .font-medium,
  .dark label,
  body.dark .font-medium,
  body.dark label {
    color: hsl(35 10% 55%) !important;
  }

  .dark .text-gray-500,
  .dark .dark\\:text-gray-400,
  body.dark .text-gray-500,
  body.dark .dark\\:text-gray-400 {
    color: hsl(35 10% 50%) !important;
  }

  .dark .text-gray-900,
  .dark .dark\\:text-gray-100,
  .dark .dark\\:text-gray-200,
  body.dark .text-gray-900,
  body.dark .dark\\:text-gray-100,
  body.dark .dark\\:text-gray-200 {
    color: hsl(40 15% 85%) !important;
  }

  .dark .underline,
  body.dark .underline {
    color: hsl(35 80% 60%) !important;
  }

  .dark .border-gray-200,
  .dark .dark\\:border-gray-100,
  body.dark .border-gray-200,
  body.dark .dark\\:border-gray-100 {
    border-color: hsl(30 10% 20%) !important;
  }

  .dark .border-l-2,
  body.dark .border-l-2 {
    border-color: hsl(35 80% 60%) !important;
  }

  .dark .text-center,
  body.dark .text-center {
    color: hsl(30 10% 40%) !important;
  }
  .dark .text-center a,
  body.dark .text-center a {
    color: hsl(30 10% 50%) !important;
  }

  .dark .bg-gray-100,
  .dark .dark\\:bg-gray-500,
  body.dark .bg-gray-100,
  body.dark .dark\\:bg-gray-500 {
    background: transparent !important;
  }

  .dark .bg-gray-200,
  body.dark .bg-gray-200 {
    background: hsl(30 10% 18%) !important;
  }

  /* Placeholder colors */
  input::-moz-placeholder,
  textarea::-moz-placeholder {
    color: hsl(30 8% 55%) !important;
    opacity: 1 !important;
  }
  input::placeholder,
  textarea::placeholder {
    color: hsl(30 8% 55%) !important;
    opacity: 1 !important;
  }
  .dark input::-moz-placeholder,
  .dark textarea::-moz-placeholder,
  body.dark input::-moz-placeholder,
  body.dark textarea::-moz-placeholder {
    color: hsl(30 10% 40%) !important;
  }
  .dark input::placeholder,
  .dark textarea::placeholder,
  body.dark input::placeholder,
  body.dark textarea::placeholder {
    color: hsl(30 10% 40%) !important;
  }
`

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
    <style>${customStyles}</style>
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
