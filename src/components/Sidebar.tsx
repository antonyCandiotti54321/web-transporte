import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Sidebar() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-gray-800 text-white p-4 flex flex-col justify-between transition-all duration-300`}
    >
      <div>
        <button
          onClick={toggleSidebar}
          className="mb-6 text-white hover:text-gray-400 focus:outline-none"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {!collapsed && <h2 className="text-xl font-bold mb-6">Bienvenido:</h2>}

        <nav className="flex flex-col gap-2">
          <Link to="/" className="hover:bg-gray-700 p-2 rounded">
            {!collapsed ? "Dashboard" : "🏠"}
          </Link>
          <Link to="/mapa" className="hover:bg-gray-700 p-2 rounded">
            {!collapsed ? "Mapa" : "🗺️"}
          </Link>
          <Link to="/usuarios" className="hover:bg-gray-700 p-2 rounded">
            {!collapsed ? "Usuarios" : "👥"}
          </Link>
          <Link to="/adelantos" className="hover:bg-gray-700 p-2 rounded">
            {!collapsed ? "Adelantos" : "💸"}
          </Link>
          <Link to="/operarios" className="hover:bg-gray-700 p-2 rounded">
            {!collapsed ? "Operarios" : "🧑‍🔧"}
          </Link>
          <Link to="/mis-adelantos" className="hover:bg-gray-700 p-2 rounded">
            {!collapsed ? "Mis Adelantos" : "📄"}
          </Link>
          <Link to="/descuentos" className="hover:bg-gray-700 p-2 rounded">
            {!collapsed ? "Descuentos" : "🏷️"}
          </Link>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className={`bg-red-500 hover:bg-red-600 mt-8 py-2 px-4 rounded ${
          collapsed ? "text-xs px-2" : ""
        }`}
      >
        {!collapsed ? "Cerrar sesión" : "🚪"}
      </button>
    </aside>
  )
}
