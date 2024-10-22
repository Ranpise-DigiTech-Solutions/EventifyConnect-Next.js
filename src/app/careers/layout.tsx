import { Navbar, Footer } from '@/components/global'
import React from 'react'

const CareersLayout = ({ children } : { children: React.ReactNode }) => {
  return (
    <main className='min-h-screen'>
      <Navbar />
        {children}
        <Footer />
    </main>
  )
}

export default CareersLayout
