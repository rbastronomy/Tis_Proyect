import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '../components/Map'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg w-full">
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Welcome Home!</h1>
        <div className="aspect-w-16 aspect-h-9 w-full">
          <Map />
        </div>
      </div>
    </div>
  )
}
