import React, { useEffect, useState } from 'react';
import Card from './components/Card.jsx';
import PriceChart from './components/PriceChart.jsx';
import { getHistoricalQuotes, getQuotes } from './services/api.js';

const cards = [
  {
    key: 'dollar',
    name: 'Dólar',
    icon: '$',
    accent: '#58a6ff',
    accentSoft: 'rgba(88, 166, 255, 0.16)'
  },
  {
    key: 'euro',
    name: 'Euro',
    icon: 'EUR',
    accent: '#7ee787',
    accentSoft: 'rgba(126, 231, 135, 0.16)'
  },
  {
    key: 'bitcoin',
    name: 'Bitcoin',
    icon: 'BTC',
    accent: '#f2cc60',
    accentSoft: 'rgba(242, 204, 96, 0.16)'
  }
];

const chartPeriods = [
  { value: 'realtime', label: 'Tempo real' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' }
];

function App() {
  const [quotes, setQuotes] = useState(null);
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadQuotes() {
      try {
        const currentQuotes = await getQuotes();
        const time = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        setQuotes(currentQuotes);
        setError('');

        if (period === 'realtime') {
          setHistory((previousHistory) =>
            [...previousHistory, { time, ...currentQuotes }].slice(-20)
          );
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
        setChartLoading(false);
      }
    }

    loadQuotes();
    const intervalId = setInterval(loadQuotes, 10000);

    return () => clearInterval(intervalId);
  }, [period]);

  useEffect(() => {
    async function loadHistoricalQuotes() {
      if (period === 'realtime') {
        setHistory([]);
        return;
      }

      try {
        setChartLoading(true);
        const historicalQuotes = await getHistoricalQuotes(period);
        setHistory(historicalQuotes);
        setError('');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
        setChartLoading(false);
      }
    }

    loadHistoricalQuotes();
  }, [period]);

  const chartDescription =
    period === 'realtime'
      ? 'Últimos 20 registros coletados a cada 10 segundos'
      : period === 'monthly'
        ? 'Média mensal dos últimos 12 meses'
        : 'Média anual dos últimos 5 anos';

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Dashboard financeiro</p>
        <h1>Cotação em Tempo Real</h1>
        <p className="subtitle">
          Acompanhe Dólar, Euro e Bitcoin em reais com atualização automática e
          histórico mensal ou anual.
        </p>
      </header>

      {loading && (
        <section className="status-panel">
          <span className="loader" />
          <p>Carregando cotações...</p>
        </section>
      )}

      {!loading && error && (
        <section className="error-panel">
          <strong>Erro de conexão</strong>
          <p>{error}</p>
        </section>
      )}

      {!loading && quotes && (
        <>
          <section className="cards-grid">
            {cards.map((card) => (
              <Card
                key={card.key}
                name={card.name}
                value={quotes[card.key]}
                icon={card.icon}
                accent={card.accent}
                accentSoft={card.accentSoft}
              />
            ))}
          </section>

          <PriceChart
            description={chartDescription}
            history={history}
            loading={chartLoading}
            period={period}
            periods={chartPeriods}
            onPeriodChange={setPeriod}
          />
        </>
      )}
    </main>
  );
}

export default App;
