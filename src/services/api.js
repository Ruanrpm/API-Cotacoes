const LAST_QUOTES_URL =
  'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL';

const currencyPairs = {
  dollar: 'USD-BRL',
  euro: 'EUR-BRL',
  bitcoin: 'BTC-BRL'
};

export async function getQuotes() {
  const response = await fetch(LAST_QUOTES_URL);

  if (!response.ok) {
    throw new Error('Nao foi possivel buscar as cotacoes atuais.');
  }

  const data = await response.json();

  return {
    dollar: Number(data.USDBRL.bid),
    euro: Number(data.EURBRL.bid),
    bitcoin: Number(data.BTCBRL.bid)
  };
}

async function getDailyHistory(pair, days) {
  const response = await fetch(
    `https://economia.awesomeapi.com.br/json/daily/${pair}/${days}`
  );

  if (!response.ok) {
    throw new Error('Nao foi possivel buscar o historico das cotacoes.');
  }

  return response.json();
}

function getPeriodKey(date, period) {
  if (period === 'yearly') {
    return String(date.getFullYear());
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatPeriodLabel(key, period) {
  if (period === 'yearly') {
    return key;
  }

  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit'
  }).format(date);
}

function aggregateByPeriod(records, period) {
  const groupedRecords = records.reduce((accumulator, record) => {
    const date = new Date(Number(record.timestamp) * 1000);
    const key = getPeriodKey(date, period);

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(Number(record.bid));
    return accumulator;
  }, {});

  return Object.entries(groupedRecords)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, values]) => {
      const total = values.reduce((sum, value) => sum + value, 0);

      return {
        key,
        label: formatPeriodLabel(key, period),
        value: total / values.length
      };
    });
}

export async function getHistoricalQuotes(period) {
  const days = period === 'yearly' ? 1825 : 365;
  const entries = await Promise.all(
    Object.entries(currencyPairs).map(async ([currency, pair]) => {
      const records = await getDailyHistory(pair, days);
      return [currency, aggregateByPeriod(records, period)];
    })
  );

  const historyByCurrency = Object.fromEntries(entries);
  const keys = [
    ...new Set(
      Object.values(historyByCurrency).flatMap((records) =>
        records.map((record) => record.key)
      )
    )
  ].sort();

  return keys.map((key) => {
    const point = {
      time: formatPeriodLabel(key, period)
    };

    Object.entries(historyByCurrency).forEach(([currency, records]) => {
      point[currency] =
        records.find((record) => record.key === key)?.value ?? null;
    });

    return point;
  });
}
