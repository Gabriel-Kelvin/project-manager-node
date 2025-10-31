import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CRM System Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Status Check</h2>
        <ul>
          <li>✅ React is rendering</li>
          <li>✅ Basic styling works</li>
          <li>✅ JavaScript is executing</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
