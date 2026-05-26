import { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext()

export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('dm') === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('dm', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('dm', 'light')
    }
  }, [isDark])

  const toggle = () => setIsDark(d => !d)
  return <DarkModeContext.Provider value={{ isDark, toggle }}>{children}</DarkModeContext.Provider>
}

export const useDarkMode = () => useContext(DarkModeContext)
