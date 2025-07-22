import { useEffect, useState } from "react"

type Operario = {
  id: number
  nombreCompleto: string
}

export default function Operarios() {
  const [operarios, setOperarios] = useState<Operario[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOperarios = async () => {
      try {
        const res = await fetch("https://api-transporte-98xe.onrender.com/api/operarios", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) throw new Error("No se pudo obtener la lista de operarios")

        const data = await res.json()
        setOperarios(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Error desconocido al cargar operarios")
        }
      }
    }

    fetchOperarios()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Listado de Operarios</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre Completo</th>
            </tr>
          </thead>
          <tbody>
            {operarios.map((op) => (
              <tr key={op.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{op.id}</td>
                <td className="py-2 px-4">{op.nombreCompleto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
