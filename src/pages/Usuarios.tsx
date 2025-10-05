
import { useEffect, useState } from "react"

type Rol = "ADMIN" | "CHOFER"

type Usuario = {
  id: number
  nombreCompleto: string
  username: string
  rol: Rol
}

// Función para decodificar JWT y obtener información del usuario
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decodificando token:', error)
    return null
  }
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [rol, setRol] = useState<Rol>("CHOFER")
  const [editId, setEditId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")

  // Usar useState para el token para que se actualice reactivamente
  const [token, setToken] = useState(localStorage.getItem("token") || "")

  // Obtener información del usuario actual del token
  const getCurrentUserFromToken = () => {
    if (!token) return null
    return decodeToken(token)
  }

  // Verificar si el usuario está editando su propio perfil
  const isEditingSelf = (editingUserId: number) => {
    const currentUser = getCurrentUserFromToken()
    if (!currentUser) return false
    return currentUser.userId === editingUserId
  }

  const fetchUsuarios = async (tokenToUse: string = token) => {
    try {
      const res = await fetch("https://api-transporte-98xe.onrender.com/api/usuarios", {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      })
      
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token")
        setToken("")
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        return
      }
      
      if (!res.ok) throw new Error("No se pudo obtener la lista de usuarios")
      const data = await res.json()

      if (Array.isArray(data.content)) {
        setUsuarios(
          data.content.filter(
            (u: Usuario) => u.rol === "CHOFER" || u.rol === "ADMIN"
          )
        )
      } else {
        console.error("Formato inesperado de la API:", data)
        setUsuarios([])
      }
    } catch (err: any) {
      setError(err.message || "Error desconocido al cargar usuarios")
    }
  }

  useEffect(() => {
    if (token) {
      fetchUsuarios()
    }
  }, [token])

  const resetForm = () => {
    setEditId(null)
    setNombreCompleto("")
    setUsername("")
    setPassword("")
    setRepeatPassword("")
    setRol("CHOFER")
    setShowModal(false)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
  
    if (!nombreCompleto || !username || !rol) {
      setError("Todos los campos son obligatorios")
      return
    }
  
    const isEditing = !!editId
  
    if (!isEditing && (!password || !repeatPassword)) {
      setError("Debes ingresar y repetir la contraseña al crear")
      return
    }
  
    if ((password || repeatPassword) && password !== repeatPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
  
    const method = isEditing ? "PATCH" : "POST"
    const url = isEditing
      ? `https://api-transporte-98xe.onrender.com/api/usuarios/${editId}`
      : "https://api-transporte-98xe.onrender.com/api/auth/register"
  
    const payload: any = {
      nombreCompleto,
      username,
      rol,
    }
  
    if (password) payload.password = password
  
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
        
        if (res.status === 400 && typeof errorData === 'object' && !errorData.error) {
          const errorMessages = Object.values(errorData).join('.\n') + '.'
          setError(errorMessages)
        } else {
          setError(errorData.error || "Error al guardar usuario")
        }
        return
      }
  
      const data = await res.json().catch(() => ({}))
  
      if (data.newToken) {
        console.log("✅ Token renovado automáticamente:", data.message)
        setToken(data.newToken)
        localStorage.setItem("token", data.newToken)
  
        const decoded = decodeToken(data.newToken)
        if (decoded?.nombreCompleto) {
          localStorage.setItem("nombreCompleto", decoded.nombreCompleto)
        }
  
        alert(`✅ ${data.message}`)
        setError("")
        resetForm()
        await fetchUsuarios(data.newToken)
      } else {
        alert(`✅ Usuario actualizado correctamente`)
        setError("")
        resetForm()
        await fetchUsuarios()
      }
  
    } catch (err: any) {
      setError("Error de conexión")
    }
  }

  const handleEdit = (u: Usuario) => {
    setEditId(u.id)
    setNombreCompleto(u.nombreCompleto)
    setUsername(u.username)
    setRol(u.rol)
    setPassword("")
    setRepeatPassword("")
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
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || "Error al eliminar usuario")
        return
      }
      fetchUsuarios()
    } catch (err: any) {
      setError("Error de conexión al eliminar")
    }
  }

  const currentUser = getCurrentUserFromToken()

  return (
    <div className="max-w-2xl mx-auto px-4 text-sm">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-semibold">Usuarios (CHOFER y ADMIN)</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-3 py-1 rounded">
          Crear usuario
        </button>
      </div>

      {error && <pre className="text-red-500 mb-3 whitespace-pre-line">{error}</pre>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-1.5 px-2 text-left">ID</th>
              <th className="py-1.5 px-2 text-left">Nombre</th>
              <th className="py-1.5 px-2 text-left">Usuario</th>
              <th className="py-1.5 px-2 text-left">Rol</th>
              <th className="py-1.5 px-2 text-left">Contraseña</th>
              <th className="py-1.5 px-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="py-1.5 px-2">{u.id}</td>
                <td className="py-1.5 px-2">
                  {u.nombreCompleto}
                  {currentUser?.userId === u.id && (
                    <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                      Tú
                    </span>
                  )}
                </td>
                <td className="py-1.5 px-2">{u.username}</td>
                <td className="py-1.5 px-2">{u.rol}</td>
                <td className="py-1.5 px-2">••••••</td>
                <td className="py-1.5 px-2 flex gap-1">
                  <button
                    onClick={() => handleEdit(u)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-2.5 py-1 text-xs rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 text-xs rounded"
                  >
                    Eliminar
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
            <h2 className="text-lg font-semibold mb-3">
              {editId ? "Editar Usuario" : "Crear Usuario"}
              {editId && isEditingSelf(editId) && (
                <span className="text-sm text-orange-600 block mt-1">
                  ⚠️ Estás editando tu propio perfil - Se renovará tu token automáticamente
                </span>
              )}
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
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="password"
                placeholder={editId ? "Nueva contraseña (opcional)" : "Contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <input
                type="password"
                placeholder={editId ? "Repetir nueva contraseña" : "Repetir contraseña"}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as Rol)}
                className="border p-2 rounded text-sm"
              >
                <option value="CHOFER">CHOFER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
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
