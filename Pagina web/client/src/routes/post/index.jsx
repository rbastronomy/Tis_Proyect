import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/post/')({
  component: () => <div>Hello /post/!</div>,
})
