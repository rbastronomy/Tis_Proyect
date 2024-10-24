import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
export const Route = createFileRoute('/post/$postId')({
  component: PostComponent,
})

export function PostComponent() {
  const { postId } = Route.useParams()
  const numericPostId = parseInt(postId, 10)
  return <div>
      Hello /post/{postId}!
      <Link to={`/post/${numericPostId + 1}`}>Increase route number</Link>
    </div>
}
