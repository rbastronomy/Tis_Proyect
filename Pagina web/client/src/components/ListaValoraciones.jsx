import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, MapPin, Calendar, DollarSign } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'

export default function RatingGrid() {
    const [hoveredCard, setHoveredCard] = useState(null)
    const { isAuthenticated, user } = useAuth()
    const navigate = useNavigate()
    const [ratings, setRatings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: '/login' })
            return
        }
        fetchRatings()
    }, [isAuthenticated, navigate])

    const fetchRatings = async () => {
        try {
            const endpoint = 
                user?.role?.nombre_rol === 'TAXISTA'||
                user?.role?.nombre_rol === 'ADMINISTRADOR'
                ? '/api/ratings/'
                : '/api/ratings/createRating'

            const response = await fetch(endpoint, {
                credentials: 'include',
            })

            if (response.ok) {
                const data = await response.json()
                setRatings(data.valoraciones || [])
            }
        } catch (error) {
            console.error('Error fetching ratings:', error)
            setRatings([])
        } finally {
            setLoading(false)
        }
    }

    const handleCardClick = (id_valoracion) => {
        navigate({ to: `/valoracion/${id_valoracion}` })
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Mis Valoraciones</h1>
                {['CLIENTE', 'ADMINISTRADOR'].includes(user?.role?.nombre_rol) && (
                    <button
                        onClick={() => navigate({ to: '/valoracion/create' })}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
                    >
                        Nueva Valoración
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ratings.map((rating) => (
                    <motion.div
                        key={rating.codigo_valoracion}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white rounded-md shadow-md p-4"
                        onClick={() => handleCardClick(rating.codigo_valoracion)}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {rating.nombre}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <MapPin size={16} />
                                <span className="text-sm text-gray-600">
                                    {rating.direccion}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Calendar size={16} />
                            <span className="text-sm text-gray-600">
                                {new Date(rating.fecha).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <DollarSign size={16} />
                            <span className="text-sm text-gray-600">
                                {rating.precio}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}