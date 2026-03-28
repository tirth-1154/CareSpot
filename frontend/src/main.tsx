import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import RegisterPage from './components/ui/RegisterPage'
import AdminLogin from './AdminLogin'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { AdminDoctors } from './components/admin/AdminDoctors'
import { AdminUsers } from './components/admin/AdminUsers'
import { AdminPatients } from './components/admin/AdminPatients'
import { AdminAppointments } from './components/admin/AdminAppointments'
import { AdminReviews } from './components/admin/AdminReviews'
import { AdminBlogs } from './components/admin/AdminBlogs'
import { AdminConfigs } from './components/admin/AdminConfigs'
import './index.css'

const adminContainer = document.getElementById('react-admin-dashboard-root');
const rootContainer = document.getElementById('carousel-root') || document.getElementById('root');

if (adminContainer) {
  const scriptEl = document.getElementById('adminCoreData');
  let data = {};
  if (scriptEl && scriptEl.textContent) {
      try {
          data = JSON.parse(scriptEl.textContent.trim());
      } catch(e) { /* silent parse fail */ }
  }
  
  const path = window.location.pathname;
  let AdminComponentToRender = <AdminDashboard data={data as any} />;
  
  if (path.includes('/site-admin/doctors')) {
    AdminComponentToRender = <AdminDoctors data={data as any} />;
  } else if (path.includes('/site-admin/users')) {
    AdminComponentToRender = <AdminUsers data={data as any} />;
  } else if (path.includes('/site-admin/patients')) {
    AdminComponentToRender = <AdminPatients data={data as any} />;
  } else if (path.includes('/site-admin/appointments')) {
    AdminComponentToRender = <AdminAppointments data={data as any} />;
  } else if (path.includes('/site-admin/reviews')) {
    AdminComponentToRender = <AdminReviews data={data as any} />;
  } else if (path.includes('/site-admin/blogs')) {
    AdminComponentToRender = <AdminBlogs data={data as any} />;
  } else if (path.includes('/site-admin/categories') || path.includes('/site-admin/locations')) {
    AdminComponentToRender = <AdminConfigs data={data as any} />;
  }
  
  ReactDOM.createRoot(adminContainer).render(
    <React.StrictMode>
      <AdminLayout>
        {AdminComponentToRender}
      </AdminLayout>
    </React.StrictMode>
  )
} else if (rootContainer) {
  const path = window.location.pathname;
  let ComponentToRender = <App />;
  
  if (path === '/register' || path === '/register/') {
    ComponentToRender = <RegisterPage />;
  } else if (path === '/site-admin/' || path === '/site-admin' || path.includes('/site-admin/login')) {
    ComponentToRender = <AdminLogin />;
  }

  ReactDOM.createRoot(rootContainer).render(
    <React.StrictMode>
      {ComponentToRender}
    </React.StrictMode>,
  )
}


