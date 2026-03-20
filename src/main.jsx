import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Office.js pode já estar carregado pelo <script> no index.html
if (typeof Office !== 'undefined') {
  Office.onReady(() => renderApp());
} else {
  // Fallback para desenvolvimento fora do Outlook
  renderApp();
}
