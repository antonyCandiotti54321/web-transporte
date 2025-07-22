import { useEffect, useState } from "react"

type Usuario = {
  id: number
  nombreCompleto: string
  username: string
  rol: string
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch("https://api-transporte-98xe.onrender.com/api/usuarios", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) throw new Error("No se pudo obtener la lista de usuarios")

        const data = await res.json()

        const filtrados = data
          .filter((u: any) => u.rol === "CHOFER" || u.rol === "ADMIN")
          .slice(0, 4)

        setUsuarios(filtrados)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Error desconocido al cargar usuarios")
        }
      }
    }

    fetchUsuarios()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Usuarios (CHOFER y ADMIN)</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Usuario</th>
              <th className="py-2 px-4 text-left">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{u.id}</td>
                <td className="py-2 px-4">{u.nombreCompleto}</td>
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4">{u.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
