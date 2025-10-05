import { useEffect, useState } from "react"

type DescuentoSemanal = {
  inicioSemana: string
  finSemana: string
  totalDescuento: number
}

type Descuento = {
  operarioId: number
  nombreCompleto: string
  semanas: DescuentoSemanal[]
}

export default function Descuentos() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [semanasUnicas, setSemanasUnicas] = useState<string[]>([])
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string>("")
  const [error, setError] = useState("")

  const cargarDescuentos = async () => {
    try {
      const res = await fetch("https://api-transporte-98xe.onrender.com/api/adelantos/descuentos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!res.ok) throw new Error("Error al obtener los descuentos")

      const json = await res.json()
      // ✅ aseguramos que sea un array (viene en json.content)
      const lista: Descuento[] = Array.isArray(json.content) ? json.content : []
      setDescuentos(lista)

      // Extraer semanas únicas
      const semanas = new Set<string>()
      lista.forEach((d) =>
        d.semanas.forEach((s) => {
          const clave = `${s.inicioSemana} - ${s.finSemana}`
          semanas.add(clave)
        })
      )

      const ordenadas = Array.from(semanas).sort().reverse()
      setSemanasUnicas(ordenadas)
      setSemanaSeleccionada(ordenadas[0] || "")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error desconocido al cargar los descuentos")
      }
    }
  }

  useEffect(() => {
    cargarDescuentos()
  }, [])

  const handleEliminarSemana = async () => {
    if (!semanaSeleccionada) return

    const [inicioStr, finStr] = semanaSeleccionada.split(" - ")
    const inicio = new Date(`${inicioStr}T00:00:00-05:00`).toISOString()
    const fin = new Date(`${finStr}T23:59:59-05:00`).toISOString()

    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas eliminar todos los descuentos de la semana ${semanaSeleccionada}?`
    )
    if (!confirmacion) return

    try {
      const res = await fetch("https://api-transporte-98xe.onrender.com/api/adelantos/descuentos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ fechaInicio: inicio, fechaFin: fin }),
      })

      if (!res.ok) throw new Error("Error al eliminar los descuentos")

      await cargarDescuentos()
      alert("Descuentos eliminados correctamente.")
    } catch (err: any) {
      alert(err.message || "Error inesperado al eliminar descuentos")
    }
  }

  // Filtrar descuentos según la semana seleccionada
  const descuentosFiltrados = descuentos.map((d) => {
    const semana = d.semanas.find(
      (s) => `${s.inicioSemana} - ${s.finSemana}` === semanaSeleccionada
    )
    return {
      operarioId: d.operarioId,
      nombreCompleto: d.nombreCompleto,
      totalDescuento: semana ? semana.totalDescuento : 0,
    }
  })

  return (
    <div className="max-w-2xl mx-auto px-4 text-sm">
      <h1 className="text-lg font-semibold mb-3">Descuentos a Operarios</h1>

      {error && <p className="text-red-500 mb-3 whitespace-pre-line">{error}</p>}

      {/* Selector de semanas */}
      <div className="mb-3 flex items-center gap-4">
        <div>
          <label className="mr-2 font-medium">Semana (Sábado - Viernes):</label>
          <select
            className="border px-2 py-1 rounded text-sm"
            value={semanaSeleccionada}
            onChange={(e) => setSemanaSeleccionada(e.target.value)}
          >
            {semanasUnicas.map((semana) => (
              <option key={semana} value={semana}>
                {semana}
              </option>
            ))}
          </select>
        </div>

        <button
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          onClick={handleEliminarSemana}
          disabled={!semanaSeleccionada}
        >
          Eliminar descuentos de esta semana
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-1.5 px-2 text-left">Operario</th>
              <th className="py-1.5 px-2 text-left">Total a Descontar</th>
            </tr>
          </thead>
          <tbody>
            {descuentosFiltrados.map((d) => (
              <tr key={d.operarioId} className="border-t hover:bg-gray-50">
                <td className="py-1.5 px-2">{d.nombreCompleto}</td>
                <td className="py-1.5 px-2">S/ {d.totalDescuento.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
