import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import RegisterPage from './components/ui/RegisterPage'
import './index.css'

console.log("Vite main.tsx executing...");

const container = document.getElementById('carousel-root') || document.getElementById('root');

if (container) {
  console.log("Found container:", container.id);
  
  const path = window.location.pathname;
  
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      {path === '/register' || path === '/register/' ? <RegisterPage /> : <App />}
    </React.StrictMode>,
  )
} else {
  console.error("Could not find container #carousel-root or #root");
}
