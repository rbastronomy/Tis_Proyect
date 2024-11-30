import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardBody, Input, Button, Link, Divider } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { PasswordInput } from '../components/PasswordInput';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const Route = createLazyFileRoute('/login')({
  component: Login,
});

function Login() {
  const { refreshAuth } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error al iniciar sesión');
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }

      await refreshAuth();
      navigate({ to: '/' }, { replace: true });

    } catch (error) {
      console.error('Error en el login:', error.message);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="flex justify-center items-center flex-grow py-12">
        <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-1 p-6">
            <h1 className="text-2xl font-bold tracking-tight text-center">Iniciar Sesión</h1>
            <p className="text-sm text-default-500 text-center">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </CardHeader>
          <Divider/>
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
                    placeholder="ejemplo@correo.com"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    variant="bordered"
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: "bg-white/50"
                    }}
                  />
                )}
              />
              <div className="space-y-1">
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
                    <PasswordInput
                      {...field}
                      label="Contraseña"
                      placeholder="Introduce tu contraseña"
                      error={errors.password?.message}
                    />
                  )}
                />
                <div className="flex justify-end">
                  <Link href="#" size="sm" className="text-orange-500 hover:text-orange-600">
                    ¿Olvidó su contraseña?
                  </Link>
                </div>
              </div>
              
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                type="submit" 
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-default-500">¿No tiene una cuenta? </span>
              <Link href="/registro" className="text-orange-500 hover:text-orange-600">
                Regístrese aquí
              </Link>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-2">
                {error}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
