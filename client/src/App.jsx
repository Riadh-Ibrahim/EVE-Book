import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Pages/register/signup'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/login/login'
import Home from './Pages/home'
import Landing from './Pages/landing'
import Profile from './Pages/profile/profile'
import Features from './Pages/features/features'
import About from './Pages/about/about'
import Services from './Pages/services/services'
import Admin from './Pages/admin/admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/register' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/home' element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/features' element={<Features />} />
        <Route path='/about' element={<About />} />
        <Route path='/services' element={<Services />} />
        <Route path='/admin' element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
