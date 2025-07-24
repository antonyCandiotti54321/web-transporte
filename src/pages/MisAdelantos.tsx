import { useEffect, useState } from "react"

type Adelanto = {
  id: number
  operarioNombre: string
  cantidad: number
  mensaje: string
  fechaHora: string
}

type Operario = {
  id: number
  nombre: string
}

export default function MisAdelantos() {
  const [adelantos, setAdelantos] = useState<Adelanto[]>([])
  const [operarios, setOperarios] = useState<Operario[]>([])
  const [cantidad, setCantidad] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [operarioId, setOperarioId] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")

  const token = localStorage.getItem("token") || ""
  const idUsuario = localStorage.getItem("idUsuario")

  const fetchAdelantos = async () => {
    if (!idUsuario || !token) {
      setError("Faltan credenciales.")
      return
    }

    try {
      const res = await fetch(`https://api-transporte-98xe.onrender.com/api/adelantos/choferes/${idUsuario}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("No se pudieron obtener tus adelantos")
      const data = await res.json()
      setAdelantos(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar tus adelantos")
    }
  }

  const fetchOperarios = async () => {
    try {
      const res = await fetch("https://api-transporte-98xe.onrender.com/api/operarios", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("No se pudo obtener operarios")
      const data = await res.json()
      setOperarios(data.map((o: any) => ({ id: o.id, nombre: o.nombreCompleto })))
    } catch (err: any) {
      setError(err.message || "Error cargando operarios")
    }
  }

  useEffect(() => {
    fetchAdelantos()
    fetchOperarios()
  }, [])

  const resetForm = () => {
    setEditId(null)
    setCantidad("")
    setMensaje("")
    setOperarioId("")
    setShowModal(false)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!idUsuario || !operarioId || !cantidad) {
      setError("Todos los campos son obligatorios")
      return
    }

    const payload = {
      usuarioId: Number(idUsuario),
      operarioId: Number(operarioId),
      cantidad: parseFloat(cantidad),
      mensaje,
    }

    const url = editId
      ? `https://api-transporte-98xe.onrender.com/api/adelantos/${editId}`
      : "https://api-transporte-98xe.onrender.com/api/adelantos"

    const method = editId ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Error al guardar adelanto")
      fetchAdelantos()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Error al guardar")
    }
  }

  const handleEdit = (a: Adelanto) => {
    const o = operarios.find((o) => o.nombre === a.operarioNombre)
    setEditId(a.id)
    setCantidad(a.cantidad.toString())
    setMensaje(a.mensaje || "")
    setOperarioId(o?.id.toString() || "")
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este adelanto?")) return
    try {
      const res = await fetch(`https://api-transporte-98xe.onrender.com/api/adelantos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("No se pudo eliminar")
      fetchAdelantos()
    } catch (err: any) {
      setError(err.message || "Error al eliminar")
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mis Adelantos</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Nuevo Adelanto
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Operario</th>
              <th className="py-2 px-4">Cantidad</th>
              <th className="py-2 px-4">Mensaje</th>
              <th className="py-2 px-4">Fecha</th>
              <th className="py-2 px-4">Acciones</th>
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
                <td className="py-2 px-4 flex gap-2">
                  <button onClick={() => handleEdit(a)} className="bg-yellow-400 text-white px-3 py-1 rounded">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">{editId ? "Editar Adelanto" : "Nuevo Adelanto"}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <select value={operarioId} onChange={(e) => setOperarioId(e.target.value)} className="border p-2 rounded">
                <option value="">Seleccione un Operario</option>
                {operarios.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="border p-2 rounded"
              />

              <div className="flex justify-end gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editId ? "Actualizar" : "Crear"}
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">
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
