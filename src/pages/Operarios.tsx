import { useEffect, useState } from "react"

type Operario = {
  id: number
  nombreCompleto: string
}

export default function Operarios() {
  const [operarios, setOperarios] = useState<Operario[]>([])
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [error, setError] = useState("")

  const token = localStorage.getItem("token") || ""

  const fetchOperarios = async () => {
    try {
      const res = await fetch("https://api-transporte-98xe.onrender.com/api/operarios", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("No se pudo obtener la lista de operarios")
      const data = await res.json()
      setOperarios(data)
    } catch (err: any) {
      setError(err.message || "Error desconocido al cargar operarios")
    }
  }

  useEffect(() => {
    fetchOperarios()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreCompleto.trim()) return

    const method = editId ? "PATCH" : "POST"
    const url = editId
      ? `https://api-transporte-98xe.onrender.com/api/operarios/${editId}`
      : "https://api-transporte-98xe.onrender.com/api/operarios"

    const body = JSON.stringify({ nombreCompleto })

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      })
      if (!res.ok) throw new Error("Error al guardar operario")
      setNombreCompleto("")
      setEditId(null)
      fetchOperarios()
    } catch (err: any) {
      setError(err.message || "Error desconocido al guardar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este operario?")) return
    try {
      const res = await fetch(`https://api-transporte-98xe.onrender.com/api/operarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Error al eliminar operario")
      fetchOperarios()
    } catch (err: any) {
      setError(err.message || "Error desconocido al eliminar")
    }
  }

  const handleEdit = (op: Operario) => {
    setEditId(op.id)
    setNombreCompleto(op.nombreCompleto)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Listado de Operarios</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          className="border p-2 rounded flex-1"
          placeholder="Nombre del operario"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editId ? "Actualizar" : "Crear"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null)
              setNombreCompleto("")
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        )}
      </form>

      <table className="min-w-full bg-white shadow rounded">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="py-2 px-4 text-left">ID</th>
            <th className="py-2 px-4 text-left">Nombre Completo</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operarios.map((op) => (
            <tr key={op.id} className="border-t hover:bg-gray-50">
              <td className="py-2 px-4">{op.id}</td>
              <td className="py-2 px-4">{op.nombreCompleto}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  onClick={() => handleEdit(op)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(op.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
