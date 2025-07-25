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
        idToColor[id] = colorList[colorIndex % colorList.length]
        colorIndex++
      }
      return idToColor[id]
    }

    let animacionInterval: ReturnType<typeof setInterval> | null = null
    let primerMensajeRecibido = false

    const iniciarAnimacion = () => {
      if (animacionInterval !== null) return // evitar múltiples timers

      animacionInterval = setInterval(() => {
        for (const id in ubicacionQueue) {
          const cola = ubicacionQueue[id]
          if (cola.length === 0) continue

          const { latitud, longitud } = cola.shift()!

          if (markers[id]) {
            markers[id].setLatLng([latitud, longitud])
          } else {
            const newCircle = L.circleMarker([latitud, longitud], {
              radius: 10,
              color: "black",
              weight: 2,
              fillColor: getColorForId(Number(id)),
              fillOpacity: 0.9,
            })
              .addTo(map)
              .bindPopup("Camión " + id)
              .openPopup()

            markers[id] = newCircle
          }
        }
      }, 400)
    }

    const socket = new SockJS(
      `https://api-transporte-98xe.onrender.com/ws?token=${encodeURIComponent(token)}`
    )

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("📥 Conectado al WebSocket")

        stompClient.subscribe("/topic/ubicacion", (message) => {
          const now = new Date()
          const hora = now.toLocaleTimeString("es-PE", { hour12: false })
          console.log(`📦 ubicaciones recibidas - ${hora}`)

          const data = JSON.parse(message.body)
          const { id, ubicaciones } = data

          if (!ubicacionQueue[id]) {
            ubicacionQueue[id] = []
          }

          ubicacionQueue[id].push(...ubicaciones)

          // Espera de 5 segundos solo la primera vez
          if (!primerMensajeRecibido) {
            primerMensajeRecibido = true
            console.log("🕐 Esperando 5 segundos para iniciar animación...")
            setTimeout(() => {
              console.log("🚚 Iniciando animación de camiones")
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
