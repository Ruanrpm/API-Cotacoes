import React from 'react';

function Card({ name, value, icon, accent, accentSoft }) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: name === 'Bitcoin' ? 2 : 4,
    maximumFractionDigits: name === 'Bitcoin' ? 2 : 4
  }).format(value);

  return (
    <article className="quote-card">
      <div className="card-header">
        <span
          className="card-icon"
          style={{ '--accent': accent, '--accent-soft': accentSoft }}
        >
          {icon}
        </span>
        <span className="card-label">{name}</span>
      </div>

      <strong className="card-value">{formattedValue}</strong>
      <span className="card-caption">Atualizado automaticamente</span>
    </article>
  );
}

export default Card;
