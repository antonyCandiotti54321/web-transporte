import { useEffect, useState } from "react"

type Adelanto = {
  id: number
  usuarioNombre: string
  operarioNombre: string
  cantidad: number
  mensaje: string
  fechaHora: string
}

type Usuario = { id: number; nombre: string }

type Operario = { id: number; nombre: string }

export default function Adelantos() {
  const [adelantos, setAdelantos] = useState<Adelanto[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [operarios, setOperarios] = useState<Operario[]>([])

  const [usuarioId, setUsuarioId] = useState("")
  const [operarioId, setOperarioId] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")
  const token = localStorage.getItem("token") || ""

  const fetchAdelantos = async () => {
    if (!token) return setError("Token no disponible.")
    try {
      const res = await fetch("https://api-transporte-98xe.onrender.com/api/adelantos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) throw new Error("Acceso denegado. Verifica tu token.")
      if (!res.ok) throw new Error("No se pudo obtener la lista de adelantos")
      const data = await res.json()
      setAdelantos(data)
    } catch (err: any) {
      setError(err.message || "Error desconocido al cargar adelantos")
    }
  }

  const fetchUsuariosYOperarios = async () => {
    if (!token) return setError("Token no disponible.")
    try {
      const [resU, resO] = await Promise.all([
        fetch("https://api-transporte-98xe.onrender.com/api/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://api-transporte-98xe.onrender.com/api/operarios", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      if (!resU.ok || !resO.ok) throw new Error("Error al obtener usuarios u operarios")
      const uData = await resU.json()
      const oData = await resO.json()
      setUsuarios(uData.map((u: any) => ({ id: u.id, nombre: u.nombreCompleto })))
      setOperarios(oData.map((o: any) => ({ id: o.id, nombre: o.nombreCompleto })))
    } catch (err: any) {
      setError(err.message || "Error cargando usuarios/operarios")
    }
  }

  useEffect(() => {
    fetchAdelantos()
    fetchUsuariosYOperarios()
  }, [])

  const resetForm = () => {
    setEditId(null)
    setUsuarioId("")
    setOperarioId("")
    setCantidad("")
    setMensaje("")
    setShowModal(false)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuarioId || !operarioId || !cantidad) {
      setError("Todos los campos son obligatorios")
      return
    }

    const method = editId ? "PATCH" : "POST"
    const url = editId
      ? `https://api-transporte-98xe.onrender.com/api/adelantos/${editId}`
      : "https://api-transporte-98xe.onrender.com/api/adelantos"

    const payload = {
      usuarioId: Number(usuarioId),
      operarioId: Number(operarioId),
      cantidad: parseFloat(cantidad),
      mensaje: mensaje || "",
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (res.status === 403) throw new Error("No tienes permiso para realizar esta acción.")
      if (!res.ok) throw new Error("Error al guardar adelanto")
      resetForm()
      fetchAdelantos()
    } catch (err: any) {
      setError(err.message || "Error desconocido al guardar")
    }
  }

  const handleEdit = (a: Adelanto) => {
    const u = usuarios.find((u) => u.nombre === a.usuarioNombre)
    const o = operarios.find((o) => o.nombre === a.operarioNombre)
    setEditId(a.id)
    setUsuarioId(u?.id.toString() || "")
    setOperarioId(o?.id.toString() || "")
    setCantidad(a.cantidad.toString())
    setMensaje(a.mensaje || "")
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este adelanto?")) return
    try {
      const res = await fetch(`https://api-transporte-98xe.onrender.com/api/adelantos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.status === 403) throw new Error("No tienes permiso para eliminar este adelanto.")
      if (!res.ok) throw new Error("Error al eliminar adelanto")
      fetchAdelantos()
    } catch (err: any) {
      setError(err.message || "Error desconocido al eliminar")
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Listado de Adelantos</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Crear adelanto
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Usuario</th>
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
                <td className="py-2 px-4">{a.usuarioNombre}</td>
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
            <h2 className="text-xl font-bold mb-4">{editId ? "Editar Adelanto" : "Crear Adelanto"}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} className="border p-2 rounded">
                <option value="">Seleccione un Usuario</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
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
