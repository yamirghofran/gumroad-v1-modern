import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/pages/Dashboard'
import Links from '@/pages/Links'
import Signup from '@/pages/Signup'
import Login from '@/pages/Login'
import PrivateRoute from '@/components/PrivateRoute'
import ResetPassword from '@/pages/ResetPassword'
import Link from '@/pages/Link'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip.jsx'
import PurchasePage from './pages/PurchasePage'
import CheckoutReturn from './pages/CheckoutReturn'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <TooltipProvider>
    <Routes>
      <Route path="/" element={<Sidebar />}>
        <Route index element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/links" element={<PrivateRoute element={<Links />} />} />
        <Route path="/links/:id" element={<PrivateRoute element={<Link />} />} />
      </Route>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/l/:url" element={<PurchasePage />} />
      <Route path="/checkout/return" element={<CheckoutReturn />} />
    </Routes>
    </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
