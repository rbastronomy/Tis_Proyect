import { createLazyFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardBody, Input, Button, Link, Divider } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { PasswordInput } from '../components/PasswordInput';
import { useRut } from '../hooks/useRut';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

function Registro() {
  const { refreshAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { rut, updateRut, isValid: isRutValid } = useRut();
  
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nombre: '',
      correo: '',
      ntelefono: '',
      contrasena: '',
      confirmPassword: ''
    }
  });

  const password = watch("contrasena");

  const onSubmit = async (data) => {
    try {
      setError('');
      if (step === 1) {
        if (!isRutValid) {
          return;
        }
        setStep(2);
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rut: rut.raw,
          nombre: data.nombre,
          correo: data.correo,
          ntelefono: data.ntelefono,
          contrasena: data.contrasena,
          estadop: 'ACTIVO',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error al registrar usuario');
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      const result = await response.json();
      console.log('Registro exitoso:', result);
      await refreshAuth();
      setSuccess(true);
    } catch (error) {
      console.error('Error en el registro:', error.message);
      setError(error.message);
      if (error.message.includes('already exists')) {
        console.error('El usuario ya existe');
      } else {
        console.error('Error en el registro');
      }
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate({ to: '/' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 to-white justify-center items-center">
        <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm p-6">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">¡Registro Exitoso!</h2>
          </CardHeader>
          <CardBody>
            <p className="text-center">Has sido registrado correctamente. Serás redirigido al inicio en 5 segundos.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="flex justify-center items-center flex-grow py-12">
        <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-1 p-6">
            <h1 className="text-2xl font-bold tracking-tight text-center">
              {step === 1 ? 'Verificación de RUT' : 'Crear Cuenta'}
            </h1>
            <p className="text-sm text-default-500 text-center">
              {step === 1 ? 'Ingrese su RUT para continuar' : 'Complete sus datos personales'}
            </p>
          </CardHeader>
          <Divider/>
          <CardBody className="p-6">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              {step === 1 ? (
                // Step 1: RUT Verification
                <div className="space-y-4">
                  <Input
                    value={rut.formatted}
                    onChange={(e) => updateRut(e.target.value)}
                    label="RUT"
                    placeholder="12.345.678-9"
                    isInvalid={!isRutValid && rut.formatted !== ''}
                    errorMessage={!isRutValid && rut.formatted !== '' ? "RUT inválido" : ""}
                    variant="bordered"
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: "bg-white/50"
                    }}
                  />
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    type="submit"
                    isDisabled={!isRutValid}
                  >
                    Continuar
                  </Button>
                </div>
              ) : (
                // Step 2: Personal Information
                <>
                  <Controller
                    name="nombre"
                    control={control}
                    rules={{ required: "El nombre es obligatorio" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Nombre"
                        placeholder="Ejemplo: Juan"
                        isInvalid={!!errors.nombre}
                        errorMessage={errors.nombre?.message}
                        variant="bordered"
                      />
                    )}
                  />

                  <Controller
                    name="correo"
                    control={control}
                    rules={{ 
                      required: "El correo es obligatorio",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Correo inválido"
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        label="Correo Electrónico"
                        placeholder="ejemplo@correo.com"
                        isInvalid={!!errors.correo}
                        errorMessage={errors.correo?.message}
                        variant="bordered"
                      />
                    )}
                  />

                  <Controller
                    name="ntelefono"
                    control={control}
                    rules={{ 
                      required: "El teléfono es obligatorio",
                      pattern: {
                        value: /^[0-9]{9}$/,
                        message: "Teléfono inválido (9 dígitos)"
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="tel"
                        label="Teléfono"
                        placeholder="912345678"
                        isInvalid={!!errors.ntelefono}
                        errorMessage={errors.ntelefono?.message}
                        variant="bordered"
                      />
                    )}
                  />

                  <Controller
                    name="contrasena"
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
                        error={errors.contrasena?.message}
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
                </>
              )}
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
      {error && (
        <div className="text-red-500 text-sm text-center mt-2">
          {error}
        </div>
      )}
    </div>
  );
}

export const Route = createLazyFileRoute('/registro')({
  component: Registro
}); 