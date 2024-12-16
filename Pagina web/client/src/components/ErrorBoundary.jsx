import { Card, CardBody, Button } from "@nextui-org/react";

export function ErrorBoundary({ error }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card>
        <CardBody className="text-center">
          <h2 className="text-xl font-bold mb-4">Algo salió mal</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button 
            color="primary"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </Button>
        </CardBody>
      </Card>
    </div>
  );
} 