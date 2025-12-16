import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AuthProvider } from './context/authContext.tsx'
import { NotificationProvider } from './context/notificationContext.tsx'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    
      <AuthProvider>
        <NotificationProvider>
        <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>,

  )
}

reportWebVitals()
