/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as TaxiIndexImport } from './routes/taxi/index'
import { Route as PostIndexImport } from './routes/post/index'
import { Route as TaxiRutaImport } from './routes/taxi/ruta'
import { Route as PostPostIdImport } from './routes/post/$postId'

// Create Virtual Routes

const SobreLazyImport = createFileRoute('/sobre')()
const RegistroLazyImport = createFileRoute('/registro')()
const LoginLazyImport = createFileRoute('/login')()
const ContactoLazyImport = createFileRoute('/contacto')()
const AyudaLazyImport = createFileRoute('/ayuda')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const SobreLazyRoute = SobreLazyImport.update({
  path: '/sobre',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/sobre.lazy').then((d) => d.Route))

const RegistroLazyRoute = RegistroLazyImport.update({
  path: '/registro',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/registro.lazy').then((d) => d.Route))

const LoginLazyRoute = LoginLazyImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login.lazy').then((d) => d.Route))

const ContactoLazyRoute = ContactoLazyImport.update({
  path: '/contacto',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/contacto.lazy').then((d) => d.Route))

const AyudaLazyRoute = AyudaLazyImport.update({
  path: '/ayuda',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/ayuda.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const TaxiIndexRoute = TaxiIndexImport.update({
  path: '/taxi/',
  getParentRoute: () => rootRoute,
} as any)

const PostIndexRoute = PostIndexImport.update({
  path: '/post/',
  getParentRoute: () => rootRoute,
} as any)

const TaxiRutaRoute = TaxiRutaImport.update({
  path: '/taxi/ruta',
  getParentRoute: () => rootRoute,
} as any)

const PostPostIdRoute = PostPostIdImport.update({
  path: '/post/$postId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/ayuda': {
      id: '/ayuda'
      path: '/ayuda'
      fullPath: '/ayuda'
      preLoaderRoute: typeof AyudaLazyImport
      parentRoute: typeof rootRoute
    }
    '/contacto': {
      id: '/contacto'
      path: '/contacto'
      fullPath: '/contacto'
      preLoaderRoute: typeof ContactoLazyImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginLazyImport
      parentRoute: typeof rootRoute
    }
    '/registro': {
      id: '/registro'
      path: '/registro'
      fullPath: '/registro'
      preLoaderRoute: typeof RegistroLazyImport
      parentRoute: typeof rootRoute
    }
    '/sobre': {
      id: '/sobre'
      path: '/sobre'
      fullPath: '/sobre'
      preLoaderRoute: typeof SobreLazyImport
      parentRoute: typeof rootRoute
    }
    '/post/$postId': {
      id: '/post/$postId'
      path: '/post/$postId'
      fullPath: '/post/$postId'
      preLoaderRoute: typeof PostPostIdImport
      parentRoute: typeof rootRoute
    }
    '/taxi/ruta': {
      id: '/taxi/ruta'
      path: '/taxi/ruta'
      fullPath: '/taxi/ruta'
      preLoaderRoute: typeof TaxiRutaImport
      parentRoute: typeof rootRoute
    }
    '/post/': {
      id: '/post/'
      path: '/post'
      fullPath: '/post'
      preLoaderRoute: typeof PostIndexImport
      parentRoute: typeof rootRoute
    }
    '/taxi/': {
      id: '/taxi/'
      path: '/taxi'
      fullPath: '/taxi'
      preLoaderRoute: typeof TaxiIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/ayuda': typeof AyudaLazyRoute
  '/contacto': typeof ContactoLazyRoute
  '/login': typeof LoginLazyRoute
  '/registro': typeof RegistroLazyRoute
  '/sobre': typeof SobreLazyRoute
  '/post/$postId': typeof PostPostIdRoute
  '/taxi/ruta': typeof TaxiRutaRoute
  '/post': typeof PostIndexRoute
  '/taxi': typeof TaxiIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/ayuda': typeof AyudaLazyRoute
  '/contacto': typeof ContactoLazyRoute
  '/login': typeof LoginLazyRoute
  '/registro': typeof RegistroLazyRoute
  '/sobre': typeof SobreLazyRoute
  '/post/$postId': typeof PostPostIdRoute
  '/taxi/ruta': typeof TaxiRutaRoute
  '/post': typeof PostIndexRoute
  '/taxi': typeof TaxiIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/ayuda': typeof AyudaLazyRoute
  '/contacto': typeof ContactoLazyRoute
  '/login': typeof LoginLazyRoute
  '/registro': typeof RegistroLazyRoute
  '/sobre': typeof SobreLazyRoute
  '/post/$postId': typeof PostPostIdRoute
  '/taxi/ruta': typeof TaxiRutaRoute
  '/post/': typeof PostIndexRoute
  '/taxi/': typeof TaxiIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/ayuda'
    | '/contacto'
    | '/login'
    | '/registro'
    | '/sobre'
    | '/post/$postId'
    | '/taxi/ruta'
    | '/post'
    | '/taxi'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/ayuda'
    | '/contacto'
    | '/login'
    | '/registro'
    | '/sobre'
    | '/post/$postId'
    | '/taxi/ruta'
    | '/post'
    | '/taxi'
  id:
    | '__root__'
    | '/'
    | '/ayuda'
    | '/contacto'
    | '/login'
    | '/registro'
    | '/sobre'
    | '/post/$postId'
    | '/taxi/ruta'
    | '/post/'
    | '/taxi/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  AyudaLazyRoute: typeof AyudaLazyRoute
  ContactoLazyRoute: typeof ContactoLazyRoute
  LoginLazyRoute: typeof LoginLazyRoute
  RegistroLazyRoute: typeof RegistroLazyRoute
  SobreLazyRoute: typeof SobreLazyRoute
  PostPostIdRoute: typeof PostPostIdRoute
  TaxiRutaRoute: typeof TaxiRutaRoute
  PostIndexRoute: typeof PostIndexRoute
  TaxiIndexRoute: typeof TaxiIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  AyudaLazyRoute: AyudaLazyRoute,
  ContactoLazyRoute: ContactoLazyRoute,
  LoginLazyRoute: LoginLazyRoute,
  RegistroLazyRoute: RegistroLazyRoute,
  SobreLazyRoute: SobreLazyRoute,
  PostPostIdRoute: PostPostIdRoute,
  TaxiRutaRoute: TaxiRutaRoute,
  PostIndexRoute: PostIndexRoute,
  TaxiIndexRoute: TaxiIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.jsx",
      "children": [
        "/",
        "/ayuda",
        "/contacto",
        "/login",
        "/registro",
        "/sobre",
        "/post/$postId",
        "/taxi/ruta",
        "/post/",
        "/taxi/"
      ]
    },
    "/": {
      "filePath": "index.lazy.jsx"
    },
    "/ayuda": {
      "filePath": "ayuda.lazy.jsx"
    },
    "/contacto": {
      "filePath": "contacto.lazy.jsx"
    },
    "/login": {
      "filePath": "login.lazy.jsx"
    },
    "/registro": {
      "filePath": "registro.lazy.jsx"
    },
    "/sobre": {
      "filePath": "sobre.lazy.jsx"
    },
    "/post/$postId": {
      "filePath": "post/$postId.jsx"
    },
    "/taxi/ruta": {
      "filePath": "taxi/ruta.jsx"
    },
    "/post/": {
      "filePath": "post/index.jsx"
    },
    "/taxi/": {
      "filePath": "taxi/index.jsx"
    }
  }
}
ROUTE_MANIFEST_END */
