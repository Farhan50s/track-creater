/**
 * Detects whether a skill node is HTML/CSS or TypeScript/JavaScript
 * and provides an authentic, relevant interactive starter template.
 */
export function getStarterCode(
  nodeId: string,
  title: string
): { mode: 'html' | 'javascript'; code: string } {
  const lower = (nodeId + ' ' + title).toLowerCase();

  if (
    lower.includes('html') ||
    lower.includes('css') ||
    lower.includes('flexbox') ||
    lower.includes('grid') ||
    lower.includes('tailwind') ||
    lower.includes('styling')
  ) {
    return {
      mode: 'html',
      code: `<!-- Live Sandbox: ${title} -->
<div class="card">
  <h2>Interactive Preview</h2>
  <p>Modify this markup and see the changes update in real time.</p>
  <button onclick="alert('Hello from your sandbox!')">Click Me</button>
</div>

<style>
  .card {
    padding: 1.5rem;
    border: 1px solid #3b82f6;
    border-radius: 8px;
    background: #1e293b;
  }
  h2 { margin-top: 0; color: #60a5fa; font-size: 1.3rem; }
  p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
  button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.15s ease;
  }
  button:hover { background: #1d4ed8; }
</style>`,
    };
  }

  return {
    mode: 'javascript',
    code: `// Live Code Console: ${title}
// Press 'Run Code ⚡' or Ctrl+Enter to execute

function calculateGrowth(base, rate, steps) {
  const trajectory = [];
  let current = base;
  for (let i = 1; i <= steps; i++) {
    current += current * rate;
    trajectory.push({ step: i, value: Math.round(current) });
  }
  return trajectory;
}

const results = calculateGrowth(100, 0.15, 4);
console.log("Calculated Trajectory:", results);
`,
  };
}
