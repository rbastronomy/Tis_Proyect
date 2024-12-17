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
    Input,
    Chip,
    ButtonGroup
} from '@nextui-org/react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { FileSpreadsheet, FileText } from 'lucide-react'

export const Route = createLazyFileRoute('/admin/report')({
  component: Reports,
})

function Reports() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
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

  useEffect(() => {
    setReportData(null);
  }, [reportType]);

  const reportTypes = [
    { value: 'TRIPS_BY_TAXI', label: 'Viajes por Taxi' },
    { value: 'MONTHLY_INCOME_BY_DRIVER', label: 'Ingresos Mensuales por Conductor' }
  ]

  const validateDates = () => {
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start <= end;
  };

  const handleGenerateReport = async (asPDF = false) => {
    try {
      if (reportType.size === 0) {
        setError('Por favor selecciona un tipo de reporte')
        onOpen()
        return
      }

      if (!validateDates()) {
        setError('La fecha inicial debe ser anterior o igual a la fecha final')
        onOpen()
        return
      }

      const selectedType = Array.from(reportType)[0]
      if (asPDF) {
        setDownloadingPDF(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const dateFilters = {}
      if (startDate && endDate) {
        dateFilters.startDate = new Date(startDate).toISOString()
        dateFilters.endDate = new Date(endDate).toISOString()
      }

      const endpoint = asPDF ? '/api/reports/pdf' : '/api/reports/'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          type: selectedType,
          ...dateFilters
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (asPDF) {
        // Handle PDF download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_${selectedType}_${new Date().toISOString()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // Handle JSON response
        const data = await response.json()
        setReportData(data)
      }
    } catch (err) {
      setError(err.message || 'Error al generar el reporte')
      onOpen()
    } finally {
      setLoading(false)
      setDownloadingPDF(false)
    }
  }

  const renderTripsByTaxiTable = (data) => (
    <Table aria-label="Tabla de viajes por taxi">
      <TableHeader>
        <TableColumn>PATENTE</TableColumn>
        <TableColumn>VEHÍCULO</TableColumn>
        <TableColumn>TOTAL VIAJES</TableColumn>
        <TableColumn>DURACIÓN PROMEDIO (min)</TableColumn>
        <TableColumn>CONDUCTORES</TableColumn>
        <TableColumn>INGRESO PROMEDIO</TableColumn>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.patente}</TableCell>
            <TableCell>{row.vehiculo}</TableCell>
            <TableCell>
              <Chip color="primary" variant="flat">
                {row.total_viajes}
              </Chip>
            </TableCell>
            <TableCell>{row.duracion_promedio}</TableCell>
            <TableCell>{row.total_conductores}</TableCell>
            <TableCell>
              ${(row.ingreso_promedio_por_viaje || 0).toLocaleString('es-CL')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderMonthlyIncomeTable = (data) => (
    <Table aria-label="Tabla de ingresos mensuales por conductor">
      <TableHeader>
        <TableColumn>RUT</TableColumn>
        <TableColumn>CONDUCTOR</TableColumn>
        <TableColumn>MES</TableColumn>
        <TableColumn>TOTAL VIAJES</TableColumn>
        <TableColumn>INGRESO TOTAL</TableColumn>
        <TableColumn>TAXIS CONDUCIDOS</TableColumn>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.rut}</TableCell>
            <TableCell>{row.conductor}</TableCell>
            <TableCell>{row.mes}</TableCell>
            <TableCell>
              <Chip color="primary" variant="flat">
                {row.total_viajes}
              </Chip>
            </TableCell>
            <TableCell>
              ${(row.ingreso_total || 0).toLocaleString('es-CL')}
            </TableCell>
            <TableCell>{row.total_taxis_conducidos}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderReportTable = () => {
    if (!reportData?.data?.data?.length) return null

    const selectedType = Array.from(reportType)[0]
    
    switch (selectedType) {
      case 'TRIPS_BY_TAXI':
        return renderTripsByTaxiTable(reportData.data.data)
      case 'MONTHLY_INCOME_BY_DRIVER':
        return renderMonthlyIncomeTable(reportData.data.data)
      default:
        return null
    }
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
              onChange={(e) => {
                setStartDate(e.target.value)
                // Clear end date if it's before start date
                if (endDate && new Date(e.target.value) > new Date(endDate)) {
                  setEndDate('')
                }
              }}
            />
            <Input
              type="date"
              label="Fecha final"
              value={endDate}
              min={startDate} // Prevent selecting dates before start date
              isDisabled={!startDate} // Disable until start date is selected
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <ButtonGroup>
            <Button
              color="primary"
              onClick={() => handleGenerateReport(false)}
              isLoading={loading}
              startContent={<FileSpreadsheet size={18} />}
            >
              Ver Reporte
            </Button>
            <Button
              color="secondary"
              onClick={() => handleGenerateReport(true)}
              isLoading={downloadingPDF}
              startContent={<FileText size={18} />}
            >
              Descargar PDF
            </Button>
          </ButtonGroup>
        </div>

        {reportData && (
          <div className="mt-6">
            <div className="mb-4 text-sm text-gray-500">
              Generado el: {new Date(reportData.data.generatedAt).toLocaleString('es-CL')}
            </div>
            {renderReportTable()}
          </div>
        )}
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
