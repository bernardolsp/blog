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
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">bernardo</h1>
        <p className="text-sm opacity-70">gosto de pensar que tecnologia mudou a minha vida</p>
        <p className="text-sm opacity-50">(e espero impactar a sua também)</p>
      </header>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug} className="border-t pt-8 first:border-t-0 first:pt-0">
            <Link href={`/post/${post.slug}`} className="block group">
              <h2 className="text-xl font-semibold mb-2 group-hover:underline">{post.title}</h2>
              <p className="text-sm opacity-70">publicado em {(post as any).date}</p>
              </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
export const dynamic = 'force-static'