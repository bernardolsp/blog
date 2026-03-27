import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { notFound } from 'next/navigation'
import { ThemeToggleText } from '../../ThemeToggle'

function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getAllPosts() {
  const folder = path.join(process.cwd(), 'posts')
  const files = fs.readdirSync(folder)
  
  return files
    .filter((file) => file.endsWith('.md'))
    .map((fileName) => {
      const fileContents = fs.readFileSync(path.join(folder, fileName), 'utf8')
      const matterResult = matter(fileContents)
      return {
        title: matterResult.data.title,
        date: matterResult.data.date,
        slug: fileName.replace('.md', ''),
        tags: matterResult.data.tags || [],
        description: matterResult.data.description || '',
      }
    })
}

function getPostsByTag(slug: string) {
  const posts = getAllPosts()
  
  return posts
    .filter((post) => post.tags.some((tag: string) => slugifyTag(tag) === slug))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getDisplayTagFromSlug(slug: string): string | null {
  const posts = getAllPosts()
  for (const post of posts) {
    for (const tag of post.tags) {
      if (slugifyTag(tag) === slug) {
        return tag
      }
    }
  }
  return null
}

function getAllTags() {
  const posts = getAllPosts()
  const tags = new Set<string>()
  
  posts.forEach((post) => {
    post.tags.forEach((tag: string) => {
      tags.add(slugifyTag(tag))
    })
  })
  
  return Array.from(tags)
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({ tag }))
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const posts = getPostsByTag(params.tag)
  const displayTag = getDisplayTagFromSlug(params.tag)
  
  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-6 py-8 max-w-4xl mx-auto animate-fade-in">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors duration-300 group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transform group-hover:-translate-x-1 transition-transform duration-300"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span>voltar</span>
        </Link>
      </nav>

      {/* Header */}
      <header className="px-6 pb-8 max-w-3xl mx-auto text-center animate-slide-up">
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground/70">#{displayTag || params.tag}</span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight capitalize">
            {displayTag || params.tag}
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground pt-2">
            <span>{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <ThemeToggleText />
          </div>
        </div>
      </header>

      {/* Posts List */}
      <main className="px-6 pb-20 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="space-y-0">
          {posts.map((post, index) => (
            <article 
              key={post.slug}
              className="group animate-slide-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="block py-5 border-t border-border first:border-t-0 first:pt-3 transition-all duration-300">
                <Link href={`/post/${post.slug}`} className="block group">
                  <div className="space-y-3">
                    {/* Date */}
                    <time className="text-sm text-muted-foreground/70 font-body">
                      {formatDate(post.date)}
                    </time>
                    
                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-display font-medium group-hover:text-accent transition-colors duration-300 leading-tight">
                      {post.title}
                    </h2>
                    
                    {/* Description */}
                    {post.description && (
                      <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                        {post.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Read more indicator */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground/60 group-hover:text-accent transition-all duration-300">
                    <span>ler mais</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="transform group-hover:translate-x-1 transition-transform duration-300"
                    >
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
                
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {post.tags.map((tag: string) => (
                      <Link 
                        key={tag} 
                        href={`/tag/${slugifyTag(tag)}`}
                        className={`text-xs px-3 py-1 rounded-full transition-colors duration-300 ${
                          slugifyTag(tag) === params.tag 
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                            : 'bg-secondary text-secondary-foreground/80 hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border">
        <div className="max-w-3xl mx-auto flex justify-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors duration-300 group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transform group-hover:-translate-x-1 transition-transform duration-300"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>voltar para todos os posts</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}

export const dynamic = 'force-static'
