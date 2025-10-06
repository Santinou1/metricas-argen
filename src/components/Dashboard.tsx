import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import data from '../../data.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  // Estados para búsqueda
  const [searchDate, setSearchDate] = useState('');
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Colores ArgenPesos
  const colors = {
    primary: '#00BFFF', // Celeste
    secondary: '#87CEEB', // Celeste claro
    white: '#FFFFFF',
    gray: '#F8F9FA',
    dark: '#2C3E50'
  };

  // Función para crear fecha sin problemas de zona horaria
  const createSafeDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Función para buscar día específico
  const searchSpecificDay = (date: string) => {
    if (!date) {
      setSelectedDay(null);
      return;
    }
    
    const foundDay = data.dias.find(day => day.fecha === date);
    if (foundDay) {
      // Usar fecha segura sin problemas de zona horaria
      const dayDate = createSafeDate(date);
      
      // Encontrar la semana que contiene este día
      const mondayOfWeek = new Date(dayDate);
      const dayOfWeek = dayDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Domingo = 0, necesitamos ajustar
      mondayOfWeek.setDate(dayDate.getDate() + daysToMonday);
      
      const mondayString = `${mondayOfWeek.getFullYear()}-${String(mondayOfWeek.getMonth() + 1).padStart(2, '0')}-${String(mondayOfWeek.getDate()).padStart(2, '0')}`;
      
      const weekData = data.semanas.find(week => week.semana === mondayString);
      
      // Encontrar el mes
      const monthString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-01`;
      const monthData = data.meses.find(month => month.mes === monthString);
      
      setSelectedDay({
        ...foundDay,
        weekData,
        monthData,
        dayOfWeek: dayDate.toLocaleDateString('es-ES', { weekday: 'long' }),
        formattedDate: dayDate.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      });
    } else {
      setSelectedDay(null);
    }
  };

  // Función para obtener días cercanos (contexto)
  const getNearbyDays = (targetDate: string) => {
    const targetIndex = data.dias.findIndex(day => day.fecha === targetDate);
    if (targetIndex === -1) return [];
    
    const start = Math.max(0, targetIndex - 3);
    const end = Math.min(data.dias.length, targetIndex + 4);
    
    return data.dias.slice(start, end);
  };

  // Preparar datos para gráfico diario (últimos 30 días)
  const last30Days = data.dias.slice(-30);
  const dailyChartData = {
    labels: last30Days.map(day => {
      const date = new Date(day.fecha);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Métricas Diarias',
        data: last30Days.map(day => day.total),
        borderColor: colors.primary,
        backgroundColor: colors.secondary,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Preparar datos para gráfico mensual
  const monthlyChartData = {
    labels: data.meses.map(month => {
      const date = new Date(month.mes);
      return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Total Mensual',
        data: data.meses.map(month => month.total),
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        borderWidth: 1,
      },
    ],
  };

  // Preparar datos para gráfico de dona (distribución mensual)
  const doughnutData = {
    labels: data.meses.map(month => {
      const date = new Date(month.mes);
      return date.toLocaleDateString('es-ES', { month: 'short' });
    }),
    datasets: [
      {
        data: data.meses.map(month => month.total),
        backgroundColor: [
          '#00BFFF', '#87CEEB', '#4169E1', '#1E90FF', 
          '#00CED1', '#20B2AA', '#48D1CC', '#40E0D0', '#00FFFF'
        ],
        borderWidth: 2,
        borderColor: colors.white,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-sky-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sky-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AP</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ArgenPesos</h1>
                <p className="text-sky-600 font-medium">Dashboard de Métricas</p>
              </div>
            </div>
            
            {/* Búsqueda por día */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <span>🔍</span>
                  <span>Buscar Día</span>
                </button>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Período</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.periodo.desde} - {data.periodo.hasta}
                </p>
              </div>
            </div>
          </div>
          
          {/* Panel de búsqueda */}
          {showSearch && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label htmlFor="search-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar fecha:
                  </label>
                  <input
                    id="search-date"
                    type="date"
                    value={searchDate}
                    onChange={(e) => {
                      setSearchDate(e.target.value);
                      searchSpecificDay(e.target.value);
                    }}
                    min={data.periodo.desde}
                    max={data.periodo.hasta}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setSearchDate('');
                    setSelectedDay(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-sky-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.kpis.total.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <span className="text-sky-600 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-sky-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Promedio Diario</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.kpis.promedio_dia}
                </p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <span className="text-sky-600 text-xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Mejor Día</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.kpis.mejor_dia.total}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(data.kpis.mejor_dia.fecha).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">🏆</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Mejor Mes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.kpis.mejor_mes.total.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(data.kpis.mejor_mes.mes).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del día seleccionado */}
        {selectedDay && (
          <div className="mb-8 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl shadow-sm p-6 border-l-4 border-sky-400">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                📅 Detalles del Día Seleccionado
              </h2>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedDay.formattedDate}
                </h3>
                <p className="text-3xl font-bold text-sky-600">{selectedDay.total}</p>
                <p className="text-sm text-gray-500">Métricas del día</p>
              </div>
              
              {selectedDay.weekData && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Semana completa</h3>
                  <p className="text-2xl font-bold text-blue-600">{selectedDay.weekData.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    Semana del {new Date(selectedDay.weekData.semana).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              
              {selectedDay.monthData && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Mes completo</h3>
                  <p className="text-2xl font-bold text-green-600">{selectedDay.monthData.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(selectedDay.monthData.mes).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Comparación</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedDay.total > data.kpis.promedio_dia ? (
                    <span className="text-green-600">
                      +{(selectedDay.total - data.kpis.promedio_dia).toFixed(0)} vs promedio
                    </span>
                  ) : (
                    <span className="text-red-600">
                      {(selectedDay.total - data.kpis.promedio_dia).toFixed(0)} vs promedio
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">Promedio: {data.kpis.promedio_dia}</p>
              </div>
            </div>
            
            {/* Contexto de días cercanos */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contexto (días cercanos)</h3>
              <div className="grid grid-cols-7 gap-2">
                {getNearbyDays(selectedDay.fecha).map((day) => (
                  <div
                    key={day.fecha}
                    className={`p-3 rounded-lg text-center ${
                      day.fecha === selectedDay.fecha
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-xs text-gray-600 mb-1">
                      {createSafeDate(day.fecha).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-semibold">
                      {createSafeDate(day.fecha).getDate()}
                    </div>
                    <div className="text-xs mt-1">
                      {day.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tendencia Diaria (Últimos 30 días)
            </h3>
            <div className="h-80">
              <Line data={dailyChartData} options={chartOptions} />
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Evolución Mensual
            </h3>
            <div className="h-80">
              <Bar data={monthlyChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Distribución Mensual
            </h3>
            <div className="h-80">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Resumen Estadístico
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Promedio Semanal</span>
                <span className="font-semibold text-gray-900">
                  {data.kpis.promedio_semana.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Promedio Mensual</span>
                <span className="font-semibold text-gray-900">
                  {data.kpis.promedio_mes.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Mejor Semana</span>
                <span className="font-semibold text-green-600">
                  {data.kpis.mejor_semana.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Total Días</span>
                <span className="font-semibold text-gray-900">
                  {data.dias.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Growth Table */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Crecimiento Mensual
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Cambio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.meses.map((month, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(month.mes).toLocaleDateString('es-ES', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {month.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {month.delta ? (
                        <span className={month.delta > 0 ? 'text-green-600' : 'text-red-600'}>
                          {month.delta > 0 ? '+' : ''}{month.delta.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {month.delta_pct ? (
                        <span className={month.delta_pct > 0 ? 'text-green-600' : 'text-red-600'}>
                          {month.delta_pct > 0 ? '+' : ''}{month.delta_pct}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
