import { useEffect } from "react"
import L from "leaflet"
import "leaflet-routing-machine"
// @ts-ignore
import SockJS from "sockjs-client/dist/sockjs"
import { Client } from "@stomp/stompjs"
import "leaflet/dist/leaflet.css"

export default function Mapa() {
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    console.log("🗺️ Inicializando mapa...")

    const map = L.map("map").setView([-12.0464, -77.0428], 19)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    const colorList = [
      "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4",
      "#46f0f0", "#f032e6", "#bcf60c", "#fabebe", "#008080", "#e6beff",
      "#9a6324", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1",
      "#000075", "#808080", "#ffffff", "#000000",
    ]
    const markers: Record<number, L.CircleMarker> = {}
    const idToColor: Record<number, string> = {}
    let colorIndex = 0
    const ubicacionQueue: Record<number, { latitud: number; longitud: number }[]> = {}

    const getColorForId = (id: number) => {
      if (!idToColor[id]) {
        idToColor[id] = colorList[colorIndex++ % colorList.length]
      }
      return idToColor[id]
    }

    const smoothMove = (
      marker: L.CircleMarker,
      from: L.LatLng,
      to: L.LatLng,
      duration: number
    ) => {
      const start = performance.now()
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const lat = from.lat + (to.lat - from.lat) * progress
        const lng = from.lng + (to.lng - from.lng) * progress
        marker.setLatLng([lat, lng])
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }

    let animacionInterval: ReturnType<typeof setInterval> | null = null
    let primerMensajeRecibido = false

    const iniciarAnimacion = () => {
      if (animacionInterval !== null) return

      const FRAME_MS = 68 // ~5s / 73 pasos aprox
      console.log("▶️ Animación iniciada con intervalo:", FRAME_MS, "ms")

      animacionInterval = setInterval(() => {
        for (const id in ubicacionQueue) {
          const cola = ubicacionQueue[id]
          if (!cola.length) continue

          const { latitud, longitud } = cola.shift()!
          const destino = L.latLng(latitud, longitud)

          if (markers[id]) {
            const actual = markers[id].getLatLng()
            smoothMove(markers[id], actual, destino, FRAME_MS)
          } else {
            console.log("🆕 Añadiendo nuevo marcador para camión ID:", id)
            markers[id] = L.circleMarker([latitud, longitud], {
              radius: 10,
              color: "black",
              weight: 2,
              fillColor: getColorForId(Number(id)),
              fillOpacity: 0.9,
            })
              .addTo(map)
              .bindPopup("Camión " + id)
              .openPopup()
          }
        }
      }, FRAME_MS)
    }

    const socket = new SockJS(
      `https://api-transporte-98xe.onrender.com/ws?token=${encodeURIComponent(token)}`
    )

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Conectado al WebSocket")

        stompClient.subscribe("/topic/ubicacion", (message) => {
          const data = JSON.parse(message.body)
          const { id, ubicaciones } = data
          console.log(`📨 Recibidas ${ubicaciones.length} ubicaciones para ID: ${id}`)

          if (!ubicacionQueue[id]) ubicacionQueue[id] = []

          // Interpolación 25% y 75%
          for (let i = 0; i < ubicaciones.length - 1; i++) {
            const u1 = ubicaciones[i], u2 = ubicaciones[i + 1]
            const interp25 = {
              latitud: u1.latitud + (u2.latitud - u1.latitud) * 0.25,
              longitud: u1.longitud + (u2.longitud - u1.longitud) * 0.25,
            }
            const interp75 = {
              latitud: u1.latitud + (u2.latitud - u1.latitud) * 0.75,
              longitud: u1.longitud + (u2.longitud - u1.longitud) * 0.75,
            }
            ubicacionQueue[id].push(u1, interp25, interp75)
          }

          if (ubicaciones.length) {
            ubicacionQueue[id].push(ubicaciones[ubicaciones.length - 1])
          }

          console.log(`📦 Total en cola para ID ${id}:`, ubicacionQueue[id].length)

          if (!primerMensajeRecibido) {
            primerMensajeRecibido = true
            console.log("⏳ Esperando 5 segundos para iniciar animación...")
            setTimeout(() => {
              console.log("🚀 Iniciando animación de camiones")
              iniciarAnimacion()
            }, 5000)
          }
        })
      },
      onStompError: (err) => {
        console.error("❌ Error en STOMP:", err)
      },
    })

    stompClient.activate()

    return () => {
      stompClient.deactivate()
      map.remove()
      if (animacionInterval) clearInterval(animacionInterval)
      console.log("🧹 Limpieza de recursos al desmontar componente")
    }
  }, [])

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-2">
        <div id="map" className="h-[85vh] w-full rounded-lg shadow-lg" />
      </div>
    </div>
  )
}
