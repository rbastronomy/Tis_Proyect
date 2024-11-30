import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { NextUIProvider } from '@nextui-org/react'
import { AuthProvider } from './hooks/useAuth'

const router = createRouter({ routeTree })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NextUIProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NextUIProvider>
  </StrictMode>,
)
