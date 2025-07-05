export default function Dashboard() {
  const nombre = localStorage.getItem("nombreCompleto") || "Usuario"

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">¡Hola, {nombre}!</h1>
      <p className="text-gray-700">Este es tu panel principal.</p>
    </div>
  )
}
