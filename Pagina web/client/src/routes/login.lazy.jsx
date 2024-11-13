import { createLazyFileRoute } from '@tanstack/react-router';
import { Card, CardHeader, CardBody, Input, Button } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";

export const Route = createLazyFileRoute('/login')({
  component: Login,
});

function Login() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
        const response = await fetch('api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: data.email,  // Usando 'email' aquí
                password: data.password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const result = await response.json();
        console.log('Login successful:', result, result.usermail);
        

    } catch (error) {
        console.error('Error en el login:', error.message);
        alert(`Login Error: ${error.message}`);
    }
};

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex justify-center items-center flex-grow">
        <Card className="w-full max-w-md bg-white shadow-md rounded">
          <CardHeader className="flex gap-3 p-4 bg-gray-800 text-white">
            <div className="flex flex-col">
              <p className="text-md">Iniciar Sesión</p>
              <p className="text-small text-gray-400">Introduce tus credenciales</p>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: "El correo electrónico es obligatorio", 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Dirección de correo electrónico no válida"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Correo Electrónico"
                    type="email"
                    placeholder="Introduce tu correo electrónico"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    className="border-gray-300 rounded-md shadow-sm"
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                rules={{ 
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Contraseña"
                    type="password"
                    placeholder="Introduce tu contraseña"
                    isInvalid={!!errors.password}
                    errorMessage={errors.password?.message}
                    className="border-gray-300 rounded-md shadow-sm"
                  />
                )}
              />
              <Button color="primary" type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Iniciar Sesión
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
