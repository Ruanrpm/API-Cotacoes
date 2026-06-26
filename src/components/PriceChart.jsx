import React from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function PriceChart({
  description,
  history,
  loading,
  period,
  periods,
  onPeriodChange
}) {
  const data = {
    labels: history.map((item) => item.time),
    datasets: [
      {
        label: 'Dólar',
        data: history.map((item) => item.dollar),
        borderColor: '#58a6ff',
        backgroundColor: 'rgba(88, 166, 255, 0.12)',
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Euro',
        data: history.map((item) => item.euro),
        borderColor: '#7ee787',
        backgroundColor: 'rgba(126, 231, 135, 0.12)',
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Bitcoin',
        data: history.map((item) => item.bitcoin),
        borderColor: '#f2cc60',
        backgroundColor: 'rgba(242, 204, 96, 0.12)',
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#d6e2f0',
          boxWidth: 14,
          boxHeight: 14,
          padding: 18,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: '#263346',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#d6e2f0',
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(context.raw);

            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.12)'
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 0
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.12)'
        },
        ticks: {
          color: '#94a3b8',
          callback: (value) =>
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact'
            }).format(value)
        }
      }
    }
  };

  return (
    <section className="chart-panel">
      <div className="chart-heading">
        <div>
          <h2>Histórico das cotações</h2>
          <p>{description}</p>
        </div>

        <div className="period-tabs" aria-label="Selecionar período do gráfico">
          {periods.map((item) => (
            <button
              key={item.value}
              className={period === item.value ? 'active' : ''}
              type="button"
              onClick={() => onPeriodChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-wrapper">
        {loading ? (
          <div className="chart-loading">
            <span className="loader" />
            <p>Carregando histórico...</p>
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </section>
  );
}

export default PriceChart;
