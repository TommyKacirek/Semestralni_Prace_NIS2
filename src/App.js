import React, { useState } from 'react';
import FirmaInfoForm from './components/FirmaInfoForm';
import SectorSelection from './components/SectorSelection';
import ServicesSelection from './components/ServicesSelection';
import ComplianceDecision from './components/ComplianceDecision';
import SecurityAssessment from './components/SecurityAssessment';
import SummaryPage from './components/SummaryPage';
import { determineComplianceLevel } from './utils/complianceLogic';
import './App.css';

function App() {
  const [companySize, setCompanySize] = useState(null);
  const [sector, setSector] = useState('');
  const [servicesData, setServicesData] = useState(null); // {services: [], specialCriteria: {}}
  const [complianceResult, setComplianceResult] = useState(null); // {level: '', reasoning: ''}
  const [securityStatus, setSecurityStatus] = useState({});
  const [step, setStep] = useState(1);

  const PROGRESS = {
    1: 0,    // FirmaInfoForm - Informace o firmě
    2: 20,   // SectorSelection - Výběr sektoru
    3: 40,   // ServicesSelection - Výběr služeb
    4: 60,   // ComplianceDecision - Rozhodnutí o compliance
    5: 80,   // SecurityAssessment - Hodnocení bezpečnosti (pouze pokud spadá pod NIS2)
    6: 100   // SummaryPage - Souhrn
  };

  // Krok 1: Uložení velikosti firmy
  const handleSizeSubmit = (size) => {
    setCompanySize(size);
  };

  // Krok 1 -> 2: Pokračování na výběr sektoru
  const handleContinueFromSize = () => {
    setStep(2);
  };

  // Krok 2: Výběr sektoru a přechod na výběr služeb
  const handleSectorSelect = (selectedSector) => {
    setSector(selectedSector);
    setStep(3);
  };

  // Zpět ze sektoru na velikost firmy
  const handleBackToSize = () => {
    setStep(1);
  };

  // Zpět z výběru služeb na výběr sektoru
  const handleBackToSector = () => {
    setStep(2);
  };

  // Krok 3: Uložení služeb a vyhodnocení compliance
  const handleNextFromServices = (data) => {
    // data = {services: ['2.1', '2.4'], specialCriteria: {'2.1': true}}
    setServicesData(data);
    
    // Vyhodnocení compliance úrovně
    const result = determineComplianceLevel({
      companySize,
      sector,
      services: data.services,
      specialCriteria: data.specialCriteria
    });
    
    setComplianceResult(result);
    setStep(4); // Přechod na ComplianceDecision
  };

  // Zpět z ComplianceDecision na výběr služeb
  const handleBackToServices = () => {
    setStep(3);
  };

  // Krok 4: Pokračování z ComplianceDecision
  const handleNextFromCompliance = () => {
    if (complianceResult.level === 'none') {
      // Pokud nespadá pod NIS2, přeskočit SecurityAssessment a jít rovnou na Summary
      setStep(6);
    } else {
      // Jinak pokračovat na SecurityAssessment
      setStep(5);
    }
  };

  // Zpět z SecurityAssessment na ComplianceDecision
  const handleBackFromSecurity = () => {
    setStep(4);
  };

  // Krok 5: Dokončení SecurityAssessment
  const handleSecurityComplete = (data) => {
    setSecurityStatus(data.securityStatus || {});
    setStep(6);
  };

  // Zpět ze Summary podle toho, kam se má vrátit
  const handleBackFromSummary = () => {
    if (complianceResult.level === 'none') {
      // Pokud nespadá pod NIS2, vrátit na ComplianceDecision
      setStep(4);
    } else {
      // Jinak vrátit na SecurityAssessment
      setStep(5);
    }
  };


  const handleFinish = () => {
    alert('Děkujeme za použití kalkulačky NIS2! Výsledky můžete exportovat nebo vytisknout.');
    
  };

  // Restart aplikace
  const handleRestart = () => {
    setCompanySize(null);
    setSector('');
    setServicesData(null);
    setComplianceResult(null);
    setSecurityStatus({});
    setStep(1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NIS2 Kalkulačka</h1>
        <h3>Zjistěte vaše povinnosti podle směrnice NIS2 EU</h3>
      </header>

      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-animated">
          <div
            className="progress-bar-fill"
            style={{
              width: PROGRESS[step] + '%',
              transition: 'width 0.8s cubic-bezier(.4,2.2,.6,1)'
            }}
          />
        </div>
        <div className="progress-bar-label">{PROGRESS[step]}% dokončeno</div>
      </div>

      {/* Krok 1: Informace o firmě */}
      {step === 1 && (
        <FirmaInfoForm
          onSubmit={handleSizeSubmit}
          onContinue={handleContinueFromSize}
          companySize={companySize}
        />
      )}

      {/* Krok 2: Výběr sektoru */}
      {step === 2 && (
        <SectorSelection
          onSectorSelect={handleSectorSelect}
          onBack={handleBackToSize}
        />
      )}

      {/* Krok 3: Výběr služeb */}
      {step === 3 && (
        <ServicesSelection
          sector={sector}
          companySize={companySize}
          onBack={handleBackToSector}
          onNext={handleNextFromServices}
        />
      )}

      {/* Krok 4: Rozhodnutí o compliance */}
      {step === 4 && complianceResult && (
        <ComplianceDecision
          companySize={companySize}
          sector={sector}
          services={servicesData?.services || []}
          specialCriteria={servicesData?.specialCriteria || {}}
          complianceResult={complianceResult}
          onBack={handleBackToServices}
          onNext={handleNextFromCompliance}
        />
      )}

      {/* Krok 5: Hodnocení bezpečnosti (pouze pokud spadá pod NIS2) */}
      {step === 5 && complianceResult.level !== 'none' && (
        <SecurityAssessment
          companySize={companySize}
          sector={sector}
          services={servicesData?.services || []}
          complianceLevel={complianceResult.level}
          onBack={handleBackFromSecurity}
          onNext={handleSecurityComplete}
        />
      )}

      {/* Krok 6: Souhrn */}
      {step === 6 && (
        <SummaryPage
          companySize={companySize}
          sector={sector}
          selectedServices={servicesData?.services || []}
          specialCriteria={servicesData?.specialCriteria || {}}
          complianceLevel={complianceResult?.level}
          complianceReasoning={complianceResult?.reasoning}
          securityStatus={securityStatus}
          onBack={handleBackFromSummary}
          onFinish={handleFinish}
          onRestart={handleRestart}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2025 NIS2 Kalkulačka | Vytvořeno podle Vyhlášky o regulovaných službách</p>
      </footer>
    </div>
  );
}

export default App;
