import { useEffect, useState } from "react"

type Rol = "ADMIN" | "CHOFER"

type Usuario = {
  id: number
  nombreCompleto: string
  username: string
  rol: Rol
}

type DatabaseStatsResponse = {
  databaseName: string
  totalSizeMB: string
  totalSizeGB: string
}

export default function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [dbStats, setDbStats] = useState<DatabaseStatsResponse | null>(null)

  const idUsuario = localStorage.getItem("idUsuario")
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchUsuario = async () => {
      if (!idUsuario || !token) return

      try {
        const res = await fetch(`https://api-transporte-98xe.onrender.com/api/usuarios/${idUsuario}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Error al obtener el usuario")
        const data = await res.json()
        setUsuario(data)
        localStorage.setItem("nombreCompleto", data.nombreCompleto)
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error)
      }
    }

    const fetchDatabaseStats = async () => {
      if (!token) return

      try {
        const res = await fetch(`https://api-transporte-98xe.onrender.com/api/database/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Error al obtener estadísticas de la base de datos")
        const data = await res.json()

        const filteredData: DatabaseStatsResponse = {
          databaseName: data.databaseName,
          totalSizeMB: data.totalSizeMB,
          totalSizeGB: data.totalSizeGB,
        }

        setDbStats(filteredData)
      } catch (error) {
        console.error("Error al obtener estadísticas de la base de datos:", error)
      }
    }

    fetchUsuario()
    fetchDatabaseStats()
  }, [idUsuario, token])

  const usedPercentage = dbStats
    ? Math.min((parseFloat(dbStats.totalSizeMB) / 1024) * 100, 100)
    : 0

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">¡Hola, {usuario?.nombreCompleto || "Usuario"}!</h1>
      <p className="text-gray-700 mb-6">Este es tu panel principal.</p>

      {/* Bloque de información del usuario */}
      {usuario && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">👤 Información de Usuario</h2>
          <p><strong>Nombre completo:</strong> {usuario.nombreCompleto}</p>
          <p><strong>Usuario:</strong> {usuario.username}</p>
          <p><strong>Contraseña:</strong> ********</p>
          <p><strong>Rol:</strong> {usuario.rol}</p>
        </div>
      )}

      {/* Bloque de estadísticas de base de datos */}
      {dbStats && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">📦 Uso de Memoria</h2>
          <p><strong>Base de datos:</strong> {dbStats.databaseName}</p>
          <p><strong>Total (MB):</strong> {dbStats.totalSizeMB}</p>
          <p><strong>Total (GB):</strong> {dbStats.totalSizeGB}</p>

          {/* Barra de progreso */}
          <div className="mt-4">
            <p className="mb-1 text-sm text-gray-600">
              Uso de almacenamiento ({usedPercentage.toFixed(2)}%)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${usedPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
