import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

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
    }
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function Home() {
  const posts = getPostMetadata()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">bernardo</h1>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug} className="border-t pt-8 first:border-t-0 first:pt-0">
            <Link href={`/post/${post.slug}`} className="block group">
              <h2 className="text-xl font-semibold mb-2 group-hover:underline">{post.title}</h2>
              <time className="text-sm opacity-70">{post.date}</time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}