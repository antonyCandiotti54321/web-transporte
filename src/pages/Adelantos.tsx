import { useEffect, useState } from "react"

type Adelanto = {
  id: number
  usuarioNombre: string
  operarioNombre: string
  cantidad: number
  mensaje: string
  fechaHora: string
  fechaActualizacion: string | null
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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [selectedAdelanto, setSelectedAdelanto] = useState<Adelanto | null>(null)


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
    console.log("DEBUG adelantos:", data)

if (Array.isArray(data)) {
  setAdelantos(data)
  setError("") // ✅ limpia error
} else if (Array.isArray(data.content)) {
  setAdelantos(data.content)
  setError("") // ✅ limpia error
} else {
  setAdelantos([])
  setError("La API no devolvió un array válido")
  console.error("La API no devolvió un array:", data)
}

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
    setFieldErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    if (!usuarioId || !operarioId || !cantidad) {
      setError("Los campos(Usuario, Operario, Cantidad) son obligatorios")
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

      if (!res.ok) {
        const errorData = await res.json()

        if (res.status === 400 && typeof errorData === "object") {
          setFieldErrors(errorData)
          const general = Object.values(errorData).join(".\n") + "."
          setError(general)
        } else {
          setError(errorData.error || "Error al guardar adelanto")
        }

        return
      }

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
  <div className="max-w-5xl mx-auto px-4 text-sm">
    <div className="flex justify-between items-center mb-3">
      <h1 className="text-lg font-semibold">Listado de Adelantos</h1>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        Crear adelanto
      </button>
    </div>

    {error && <p className="text-red-500 mb-3 whitespace-pre-line">{error}</p>}

    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded text-sm">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="py-1.5 px-2">ID</th>
            <th className="py-1.5 px-2">Usuario</th>
            <th className="py-1.5 px-2">Operario</th>
            <th className="py-1.5 px-2">Cantidad</th>
            <th className="py-1.5 px-2">Mensaje</th>
            <th className="py-1.5 px-2">Fecha/Hora</th>
            <th className="py-1.5 px-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {adelantos.map((a) => (
            <tr key={a.id} className="border-t hover:bg-gray-50">
              <td className="py-1.5 px-2">{a.id}</td>

              <td className="py-1.5 px-2 max-w-[180px] truncate" title={a.usuarioNombre}>
                {a.usuarioNombre.length > 17 ? a.usuarioNombre.slice(0, 17) + "…" : a.usuarioNombre}
              </td>

              <td className="py-1.5 px-2 max-w-[180px] truncate" title={a.operarioNombre}>
                {a.operarioNombre.length > 17 ? a.operarioNombre.slice(0, 17) + "…" : a.operarioNombre}
              </td>

              <td className="py-1.5 px-2 w-[120px] text-nowrap">
                S/ {a.cantidad.toFixed(2)}
              </td>

              <td className="py-1.5 px-2 max-w-[180px] truncate" title={a.mensaje}>
                {a.mensaje.length > 17 ? a.mensaje.slice(0, 17) + "…" : a.mensaje}
              </td>

              <td
                className="py-1.5 px-2 max-w-[100px] truncate"
                title={new Date(a.fechaHora).toLocaleString("es-PE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              >
                {new Date(a.fechaHora).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </td>

              <td className="py-1.5 px-2 w-[240px] flex gap-2">
                <button
                  onClick={() => handleEdit(a)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-2.5 py-1 text-xs rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 text-xs rounded"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedAdelanto(a)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 text-xs rounded"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {showModal && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 text-sm">
        <div className="bg-white p-5 rounded-lg w-full max-w-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-3">{editId ? "Editar Adelanto" : "Crear Adelanto"}</h2>

          <form onSubmit={handleSubmit} className="grid gap-3">
            {error &&
              !fieldErrors.usuarioId &&
              !fieldErrors.operarioId &&
              !fieldErrors.cantidad &&
              !fieldErrors.mensaje && (
                <p className="text-red-500 whitespace-pre-line">{error}</p>
              )}

            <div>
              <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                className={`border p-2 rounded w-full ${fieldErrors.usuarioId ? "border-red-500" : ""}`}
              >
                <option value="">Seleccione un Usuario</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
              {fieldErrors.usuarioId && <p className="text-red-500 text-sm">{fieldErrors.usuarioId}</p>}
            </div>

            <div>
              <select
                value={operarioId}
                onChange={(e) => setOperarioId(e.target.value)}
                className={`border p-2 rounded w-full ${fieldErrors.operarioId ? "border-red-500" : ""}`}
              >
                <option value="">Seleccione un Operario</option>
                {operarios.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre}
                  </option>
                ))}
              </select>
              {fieldErrors.operarioId && <p className="text-red-500 text-sm">{fieldErrors.operarioId}</p>}
            </div>

            <div>
              <input
                type="number"
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className={`border p-2 rounded w-full ${fieldErrors.cantidad ? "border-red-500" : ""}`}
              />
              {fieldErrors.cantidad && <p className="text-red-500 text-sm">{fieldErrors.cantidad}</p>}
            </div>

            <div>
              <input
                type="text"
                placeholder="Mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className={`border p-2 rounded w-full ${fieldErrors.mensaje ? "border-red-500" : ""}`}
              />
              {fieldErrors.mensaje && <p className="text-red-500 text-sm">{fieldErrors.mensaje}</p>}
            </div>

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

    {selectedAdelanto && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4 text-sm">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
          <h2 className="text-lg font-semibold mb-4">Detalle del Adelanto</h2>

          <div className="grid grid-cols-1 gap-3 select-text break-words">
            <div>
              <span className="font-semibold">ID:</span> <span>{selectedAdelanto.id}</span>
            </div>
            <div>
              <span className="font-semibold">Usuario:</span> <span>{selectedAdelanto.usuarioNombre}</span>
            </div>
            <div>
              <span className="font-semibold">Operario:</span> <span>{selectedAdelanto.operarioNombre}</span>
            </div>
            <div>
              <span className="font-semibold">Cantidad:</span> <span>S/ {selectedAdelanto.cantidad.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-semibold">Mensaje:</span>{" "}
              <span className="whitespace-pre-wrap break-words">{selectedAdelanto.mensaje}</span>
            </div>
            <div>
              <span className="font-semibold">Fecha de creación:</span>{" "}
              <span>
                {new Date(selectedAdelanto.fechaHora).toLocaleString("es-PE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div>
              <span className="font-semibold">Fecha de actualización:</span>{" "}
              <span>
                {selectedAdelanto.fechaActualizacion
                  ? new Date(selectedAdelanto.fechaActualizacion).toLocaleString("es-PE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "Nunca modificado"}
              </span>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setSelectedAdelanto(null)}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)

}
