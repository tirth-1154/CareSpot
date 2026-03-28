import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import RegisterPage from './components/ui/RegisterPage'
import AdminLogin from './AdminLogin'
import './index.css'

console.log("Vite main.tsx executing...");

const container = document.getElementById('carousel-root') || document.getElementById('root');

if (container) {
  console.log("Found container:", container.id);
  
  const path = window.location.pathname;
  console.log("Current Path:", path);
  
  // Render logic based on path
  let ComponentToRender = <App />;
  
  if (path === '/register' || path === '/register/') {
    ComponentToRender = <RegisterPage />;
  } else if (path.includes('/site-admin/') || path.includes('/site-admin/login')) {
    ComponentToRender = <AdminLogin />;
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      {ComponentToRender}
    </React.StrictMode>,
  )
} else {
  console.error("Could not find container #carousel-root or #root");
}
