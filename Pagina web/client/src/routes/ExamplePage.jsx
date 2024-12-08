import { createFileRoute } from '@tanstack/react-router'
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import PaginatedTable from '../components/paginatedTable.jsx';  // Asegúrate que coincida exactamente

export const Route = createFileRoute('/ExamplePage')({
  component: ExamplePage,
})

export default function ExamplePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Ejemplo de Tabla Paginada</h3>
        </CardHeader>
        <CardBody>
          <PaginatedTable
            endpoint="/api/examples"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Nombre' },
              { key: 'email', label: 'Email' },
              { key: 'status', label: 'Estado' },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  )
}

