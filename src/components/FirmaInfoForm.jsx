import React, { useState, useEffect } from 'react';
import './FirmaInfoForm.css';

const getCompanySize = ({ employees, turnover, balance }) => {
  if (employees < 10 && turnover < 2 && balance < 2) {
    return 'Mikro';
  } else if (employees < 50 && turnover < 10 && balance < 10) {
    return 'Malá';
  } else if (employees < 250 && turnover < 50 && balance < 43) {
    return 'Střední';
  }
  return 'Velká';
};

export default function FirmaInfoForm({ onSubmit, onContinue, companySize }) {
  const [employees, setEmployees] = useState('');
  const [turnover, setTurnover] = useState('');
  const [balance, setBalance] = useState('');
  const [size, setSize] = useState(companySize);

  const isReady = employees !== '' && turnover !== '' && balance !== '' && size !== null;

  const handleCalculate = () => {
    const result = getCompanySize({
      employees: Number(employees),
      turnover: Number(turnover),
      balance: Number(balance),
    });
    setSize(result);
    if (onSubmit) onSubmit(result);
  };

  // Aktualizace i při změně prop companySize
  useEffect(() => {
    if (companySize) setSize(companySize);
  }, [companySize]);

  return (
    <div className="form-container fancy-gradient">
      <h2>Krok 1: Zadejte údaje o firmě</h2>
      <label>
        Počet zaměstnanců:
        <input
          type="number"
          min="0"
          value={employees}
          onChange={e => setEmployees(e.target.value)}
          placeholder="např. 25"
        />
      </label>
      <label>
        Roční obrat (v mil. EUR):
        <input
          type="number"
          min="0"
          value={turnover}
          onChange={e => setTurnover(e.target.value)}
          placeholder="např. 7.5"
        />
      </label>
      <label>
        Bilanční suma (v mil. EUR):
        <input
          type="number"
          min="0"
          value={balance}
          onChange={e => setBalance(e.target.value)}
          placeholder="např. 12.4"
        />
      </label>
      <button className="calculate-btn" onClick={handleCalculate}>
        Vyhodnotit velikost firmy
      </button>
      {size && (
        <div className="result">
          Velikost firmy: <b>{size}</b>
        </div>
      )}
      {isReady && (
        <button className="continue-btn" onClick={onContinue}>
          Pokračovat
        </button>
      )}
    </div>
  );
}
