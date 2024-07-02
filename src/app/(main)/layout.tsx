
import React from 'react'

const SiteLayout = ({ children } : { children: React.ReactNode }) => {
  return (
    <main className='h-screen'>
        {children}
    </main>
  )
}

export default SiteLayout
