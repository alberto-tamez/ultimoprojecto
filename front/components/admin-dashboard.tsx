'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  TimeScale,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  TimeScale
)

export default function AdminDashboard() {
  const predictionsPorMes = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Predicciones realizadas',
        data: [10, 15, 8, 20, 18],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  }

  const cultivosPopulares = {
    labels: ['Maíz', 'Frijol', 'Arroz', 'Sorgo', 'Trigo'],
    datasets: [
      {
        label: 'Cantidad recomendada',
        data: [25, 18, 22, 14, 10],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      },
    ],
  }

  // Acciones más comunes
  const accionesPorTipo = {
    labels: ['Login', 'Logout', 'Predict'],
    datasets: [
      {
        label: 'Cantidad',
        data: [30, 15, 45],
        backgroundColor: [
          'rgba(96, 165, 250, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
      },
    ],
  }

  // Eventos por hora
  const eventosPorHora = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Eventos registrados',
        data: [1, 0, 0, 0, 3, 5, 8, 15, 22, 30, 28, 20, 18, 14, 10, 8, 6, 9, 12, 18, 22, 15, 10, 4],
        fill: false,
        borderColor: 'rgba(139, 92, 246, 1)',
        tension: 0.4,
      },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Administrativo</h2>

      <Card>
        <CardHeader>
          <CardTitle>Predicciones por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={predictionsPorMes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cultivos más recomendados</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={cultivosPopulares} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones más comunes</CardTitle>
        </CardHeader>
        <CardContent>
          <Pie data={accionesPorTipo} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos por hora</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={eventosPorHora} />
        </CardContent>
      </Card>
    </div>
  )
}