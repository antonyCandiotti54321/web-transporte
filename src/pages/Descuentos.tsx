import { useEffect, useState } from "react"

type Descuento = {
  operarioId: number
  nombreCompleto: string
  totalDescuento: number
}

export default function Descuentos() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDescuentos = async () => {
      try {
        const res = await fetch("https://api-transporte-98xe.onrender.com/api/adelantos/descuentos", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) throw new Error("Error al obtener los descuentos")

        const data = await res.json()
        setDescuentos(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Error desconocido al cargar los descuentos")
        }
      }
    }

    fetchDescuentos()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Descuentos a Operarios</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">Operario</th>
              <th className="py-2 px-4 text-left">Total a Descontar</th>
            </tr>
          </thead>
          <tbody>
            {descuentos.map((d) => (
              <tr key={d.operarioId} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{d.nombreCompleto}</td>
                <td className="py-2 px-4">S/ {d.totalDescuento.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
