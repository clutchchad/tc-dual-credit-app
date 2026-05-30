import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminPage from './pages/AdminPage';
import './index.css';

// When a new service worker takes control (new deploy), reload immediately
// so users always run the latest version without needing to manually refresh.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

const Root = window.location.pathname === '/admin' ? AdminPage : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
