import { createLazyFileRoute } from '@tanstack/react-router';
import { Card, CardHeader, CardBody, Input, Button, Link, Divider } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { PasswordInput } from '../components/PasswordInput';

export const Route = createLazyFileRoute('/registro')({
  component: Registro,
});

function Registro() {
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      const response = await fetch('api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      const result = await response.json();
      console.log('Registro exitoso:', result);
      // Add navigation logic here

    } catch (error) {
      console.error('Error en el registro:', error.message);
      // Add toast notification here instead of alert
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="flex justify-center items-center flex-grow py-12">
        <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-1 p-6">
            <h1 className="text-2xl font-bold tracking-tight text-center">Crear Cuenta</h1>
            <p className="text-sm text-default-500 text-center">
              Complete el formulario para registrarse
            </p>
          </CardHeader>
          <Divider/>
          <CardBody className="p-6">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="nombre"
                control={control}
                rules={{ 
                  required: "El nombre es obligatorio",
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Nombre Completo"
                    placeholder="Juan Pérez"
                    isInvalid={!!errors.nombre}
                    errorMessage={errors.nombre?.message}
                    variant="bordered"
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: "bg-white/50"
                    }}
                  />
                )}
              />

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
                    type="email"
                    label="Correo Electrónico"
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

              <Controller
                name="telefono"
                control={control}
                rules={{ 
                  required: "El teléfono es obligatorio",
                  pattern: {
                    value: /^[0-9]{9}$/,
                    message: "Número de teléfono no válido (9 dígitos)"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="tel"
                    label="Teléfono"
                    placeholder="912345678"
                    isInvalid={!!errors.telefono}
                    errorMessage={errors.telefono?.message}
                    variant="bordered"
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: "bg-white/50"
                    }}
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
                  <PasswordInput
                    {...field}
                    label="Contraseña"
                    placeholder="Introduce tu contraseña"
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                rules={{ 
                  required: "Debe confirmar la contraseña",
                  validate: value => 
                    value === password || "Las contraseñas no coinciden"
                }}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label="Confirmar Contraseña"
                    placeholder="Confirma tu contraseña"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
              
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                type="submit"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-default-500">¿Ya tienes una cuenta? </span>
              <Link href="/login" className="text-orange-500 hover:text-orange-600">
                Inicia sesión aquí
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
} 