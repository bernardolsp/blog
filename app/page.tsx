import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import matter from 'gray-matter'


export const metadata: Metadata = {
  title: {
    default: 'blog do bernardo',
    template: '%s | bernardo'
  },
  description: 'um blog sobre vida e tecnologia',
  openGraph: {
    title: 'bernardo',
    description: 'um blog sobre vida e tecnologia',
    url: 'https://bernardolopes.com',
    siteName: 'bernardo',
    locale: 'pt_BR',
    type: 'website',
  },
}

function getPostMetadata() {
  const folder = path.join(process.cwd(), 'posts')
  const files = fs.readdirSync(folder)
  const markdownPosts = files.filter((file) => file.endsWith('.md'))

  const posts = markdownPosts.map((fileName) => {
    const fileContents = fs.readFileSync(path.join(folder, fileName), 'utf8')
    const matterResult = matter(fileContents)
    return {
      title: matterResult.data.title,
      date: matterResult.data.date,
      slug: fileName.replace('.md', ''),
      tags: matterResult.data.tags || [],
    }
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function Home() {
  const posts = getPostMetadata()

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">bernardo</h1>
        <p className="text-sm opacity-70">gosto de pensar que tecnologia mudou a minha vida</p>
        <p className="text-sm opacity-50">(e espero impactar a sua também)</p>
      </header>
      <div className="mb-8 text-center">
        <a 
          href="/feed.xml" 
          className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
          title="Assinar feed RSS"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11a9 9 0 0 1 9 9"/>
            <path d="M4 4a16 16 0 0 1 16 16"/>
            <circle cx="5" cy="19" r="1"/>
          </svg>
          rss
        </a>
      </div>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug} className="border-t pt-8 first:border-t-0 first:pt-0">
            <Link href={`/post/${post.slug}`} className="block group">
              <h2 className="text-xl font-semibold mb-2 group-hover:underline">{post.title}</h2>
              <p className="text-sm opacity-70 mb-2">publicado em {(post as any).date}</p>
              {post.tags.length > 0 && (
                <div className="flex gap-2 text-sm">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="opacity-50">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
export const dynamic = 'force-static'
