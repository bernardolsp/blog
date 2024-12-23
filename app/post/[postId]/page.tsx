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

  return {
    slug,
    contentHtml,
    ...matterResult.data
  }
}

export default async function Post({ params }: { params: { postId: string } }) {
  const post = await getPostContent(params.postId)

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
        {post.audio && <AudioPlayer src={post.audio} />}
      </header>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
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

// This ensures the page is statically generated
export const dynamic = 'force-static'
