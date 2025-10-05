import { useState } from "react"


export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("https://api-transporte-98xe.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("El usuario no existe")
        } else if (res.status === 401) {
          throw new Error("Contraseña incorrecta")
        } else {
          throw new Error("Error al iniciar sesión")
        }
      }

      const data = await res.json()

      // Guardamos los datos en localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("nombreCompleto", data.nombreCompleto)
      localStorage.setItem("rol", data.rol)
      localStorage.setItem("idUsuario", data.idUsuario.toString())

      // 🔄 Recargamos toda la página después del login
      window.location.href = "/"
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error desconocido al iniciar sesión")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-80 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Iniciar Sesión</h2>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
