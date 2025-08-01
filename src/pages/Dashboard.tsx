import { useEffect, useState } from "react"

type Rol = "ADMIN" | "CHOFER"

type Usuario = {
  id: number
  nombreCompleto: string
  username: string
  rol: Rol
}

export default function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
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

        // Actualizar localStorage también si cambió
        localStorage.setItem("nombreCompleto", data.nombreCompleto)

      } catch (error) {
        console.error("Error al obtener datos del usuario:", error)
      }
    }

    fetchUsuario()
  }, [idUsuario, token])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">¡Hola, {usuario?.nombreCompleto || "Usuario"}!</h1>
      <p className="text-gray-700">Este es tu panel principal.</p>
    </div>
  )
}
