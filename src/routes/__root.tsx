import { useRef } from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from '../components/header'
import NavBar from '../components/navBar'
import { NavBarProvider } from '../context/navBarContext'
import { useNavBarWidth } from '../hooks/useNavBarWidth'
import { useNavBar } from '../context/navBarContext'

const RootLayout = () => {
  const headerRef = useRef<HTMLElement>(null)
  const navBarRef = useRef<HTMLElement>(null)
  const { isMobile } = useNavBar()
  const navBarWidth = useNavBarWidth(navBarRef, isMobile)

  return (
    <div className="app-layout flex h-screen">
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        <NavBar ref={navBarRef} />
      </aside>
      <div 
        className="main-content flex-1 flex flex-col overflow-hidden"
        style={{
          marginLeft: isMobile ? 0 : (navBarWidth ? `${navBarWidth}px` : '4rem'),
          marginBottom: isMobile ? '4rem' : 0,
        }}
      >
        <Header ref={headerRef} />

        <main 
          className="content flex-1 overflow-auto px-4 py-2 bg-primary" 
          role="main"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  component: () => {
    return (
      <NavBarProvider>
        <RootLayout />
      </NavBarProvider>
    )
  },
})
