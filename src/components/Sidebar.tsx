import { Link, useNavigate } from "react-router-dom"

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const nombre = localStorage.getItem("nombreCompleto") || "Usuario"

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6">Bienvenido,</h2>
        <p className="mb-4">{nombre}</p>
        <nav className="flex flex-col gap-2">
          <Link to="/" className="hover:bg-gray-700 p-2 rounded">Dashboard</Link>
          <Link to="/mapa" className="hover:bg-gray-700 p-2 rounded">Mapa</Link>
          <Link to="/usuarios" className="hover:bg-gray-700 p-2 rounded">Usuarios</Link>
          <Link to="/adelantos" className="hover:bg-gray-700 p-2 rounded">Adelantos</Link>
          <Link to="/operarios" className="hover:bg-gray-700 p-2 rounded">Operarios</Link>
          <Link to="/mis-adelantos" className="hover:bg-gray-700 p-2 rounded">Mis Adelantos</Link>
          <Link to="/descuentos" className="hover:bg-gray-700 p-2 rounded">Descuentos</Link>

        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 mt-8 py-2 px-4 rounded"
      >
        Cerrar sesión
      </button>
    </aside>
  )
}
