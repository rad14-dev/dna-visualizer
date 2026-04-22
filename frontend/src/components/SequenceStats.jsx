import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AMINO_ACID_DATA, PROPERTY_LABELS } from '../utils/aminoAcidData';
import '../styles/SequenceStats.css';

/**
 * SequenceStats — displays pie charts for DNA/RNA/Protein composition.
 */
export default function SequenceStats({ dnaCounts, rnaCounts, aaCounts }) {
  // Defensive check
  if (!dnaCounts || !rnaCounts || !aaCounts) {
    return null;
  }

  // ─── DNA Data Preparation ───────────────────────────────────────
  const dnaData = [
    { name: 'Adenine (A)', value: dnaCounts.A, color: 'var(--color-adenine)' },
    { name: 'Thymine (T)', value: dnaCounts.T, color: 'var(--color-thymine)' },
    { name: 'Guanine (G)', value: dnaCounts.G, color: 'var(--color-guanine)' },
    { name: 'Cytosine (C)', value: dnaCounts.C, color: 'var(--color-cytosine)' },
  ].filter(d => d.value > 0);

  // ─── RNA Data Preparation ───────────────────────────────────────
  const rnaData = [
    { name: 'Adenine (A)', value: rnaCounts.A, color: 'var(--color-adenine)' },
    { name: 'Uracil (U)',   value: rnaCounts.U, color: 'var(--color-uracil)' },
    { name: 'Guanine (G)', value: rnaCounts.G, color: 'var(--color-guanine)' },
    { name: 'Cytosine (C)', value: rnaCounts.C, color: 'var(--color-cytosine)' },
  ].filter(d => d.value > 0);

  // ─── Protein Property Preparation ───────────────────────────────
  const propertyCounts = {};
  Object.entries(aaCounts).forEach(([aa, count]) => {
    const property = AMINO_ACID_DATA[aa]?.property || 'unknown';
    propertyCounts[property] = (propertyCounts[property] || 0) + count;
  });

  const proteinData = Object.entries(propertyCounts).map(([key, value]) => ({
    name: PROPERTY_LABELS[key]?.label || key,
    value,
    color: PROPERTY_LABELS[key]?.color || '#6b7280',
  })).sort((a, b) => b.value - a.value);

  // Common Tooltip Style
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = payload[0].chartType === 'Pie' 
        ? payload[0].value 
        : 0; // Not used here as total is calculated by recharts
      
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">
            <strong>{data.value}</strong> units
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="stats-section animate-slide-up" id="sequence-stats">
      <div className="section-header">
        <div className="section-title">
          <span className="icon">📊</span>
          Composition Analysis
        </div>
      </div>

      <div className="stats-grid">
        {/* DNA Composition */}
        <div className="stats-card">
          <h3 className="card-title">DNA Bases</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={dnaData}
                  cx="50%"
                  cy="40%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {dnaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '50px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RNA Composition */}
        <div className="stats-card">
          <h3 className="card-title">RNA Bases</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={rnaData}
                  cx="50%"
                  cy="40%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={400}
                  animationDuration={1000}
                >
                  {rnaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '50px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protein Properties */}
        <div className="stats-card protein-stats-card">
          <h3 className="card-title">Amino Acid Properties</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={proteinData}
                  cx="50%"
                  cy="40%" /* Lift chart slightly to make room for bottom legend */
                  innerRadius={70} /* Increased inner radius */
                  outerRadius={100} /* Increased outer radius */
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={600}
                  animationDuration={1200}
                >
                  {proteinData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '50px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
