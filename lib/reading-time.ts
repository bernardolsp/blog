// Calculate reading time based on word count
// Average reading speed: 200-250 words per minute in Portuguese
const WORDS_PER_MINUTE = 225

export function calculateReadingTime(content: string): number {
  // Remove markdown syntax and HTML tags
  const cleanContent = content
    .replace(/#+ /g, '') // Headers
    .replace(/\*\*|\*|__/g, '') // Bold/italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/`[^`]+`/g, '') // Inline code
    .replace(/\n/g, ' ')
    .trim()
  
  const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length
  const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE)
  
  return Math.max(1, readingTime) // Minimum 1 minute
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min de leitura`
}
