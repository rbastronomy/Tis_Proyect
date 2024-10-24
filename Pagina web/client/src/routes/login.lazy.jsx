import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Card, CardHeader, CardBody, Input, Button } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";

export const Route = createLazyFileRoute('/login')({
  component: Login,
})

function Login() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = (data) => {
    // Add your login logic here
    console.log('Login submitted');
    console.log('Email:', data.email);
    console.log('Password:', data.password);
  };

  console.log(errors);

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Login</p>
            <p className="text-small text-default-500">Enter your credentials</p>
          </div>
        </CardHeader>
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              rules={{ 
                required: "Email is required", 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{ 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                />
              )}
            />
            <Button color="primary" type="submit">
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
