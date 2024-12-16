import {
    Card,
    Button,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input
  } from '@nextui-org/react'
  import { useState, useEffect } from 'react'
  import { useAuth } from '../../hooks/useAuth'

  import { createLazyFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/admin/report')({
  component: Reports,
})

function Reports() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState(new Set([]))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
    } else if (!user || user.role.nombre_rol !== 'ADMINISTRADOR') {
      navigate({ to: '/' })
    }
  }, [user, isAuthenticated])

  const reportTypes = [
    { value: 'BOOKINGS_BY_TAXI', label: 'Reservas por Taxi' },
    { value: 'BOOKINGS_BY_CLIENT', label: 'Reservas por Cliente' },
    { value: 'TRIPS_BY_TAXI', label: 'Viajes por Taxi' },
    { value: 'INCOME_BY_TAXI', label: 'Ingresos por Taxi' },
  ]

  const handleGenerateReport = async () => {
    try {
      if (reportType.size === 0) {
        setError('Por favor selecciona un tipo de reporte')
        onOpen()
        return
      }

      const selectedType = Array.from(reportType)[0]
      setLoading(true)
      setError(null)

      const dateFilters = {}
      if (startDate && endDate) {
        dateFilters.startDate = new Date(startDate).toISOString()
        dateFilters.endDate = new Date(endDate).toISOString()
      }

      const response = await fetch(`/api/reports/${selectedType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dateFilters)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setReportData(data)
    } catch (err) {
      setError(err.message || 'Error al generar el reporte')
      onOpen()
    } finally {
      setLoading(false)
    }
  }

  const renderReportTable = () => {
    if (!reportData?.data?.length) return null

    const columns = Object.keys(reportData.data[0])

    return (
      <Table 
        aria-label="Tabla de reporte"
        className="mt-4"
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column}>
              {column.replace(/_/g, ' ').toUpperCase()}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {reportData.data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={`${index}-${column}`}>
                  {row[column]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Generador de Reportes</h1>

        <div className="space-y-4">
          <Select
            label="Tipo de Reporte"
            placeholder="Selecciona un tipo de reporte"
            selectedKeys={reportType}
            onSelectionChange={setReportType}
            className="max-w-md"
          >
            {reportTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </Select>

          <div className="flex gap-4">
            <Input
              type="date"
              label="Fecha inicial"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="Fecha final"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button
            color="primary"
            onClick={handleGenerateReport}
            isLoading={loading}
          >
            Generar Reporte
          </Button>
        </div>

        {reportData && renderReportTable()}
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Error</ModalHeader>
          <ModalBody>
            <p>{error}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
