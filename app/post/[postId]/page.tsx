//@ts-nocheck
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AudioPlayer from '../../components/audioplayer'
import CusdisComments from '../../components/CusdisComments'
import { calculateReadingTime, formatReadingTime } from '../../../lib/reading-time'

export async function generateMetadata({ params }: { params: { postId: string } }): Promise<Metadata> {
  const post = await getPostContent(params.postId)
  return {
    title: post.title,
    description: post.description || `Read ${post.title} on bernardo`,
    openGraph: {
      title: post.title,
      description: post.description || `Read ${post.title} on bernardo`,
      type: 'article',
      publishedTime: post.date,
      authors: ['Bernardo'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || `Read ${post.title} on bernardo`,
    },
  }
}

async function getPostContent(slug: string) {
  const folder = path.join(process.cwd(), 'posts')
  const file = `${slug}.md`
  const content = fs.readFileSync(path.join(folder, file), 'utf8')
  const matterResult = matter(content)

  const processedContent = await remark()
    .use(html)
    .use(remarkGfm)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  const readingTime = calculateReadingTime(matterResult.content)

  return {
    slug,
    contentHtml,
    readingTime,
    ...matterResult.data
  }
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
        slug: fileName.replace('.md', ''),
        tags: matterResult.data.tags || [],
        date: matterResult.data.date,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getRelatedPosts(currentSlug: string, currentTags: string[]) {
  const allPosts = getAllPosts()
  const otherPosts = allPosts.filter(post => post.slug !== currentSlug)
  
  const scoredPosts = otherPosts.map(post => {
    const tagOverlap = post.tags.filter(tag => currentTags.includes(tag)).length
    return { ...post, score: tagOverlap }
  })
  
  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  
  return scoredPosts.slice(0, 2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export default async function Post({ params }: { params: { postId: string } }) {
  const post = await getPostContent(params.postId)
  const relatedPosts = getRelatedPosts(params.postId, post.tags || [])

  if (!post) {
    notFound()
  }

  return (
    <article className="min-h-screen">
      {/* Header / Navigation */}
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

      {/* Article Header */}
      <header className="px-6 pb-4 max-w-3xl mx-auto text-center animate-slide-up">
        <div className="space-y-2">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag: string) => (
                <Link 
                  key={tag} 
                  href={`/tag/${tag}`}
                  className="text-sm text-muted-foreground/70 hover:text-accent transition-colors duration-300"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
            {post.title}
          </h1>
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground pt-2">
            <time>{formatDate(post.date)}</time>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>{formatReadingTime(post.readingTime)}</span>
          </div>
          
          {/* Audio if available */}
          {post.audio && (
            <div className="pt-4">
              <AudioPlayer src={post.audio} />
            </div>
          )}
        </div>
      </header>

      {/* Article Content */}
      <main className="px-6 pb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div
          className="prose dark:prose-invert mx-auto"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </main>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-6 py-16 border-t border-border bg-secondary/30 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground/70 mb-8 text-center font-medium">
              você também pode gostar
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.slug}
                  href={`/post/${relatedPost.slug}`}
                  className="group block p-6 rounded-lg bg-card border border-border hover:border-accent/50 transition-all duration-300"
                >
                  <h4 className="text-lg font-display font-medium group-hover:text-accent transition-colors duration-300 leading-snug mb-2">
                    {relatedPost.title}
                  </h4>
                  <time className="text-sm text-muted-foreground/60">
                    {formatDate(relatedPost.date)}
                  </time>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="px-6 py-16 border-t border-border animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="max-w-2xl mx-auto">
          <CusdisComments
            attrs={{
              host: 'https://comments.bernardolopes.com',
              appId: '73978fbe-bd65-447e-9c77-37d872551504',
              pageId: params.postId,
              pageTitle: post.title,
              pageUrl: `https://bernardolopes.com/post/${params.postId}`,
            }}
          />
        </div>
      </section>

      {/* Footer Navigation */}
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
    </article>
  )
}

export async function generateStaticParams() {
  const folder = path.join(process.cwd(), 'posts')
  const files = fs.readdirSync(folder)
  const markdownPosts = files.filter((file) => file.endsWith('.md'))

  return markdownPosts.map((fileName) => ({
    postId: fileName.replace('.md', ''),
  }))
}

export const dynamic = 'force-static'
