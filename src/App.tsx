import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import DashboardLayout from "./layouts/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Usuarios from "./pages/Usuarios"
import Adelantos from "./pages/Adelantos" 
import Operarios from "./pages/Operarios"
import MisAdelantos from "./pages/MisAdelantos"
import Descuentos from "./pages/Descuentos"
import Mapa from "./pages/Mapa"

const isAuthenticated = () => !!localStorage.getItem("token")

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={isAuthenticated() ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="adelantos" element={<Adelantos />} />
          <Route path="operarios" element={<Operarios />} />
          <Route path="mis-adelantos" element={<MisAdelantos />} />
          <Route path="descuentos" element={<Descuentos />} />
          <Route path="mapa" element={<Mapa />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
