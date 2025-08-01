
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
    
    // Comparar el userId del token con el ID del usuario que se está editando
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
        // Token inválido, limpiar y mostrar error
        localStorage.removeItem("token")
        setToken("")
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        return
      }
      
      if (!res.ok) throw new Error("No se pudo obtener la lista de usuarios")
      const data = await res.json()
      setUsuarios(data.filter((u: Usuario) => u.rol === "CHOFER" || u.rol === "ADMIN"))
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
      
      const data = await res.json()
      
      // *** NUEVA LÓGICA: Verificar si se devolvió un nuevo token ***
      if (data.newToken) {
        // El usuario editó su propio perfil, actualizar token
        console.log("✅ Token renovado automáticamente:", data.message)
        setToken(data.newToken)
        localStorage.setItem("token", data.newToken)
        
        // Mostrar mensaje de éxito
        setError("") // Limpiar errores
        alert(`✅ ${data.message}`)
        
        resetForm()
        // Recargar usuarios con el nuevo token
        await fetchUsuarios(data.newToken)
      } else {
        // Actualización normal de otro usuario
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

  // Obtener información del usuario actual para mostrar en la UI
  const currentUser = getCurrentUserFromToken()

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Usuarios (CHOFER y ADMIN)</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Crear usuario
        </button>
      </div>

      {/* Mostrar información del usuario actual */}
      {currentUser && (
        <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
          <strong>Usuario actual:</strong> {currentUser.sub} ({currentUser.role}) - ID: {currentUser.userId}
        </div>
      )}

      {error && <pre className="text-red-500 mb-4 whitespace-pre-line">{error}</pre>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Usuario</th>
              <th className="py-2 px-4 text-left">Rol</th>
              <th className="py-2 px-4 text-left">Contraseña</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{u.id}</td>
                <td className="py-2 px-4">
                  {u.nombreCompleto}
                  {currentUser?.userId === u.id && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Tú
                    </span>
                  )}
                </td>
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4">{u.rol}</td>
                <td className="py-2 px-4">••••••</td>
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
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Editar Usuario" : "Crear Usuario"}
              {editId && isEditingSelf(editId) && (
                <span className="text-sm text-orange-600 block mt-1">
                  ⚠️ Estás editando tu propio perfil - Se renovará tu token automáticamente
                </span>
              )}
            </h2>
            
            {error && <pre className="text-red-500 mb-4 whitespace-pre-line">{error}</pre>}
            
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
              <input
                type="password"
                placeholder={editId ? "Nueva contraseña (opcional)" : "Contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder={editId ? "Repetir nueva contraseña" : "Repetir contraseña"}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="border p-2 rounded"
              />
              <select value={rol} onChange={(e) => setRol(e.target.value as Rol)} className="border p-2 rounded">
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