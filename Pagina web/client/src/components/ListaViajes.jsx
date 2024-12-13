import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'

export default function TripGrid() {    
    const { isAuthenticated, user } = useAuth()
    const navigate = useNavigate()
    const [travels, setTravels] = useState([])
    const [loading, setLoading] = useState(true)
    const [hoveredCard, setHoveredCard] = useState(null)

    useEffect(() => {
        if (!isAuthenticated) {
          navigate({ to: '/login' })
          return
        }
        fetchTravelsSummary()
    }, [isAuthenticated, navigate])
    
    // Consulta inicial ligera
    const fetchTravelsSummary = async () => {
        try {
            const endpoint =
            user?.role?.nombre_rol === 'CONDUCTOR'|| 
            user?.role?.nombre_rol === 'ADMINISTRADOR'
              ? '/api/trips/driver/trips'
              : '/api/trips/history'
          const response = await fetch(endpoint, {
            credentials: 'include'
          })
          if (response.ok) {
            const data = await response.json()
            setTravels(data.viajes)
          }
        } catch (error) {
          console.error('Error fetching travels:', error)
        } finally {
          setLoading(false)
        }
      }
    
    // Consulta de detalles bajo demanda
    const handleCardClick = (codigo_viaje) => {
        navigate({ to: `/viajes/${codigo_viaje}` })
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Mis Viajes</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {travels.map((trip) => (
                    <motion.div
                        key={trip.codigo_viaje}
                        className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200"
                        whileHover={{ scale: 1.03 }}
                        onMouseEnter={() => setHoveredCard(trip.codigo_viaje)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => handleCardClick(trip.codigo_viaje)}
                    >
                        <div className="p-6 relative">
                            {hoveredCard === trip.codigo_viaje && (
                                <motion.div
                                    className="absolute inset-0 bg-black bg-opacity-5 pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                                    }} 
                                />
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-sm font-semibold text-blue-600">
                                    {trip.tipo_viaje}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Viaje #{trip.codigo_viaje}</h2>
                            <div className="space-y-3 text-sm text-gray-600">
                                <p className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                    <span><strong className="text-gray-700">Desde:</strong> {trip.origen}</span>
                                </p>
                                <p className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                    <span><strong className="text-gray-700">Hasta:</strong> {trip.destino}</span>
                                </p>
                                <p className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span><strong className="text-gray-700">Fecha:</strong> {trip.fecha_viaje ? new Date(trip.fecha_viaje).toLocaleString() : '-'}</span>
                                </p>
                                {['CLIENTE', 'ADMINISTRADOR'].includes(user?.role?.nombre_rol) && (
                                    <p className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-400" />
                                        <span><strong className="text-gray-700">Conductor:</strong> {trip.conductor}</span>
                                    </p>
                                )}
                                {user?.role?.nombre_rol === 'CONDUCTOR' && (
                                    <p className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-400" />
                                        <span><strong className="text-gray-700">Cliente:</strong> {trip.cliente}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {(!travels || travels.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                    No hay viajes para mostrar
                </div>
            )}
        </div>
    )
}
 