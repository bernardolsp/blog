import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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
        ← Back to all posts
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{(post as any).title}</h1>
      </header>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  )
}