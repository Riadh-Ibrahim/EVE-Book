import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Pages/register/signup'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './Pages/login/login'
import Home from './Pages/home'
import Landing from './Pages/landing'
import Profile from './Pages/profile/profile'
import Features from './Pages/features/features'
import About from './Pages/about/about'
import Services from './Pages/services/services'
import PrivateRoute from './Components/PrivateRoute'

function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing />}></Route>
      <Route path='/register' element={<Signup />}></Route>
      <Route path='/login' element={<Login />}></Route>
      <Route path='/home' element={<Home />}></Route>
      <Route path='/profile' element={<Profile />}></Route>
      <Route path='/features' element={<Features />}></Route>
      <Route path='/about' element={<About />}></Route>
      <Route path='/services' element={<Services />}></Route>
    </Routes>
   </BrowserRouter>
  )
}

export default App