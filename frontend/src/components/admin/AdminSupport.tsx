import React from 'react';

interface Ticket {
  ticketID: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdDT: string;
}

interface AdminSupportProps {
  data: {
    page_title: string;
    total_count: number;
    query: string;
    status_filter: string;
    tickets: Ticket[];
  };
}

export function AdminSupport({ data }: AdminSupportProps) {
  
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const csrfCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';

      const formData = new FormData();
      formData.append('status', newStatus);

      const res = await fetch(`/site-admin/support/update/${id}/`, {
          method: 'POST',
          headers: {
              'X-CSRFToken': csrfToken,
          },
          body: formData,
      });

      const result = await res.json();
      if (result.status === 'success') {
          // Success feedback visually handled by select background styling in onChange hook
      } else {
          alert('Error updating status: ' + result.message);
      }
    } catch (e) {
      console.error(e);
      alert('Network error occurred.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'open': return { bg: '#fee2e2', color: '#dc2626' };
        case 'in_progress': return { bg: '#fef3c7', color: '#d97706' };
        case 'resolved': return { bg: '#dcfce7', color: '#16a34a' };
        case 'closed': return { bg: '#f1f5f9', color: '#475569' };
        default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{data.page_title}</h1>
                <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base text-wrap">Manage all support inquiries. Total: {data.total_count}</p>
            </div>
            <span className="badge badge-admin primary p-2 px-3 text-sm w-fit border border-slate-200 shadow-sm" style={{background: '#fff', color: '#0f172a'}}>
                <i className="fa-solid fa-headset text-blue-600 me-2"></i> {data.total_count} Total
            </span>
        </div>

        <form method="GET" action="/site-admin/support/" className="filter-bar animate-in flex flex-col md:flex-row gap-3">
            <div className="search-input w-full">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" name="q" placeholder="Search subject, name, email..." className="w-full" defaultValue={data.query} />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <select name="status" className="filter-select flex-1 md:flex-none md:min-w-[150px]" defaultValue={data.status_filter}>
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                
                <button type="submit" className="filter-btn flex-1 md:flex-none">Filter</button>
            </div>
            
            {(data.query || data.status_filter) && (
                <a href="/site-admin/support/" className="filter-reset text-center md:text-left">Clear</a>
            )}
        </form>

        <div className="admin-card animate-in overflow-hidden">
            <div className="admin-card-body p-0">
                <div className="admin-table-wrapper overflow-x-auto w-full">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Requester</th>
                                <th>Subject</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.tickets && data.tickets.length > 0 ? data.tickets.map(t => (
                                <tr key={t.ticketID} style={{transition: 'background 0.2s'}}>
                                    <td className="font-medium text-slate-500">#{t.ticketID}</td>
                                    <td>
                                        <div className="font-bold text-slate-900">{t.name}</div>
                                        <div className="text-xs text-slate-500">{t.email}</div>
                                    </td>
                                    <td className="font-semibold text-slate-700">{t.subject}</td>
                                    <td className="max-w-[250px] truncate text-sm text-slate-500" title={t.message}>
                                        {t.message}
                                    </td>
                                    <td className="text-sm font-medium text-slate-500 whitespace-nowrap">{t.createdDT}</td>
                                    <td className="text-center">
                                        <select 
                                            className="status-select p-2 rounded-lg border-transparent font-semibold text-xs outline-none cursor-pointer transition-colors hover:shadow-sm"
                                            defaultValue={t.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                const colors = getStatusColor(newStatus);
                                                e.target.style.background = colors.bg;
                                                e.target.style.color = colors.color;
                                                
                                                const tr = e.target.closest('tr');
                                                if(tr) {
                                                    tr.style.background = '#eff6ff';
                                                    setTimeout(() => tr.style.background = '', 800);
                                                }
                                                handleStatusChange(t.ticketID, newStatus);
                                            }}
                                            style={{
                                                background: getStatusColor(t.status).bg,
                                                color: getStatusColor(t.status).color
                                            }}
                                        >
                                            <option value="open" style={{background:'#fff', color:'#1e293b'}}>Open</option>
                                            <option value="in_progress" style={{background:'#fff', color:'#1e293b'}}>In Progress</option>
                                            <option value="resolved" style={{background:'#fff', color:'#1e293b'}}>Resolved</option>
                                            <option value="closed" style={{background:'#fff', color:'#1e293b'}}>Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <i className="fa-solid fa-inbox text-4xl mb-3 opacity-30 text-slate-400"></i>
                                            <h4 className="text-lg font-bold text-slate-700">No support tickets found</h4>
                                            <p className="text-sm text-slate-500">Everything looks good!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}
