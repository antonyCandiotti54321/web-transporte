import { useEffect, useState } from "react"

type Operario = {
  id: number
  nombreCompleto: string
}

export default function Operarios() {
  const [operarios, setOperarios] = useState<Operario[]>([])
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState("id")

  const token = localStorage.getItem("token") || ""

  const fetchOperarios = async () => {
    try {
      const res = await fetch(
        `https://api-transporte-98xe.onrender.com/api/operarios?page=0&size=10&sort=${sortBy},asc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) throw new Error("No se pudo obtener la lista de operarios")
      const data = await res.json()
      setOperarios(data.content)
    } catch (err: any) {
      setError(err.message || "Error desconocido al cargar operarios")
    }
  }

  useEffect(() => {
    fetchOperarios()
  }, [sortBy]) // se vuelve a ejecutar cuando cambia el criterio de ordenamiento

  const resetForm = () => {
    setEditId(null)
    setNombreCompleto("")
    setShowModal(false)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!nombreCompleto.trim()) {
      setError("El nombre no puede estar vacío")
      return
    }

    const method = editId ? "PUT" : "POST"
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

      if (!res.ok) {
        const errorData = await res.json()
        if (res.status === 400 && typeof errorData === "object") {
          const errorMessages = Object.values(errorData).join(".\n") + "."
          setError(errorMessages)
        } else {
          setError(errorData.error || "Error al guardar operario")
        }
        return
      }

      resetForm()
      fetchOperarios()
    } catch (err: any) {
      setError(err.message || "Error desconocido al guardar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este operario?")) return

    setError("")

    try {
      const res = await fetch(`https://api-transporte-98xe.onrender.com/api/operarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        if (res.status === 403) {
          setError(errorData.error || "No tienes permisos para realizar esta acción")
        } else if (res.status === 400 && typeof errorData === "object") {
          const errorMessages = Object.values(errorData).join(".\n") + "."
          setError(errorMessages)
        } else {
          setError(errorData.error || "Error al eliminar operario")
        }
        return
      }

      fetchOperarios()
    } catch (err: any) {
      setError(err.message || "Error desconocido al eliminar")
    }
  }

  const handleEdit = (op: Operario) => {
    setEditId(op.id)
    setNombreCompleto(op.nombreCompleto)
    setShowModal(true)
  }

return (
  <div className="max-w-2xl mx-auto px-4 text-sm">
    <div className="flex justify-between items-center mb-3">
      <h1 className="text-lg font-semibold">Listado de Operarios</h1>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        Crear Operario
      </button>
    </div>

    <div className="mb-3">
      <label className="block font-medium mb-1">Ordenar por:</label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="id">ID</option>
        <option value="nombreCompleto">Nombre Completo</option>
      </select>
    </div>

    {error && <pre className="text-red-500 mb-3 whitespace-pre-line">{error}</pre>}

    <table className="min-w-full bg-white shadow rounded text-sm">
      <thead className="bg-gray-200 text-gray-700">
        <tr>
          <th className="py-1.5 px-2 text-left">ID</th>
          <th className="py-1.5 px-2 text-left w-[300px]">Nombre Completo</th>
          <th className="py-1.5 px-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {operarios.map((op) => (
          <tr key={op.id} className="border-t hover:bg-gray-50">
            <td className="py-1.5 px-2">{op.id}</td>
            <td className="py-1.5 px-2">{op.nombreCompleto}</td>
            <td className="py-1.5 px-2 flex gap-2">
              <button
                onClick={() => handleEdit(op)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-2.5 py-1 text-xs rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(op.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 text-xs rounded"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Aquí puedes insertar la paginación */}
    <div className="mt-4 flex justify-center items-center gap-2 text-sm">
      {/* ejemplo de paginación simple */}
      <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Anterior</button>
      <span>Página 1 de 3</span>
      <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Siguiente</button>
    </div>

    {showModal && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 text-sm">
        <div className="bg-white p-5 rounded-lg w-full max-w-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-3">
            {editId ? "Editar Operario" : "Crear Operario"}
          </h2>

          {error && <pre className="text-red-500 mb-3 whitespace-pre-line">{error}</pre>}

          <form onSubmit={handleSubmit} className="grid gap-3">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="border p-2 rounded text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                {editId ? "Actualizar" : "Crear"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
)

}
