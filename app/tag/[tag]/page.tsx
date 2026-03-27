import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { notFound } from 'next/navigation'

function getPostsByTag(tag: string) {
  const folder = path.join(process.cwd(), 'posts')
  const files = fs.readdirSync(folder)
  
  const posts = files
    .filter((file) => file.endsWith('.md'))
    .map((fileName) => {
      const fileContents = fs.readFileSync(path.join(folder, fileName), 'utf8')
      const matterResult = matter(fileContents)
      return {
        title: matterResult.data.title,
        date: matterResult.data.date,
        slug: fileName.replace('.md', ''),
        tags: matterResult.data.tags || [],
      }
    })
    .filter((post) => post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  return posts
}

function getAllTags() {
  const folder = path.join(process.cwd(), 'posts')
  const files = fs.readdirSync(folder)
  const tags = new Set<string>()
  
  files
    .filter((file) => file.endsWith('.md'))
    .forEach((fileName) => {
      const fileContents = fs.readFileSync(path.join(folder, fileName), 'utf8')
      const matterResult = matter(fileContents)
      const postTags = matterResult.data.tags || []
      postTags.forEach((tag: string) => tags.add(tag))
    })
  
  return Array.from(tags)
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({ tag }))
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const posts = getPostsByTag(params.tag)
  
  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline mb-8 inline-block">
        ← Voltar para a lista de posts
      </Link>
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">#{params.tag}</h1>
        <p className="text-sm opacity-70">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
      </header>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug} className="border-t pt-8 first:border-t-0 first:pt-0">
            <Link href={`/post/${post.slug}`} className="block group">
              <h2 className="text-xl font-semibold mb-2 group-hover:underline">{post.title}</h2>
              <p className="text-sm opacity-70">publicado em {post.date}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const dynamic = 'force-static'
