import { useEffect, useState } from "react"

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [username, setUsername] = useState("")
  const [rol, setRol] = useState("CHOFER")
  const [editId, setEditId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")

  const token = localStorage.getItem("token") || ""

  type Usuario = {
    id: number
    nombreCompleto: string
    username: string
    rol: string
  }

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("https://api-transporte-98xe.onrender.com/api/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("No se pudo obtener la lista de usuarios")

      const data = await res.json()
      setUsuarios(data.filter((u: Usuario) => u.rol === "CHOFER" || u.rol === "ADMIN"))
    } catch (err: any) {
      setError(err.message || "Error desconocido al cargar usuarios")
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const resetForm = () => {
    setEditId(null)
    setNombreCompleto("")
    setUsername("")
    setRol("CHOFER")
    setShowModal(false)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreCompleto || !username || !rol) {
      setError("Todos los campos son obligatorios")
      return
    }

    const method = editId ? "PATCH" : "POST"
    const url = editId
      ? `https://api-transporte-98xe.onrender.com/api/usuarios/${editId}`
      : "https://api-transporte-98xe.onrender.com/api/usuarios"

    const payload = {
      nombreCompleto,
      username,
      rol,
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
      if (!res.ok) throw new Error("Error al guardar usuario")
      resetForm()
      fetchUsuarios()
    } catch (err: any) {
      setError(err.message || "Error desconocido al guardar")
    }
  }

  const handleEdit = (u: Usuario) => {
    setEditId(u.id)
    setNombreCompleto(u.nombreCompleto)
    setUsername(u.username)
    setRol(u.rol)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return
    try {
      const res = await fetch(`https://api-transporte-98xe.onrender.com/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Error al eliminar usuario")
      fetchUsuarios()
    } catch (err: any) {
      setError(err.message || "Error desconocido al eliminar")
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Usuarios (CHOFER y ADMIN)</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Crear usuario
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Usuario</th>
              <th className="py-2 px-4 text-left">Rol</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{u.id}</td>
                <td className="py-2 px-4">{u.nombreCompleto}</td>
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4">{u.rol}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button onClick={() => handleEdit(u)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="bg-red-500 text-white px-3 py-1 rounded">
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
            <h2 className="text-xl font-bold mb-4">{editId ? "Editar Usuario" : "Crear Usuario"}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded"
              />
              <select value={rol} onChange={(e) => setRol(e.target.value)} className="border p-2 rounded">
                <option value="CHOFER">CHOFER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
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
