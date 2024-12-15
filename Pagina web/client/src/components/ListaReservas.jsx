'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, MapPin, Calendar, DollarSign } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'

export default function ReservationGrid() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    fetchBookings()
  }, [isAuthenticated, navigate])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/my-bookings', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener las reservas');
      }

      const data = await response.json();
      setBookings(data.reservas || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (codigo_reserva) => {
    navigate({ to: `/reservas/${codigo_reserva}` })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mis Reservas</h1>
        {['CLIENTE', 'ADMINISTRADOR'].includes(user?.role?.nombre_rol) && (
          <button 
            onClick={() => navigate({ to: '/reservas/create' })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Nueva Reserva
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <motion.div
            key={booking.codigo_reserva}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200"
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => setHoveredCard(booking.codigo_reserva)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick(booking.codigo_reserva)}
          >
            <div className="p-6 relative">
              {hoveredCard === booking.codigo_reserva && (
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
                  {booking.tipo_reserva}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                  booking.estado_reserva === 'EN_REVISION' ? 'text-yellow-800 bg-yellow-100 border-yellow-200' :
                  booking.estado_reserva === 'PENDIENTE' ? 'text-blue-800 bg-blue-100 border-blue-200' :
                  booking.estado_reserva === 'CONFIRMADO' ? 'text-purple-800 bg-purple-100 border-purple-200' :
                  booking.estado_reserva === 'COMPLETADO' ? 'text-green-800 bg-green-100 border-green-200' :
                  booking.estado_reserva === 'CANCELADO' ? 'text-red-800 bg-red-100 border-red-200' :
                  'text-red-800 bg-red-100 border-red-200'
                }`}>
                  {booking.estado_reserva}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Reserva #{booking.codigo_reserva}</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span><strong className="text-gray-700">Desde:</strong> {booking.origen_reserva}</span>
                </p>
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span><strong className="text-gray-700">Hasta:</strong> {booking.destino_reserva}</span>
                </p>
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span><strong className="text-gray-700">Fecha:</strong> {
                    booking.fecha_reserva ? new Date(booking.fecha_reserva).toLocaleString() : '-'
                  }</span>
                </p>
                {booking.tarifa && (
                  <p className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span><strong className="text-gray-700">Tarifa:</strong> ${booking.tarifa.precio.toLocaleString()} - {booking.tarifa.descripcion}</span>
                  </p>
                )}
              </div>
              <ChevronRight className="absolute bottom-4 right-4 text-blue-500" />
            </div>
          </motion.div>
        ))}
      </div>
      
      {(!bookings || bookings.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          No hay reservas para mostrar
        </div>
      )}
    </div>
  )
}

