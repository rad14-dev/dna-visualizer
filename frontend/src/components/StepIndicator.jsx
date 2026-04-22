import '../styles/ProteinViewer.css';

/**
 * StepIndicator — shows the 3-step pipeline progress: Fetch → Transcribe → Translate
 */
export default function StepIndicator({ activeStep }) {
  const steps = [
    { id: 1, label: 'Fetch DNA', icon: '📡' },
    { id: 2, label: 'Transcribe RNA', icon: '🔄' },
    { id: 3, label: 'Translate Protein', icon: '🧬' },
  ];

  const getStepClass = (stepId) => {
    if (activeStep >= stepId) {
      return activeStep === stepId ? 'step active' : 'step completed';
    }
    return 'step';
  };

  const getConnectorClass = (afterStepId) => {
    return activeStep > afterStepId ? 'step-connector active' : 'step-connector';
  };

  return (
    <div className="step-indicator" id="step-indicator">
      {steps.map((step, index) => (
        <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
          <div className={getStepClass(step.id)}>
            <span className="step-icon">
              {activeStep > step.id ? '✅' : step.icon}
            </span>
            <span>{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={getConnectorClass(step.id)} />
          )}
        </div>
      ))}
    </div>
  );
}
