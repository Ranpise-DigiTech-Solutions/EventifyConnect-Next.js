import { Footer, Navbar } from '@/components/global'
import React from 'react'

const CancellationAndRefundPolicyLayout = ({ children } : { children: React.ReactNode }) => {
  return (
    <main className='h-screen'>
        <Navbar />
        {children}
        <Footer />
    </main>
  )
}

export default CancellationAndRefundPolicyLayout
