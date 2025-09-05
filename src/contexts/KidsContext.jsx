'use client'

import React, { createContext, useContext, useState } from 'react'

const KidsContext = createContext()

export const useKids = () => {
  const context = useContext(KidsContext)
  if (!context) {
    throw new Error('useKids must be used within a KidsProvider')
  }
  return context
}

export const KidsProvider = ({ children }) => {
  const [isKidsMode, setIsKidsMode] = useState(false)

  const toggleKidsMode = () => {
    setIsKidsMode(prev => !prev)
  }

  const value = {
    isKidsMode,
    toggleKidsMode
  }

  return (
    <KidsContext.Provider value={value}>
      {children}
    </KidsContext.Provider>
  )
}

export default KidsContext