import React from 'react';

interface Appointment {
  appointmentID: number;
  clientName: string;
  clientPicUrl: string;
  doctorName: string;
  doctorSubcategory: string;
  doctorPicUrl: string;
  appointmentDate: string;
  appointmentTime: string;
  isAccepted: boolean;
  isRejected: boolean;
  createdDT: string;
}

interface AdminAppointmentsProps {
  data: {
    page_title: string;
    total_count: number;
    query: string;
    status_filter: string;
    date_from: string;
    date_to: string;
    appointments: Appointment[];
  };
}

export function AdminAppointments({ data }: AdminAppointmentsProps) {

  const handleDelete = (id: number) => {
      // @ts-ignore
      if (window.showDeleteModal) {
          // @ts-ignore
          window.showDeleteModal(`/site-admin/delete/appointment/${id}/`, `appointment #APT-${id}`);
      }
  };

  return (
    <div className="p-8 pb-12">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.page_title}</h1>
                <p className="text-slate-500 mt-1 font-medium">Track and manage all bookings. Total: {data.total_count}</p>
            </div>
            <span className="badge badge-admin warning p-2 px-3 text-sm">
                <i className="fa-solid fa-calendar-check me-1"></i> {data.total_count} Appointments
            </span>
        </div>

        <form method="GET" action="/site-admin/appointments/" className="filter-bar animate-in">
            <div className="search-input">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" name="q" placeholder="Search doctor or patient..." defaultValue={data.query} />
            </div>
            
            <select name="status" className="filter-select" defaultValue={data.status_filter}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
            </select>

            <div className="flex items-center gap-2">
                <input type="date" name="date_from" defaultValue={data.date_from} className="filter-select" style={{minWidth: '130px'}} />
                <span className="text-slate-400" style={{fontSize: '0.8rem'}}>to</span>
                <input type="date" name="date_to" defaultValue={data.date_to} className="filter-select" style={{minWidth: '130px'}} />
            </div>
            
            <button type="submit" className="filter-btn">Filter Appointments</button>
            {(data.query || data.status_filter || data.date_from || data.date_to) && (
                <a href="/site-admin/appointments/" className="filter-reset">Clear</a>
            )}
        </form>

        <div className="admin-card animate-in">
            <div className="admin-card-body p-0">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Booked On</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.appointments.length > 0 ? data.appointments.map(appt => (
                                <tr key={appt.appointmentID}>
                                    <td style={{fontSize: '0.8rem', color: '#64748b'}}>#APT-{appt.appointmentID}</td>
                                    <td>
                                        <div className="user-cell">
                                            <img src={appt.clientPicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.clientName)}&background=64748b&color=fff`} alt="" style={{width: '30px', height: '30px', borderRadius: '50%'}} />
                                            <div className="user-cell-info">
                                                <div className="name" style={{fontSize: '0.8rem'}}>{appt.clientName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <img src={appt.doctorPicUrl || `https://ui-avatars.com/api/?name=Dr+${encodeURIComponent(appt.doctorName)}&background=0ea5e9&color=fff`} alt="" style={{width: '30px', height: '30px', borderRadius: '50%'}} />
                                            <div className="user-cell-info">
                                                <div className="name" style={{fontSize: '0.8rem'}}>{appt.doctorName}</div>
                                                <div className="email" style={{fontSize: '0.7rem'}}>{appt.doctorSubcategory}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{fontWeight: 500}}><i className="fa-regular fa-calendar text-indigo-500 me-1"></i> {appt.appointmentDate}</div>
                                        <div style={{fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>
                                            <i className="fa-regular fa-clock me-1"></i> {appt.appointmentTime}
                                        </div>
                                    </td>
                                    <td>
                                        {appt.isAccepted ? (
                                            <span className="badge-admin success"><i className="fa-solid fa-check me-1"></i> Accepted</span>
                                        ) : appt.isRejected ? (
                                            <span className="badge-admin danger"><i className="fa-solid fa-xmark me-1"></i> Rejected</span>
                                        ) : (
                                            <span className="badge-admin warning"><i className="fa-regular fa-clock me-1"></i> Pending</span>
                                        )}
                                    </td>
                                    <td style={{fontSize: '0.8rem', color: '#64748b'}}>{appt.createdDT}</td>
                                    <td className="text-center">
                                        <button type="button" className="action-btn delete" onClick={() => handleDelete(appt.appointmentID)} title="Delete Appointment">
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="empty-state">
                                            <i className="fa-solid fa-calendar-xmark"></i>
                                            <h4>No appointments found</h4>
                                            <p>Try adjusting your search or filters.</p>
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
