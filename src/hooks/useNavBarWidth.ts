import { useState, useEffect } from 'react'
import type { RefObject } from 'react'

export const useNavBarWidth = (
  elementRef: RefObject<HTMLElement | null>,
  isMobile: boolean
) => {
  const [navBarWidth, setNavBarWidth] = useState(0)

  useEffect(() => {
    const updateNavBarWidth = () => {
      if (isMobile) {
        setNavBarWidth(0)
      } else if (elementRef.current) {
        setNavBarWidth(elementRef.current.offsetWidth)
      }
    }

    const timer = setTimeout(updateNavBarWidth, 100)
    window.addEventListener('resize', updateNavBarWidth)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateNavBarWidth)
    }
  }, [elementRef, isMobile])

  return navBarWidth
}