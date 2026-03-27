import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import matter from 'gray-matter'
import { ThemeToggleText } from './ThemeToggle'

function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const metadata: Metadata = {
  title: 'bernardo',
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
      description: matterResult.data.description || '',
    }
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export default function Home() {
  const posts = getPostMetadata()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="px-6 pt-8 pb-4 md:pt-10 md:pb-6 lg:pt-12 lg:pb-8 max-w-4xl mx-auto text-center animate-fade-in">
        <div className="space-y-3">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
            bernardo
          </h1>
          <div className="w-12 h-px bg-accent mx-auto" />
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            gosto de pensar que tecnologia mudou a minha vida
          </p>
          <p className="text-sm text-muted-foreground/70">
            (e espero impactar a sua também)
          </p>
        </div>
        
        {/* RSS Link & Theme Toggle */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link 
            href="/feed.xml" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9"/>
              <path d="M4 4a16 16 0 0 1 16 16"/>
              <circle cx="5" cy="19" r="1"/>
            </svg>
            assinar via rss
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <ThemeToggleText />
        </div>
      </header>

      {/* Posts List */}
      <main className="px-6 pb-20 max-w-3xl mx-auto">
        <div className="space-y-0">
          {posts.map((post, index) => (
            <article 
              key={post.slug}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
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
                        className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
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
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground/60">
          <p>© {new Date().getFullYear()} bernardo</p>
          <div className="flex items-center gap-4">
            <Link href="/feed.xml" className="hover:text-accent transition-colors">
              rss
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const dynamic = 'force-static'
