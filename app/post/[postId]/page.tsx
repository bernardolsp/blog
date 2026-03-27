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
  
  // Score posts based on tag overlap
  const scoredPosts = otherPosts.map(post => {
    const tagOverlap = post.tags.filter(tag => currentTags.includes(tag)).length
    return { ...post, score: tagOverlap }
  })
  
  // Sort by score (descending), then by date (descending)
  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  
  return scoredPosts.slice(0, 2)
}

export default async function Post({ params }: { params: { postId: string } }) {
  const post = await getPostContent(params.postId)
  const relatedPosts = getRelatedPosts(params.postId, post.tags || [])

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-2xl mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline mb-8 inline-block">
        ← Voltar para a lista de posts
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{(post as any).title}</h1>
        <div className="flex flex-wrap gap-2 text-sm opacity-70 mb-4">
          <span>{formatReadingTime(post.readingTime)}</span>
          {post.tags && post.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-2">
                {post.tags.map((tag: string) => (
                  <Link 
                    key={tag} 
                    href={`/tag/${tag}`}
                    className="hover:underline"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        {post.audio && <AudioPlayer src={post.audio} />}
      </header>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
      
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4">você também pode gostar</h3>
          <ul className="space-y-4">
            {relatedPosts.map((relatedPost) => (
              <li key={relatedPost.slug}>
                <Link 
                  href={`/post/${relatedPost.slug}`}
                  className="block group"
                >
                  <span className="text-base font-medium group-hover:underline">
                    {relatedPost.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      
      <CusdisComments
        attrs={{
          host: 'https://comments.bernardolopes.com',
          appId: '73978fbe-bd65-447e-9c77-37d872551504',
          pageId: params.postId,
          pageTitle: post.title,
          pageUrl: `https://bernardolopes.com/post/${params.postId}`,
        }}
      />
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
