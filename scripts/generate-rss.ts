import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Post {
  title: string
  date: string
  description: string
  slug: string
  content: string
}

function getPosts(): Post[] {
  const postsDirectory = path.join(process.cwd(), 'posts')
  const files = fs.readdirSync(postsDirectory)
  
  const posts = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(postsDirectory, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        title: data.title,
        date: data.date,
        description: data.description || '',
        slug: file.replace('.md', ''),
        content,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  return posts
}

function generateRSS(): string {
  const posts = getPosts()
  const siteUrl = 'https://bernardolopes.com'
  
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>blog do bernardo</title>
    <link>${siteUrl}</link>
    <description>um blog sobre vida e tecnologia</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/post/${post.slug}</link>
      <guid>${siteUrl}/post/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>
    `.trim()).join('\n    ')}
  </channel>
</rss>`
  
  return rss
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '"': return '&quot;'
      case "'": return '&apos;'
      default: return c
    }
  })
}

const rss = generateRSS()
const outputPath = path.join(process.cwd(), 'public', 'feed.xml')

// Ensure public directory exists
if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
  fs.mkdirSync(path.join(process.cwd(), 'public'))
}

fs.writeFileSync(outputPath, rss)
console.log('RSS feed generated at public/feed.xml')
