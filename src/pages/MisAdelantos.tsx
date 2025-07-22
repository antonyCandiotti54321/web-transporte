import { useEffect, useState } from "react"

type Adelanto = {
  id: number
  operarioNombre: string
  cantidad: number
  mensaje: string
  fechaHora: string
}

export default function MisAdelantos() {
  const [adelantos, setAdelantos] = useState<Adelanto[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const idUsuario = localStorage.getItem("idUsuario")

    if (!idUsuario) {
      setError("No se encontró el ID del usuario.")
      return
    }

    const fetchAdelantos = async () => {
      try {
        const res = await fetch(`https://api-transporte-98xe.onrender.com/api/adelantos/choferes/${idUsuario}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) throw new Error("No se pudieron obtener tus adelantos")

        const data = await res.json()
        setAdelantos(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Error desconocido al cargar los adelantos")
        }
      }
    }

    fetchAdelantos()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mis Adelantos</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Operario</th>
              <th className="py-2 px-4 text-left">Cantidad</th>
              <th className="py-2 px-4 text-left">Mensaje</th>
              <th className="py-2 px-4 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {adelantos.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{a.id}</td>
                <td className="py-2 px-4">{a.operarioNombre}</td>
                <td className="py-2 px-4">S/ {a.cantidad.toFixed(2)}</td>
                <td className="py-2 px-4">{a.mensaje}</td>
                <td className="py-2 px-4">
                  {new Date(a.fechaHora).toLocaleString("es-PE", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
