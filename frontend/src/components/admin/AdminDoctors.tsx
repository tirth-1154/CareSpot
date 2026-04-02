import React from 'react';

interface Doctor {
  doctorID: number;
  displayName: string;
  email: string;
  profilePicUrl: string;
  subcategory: string;
  displayContact: string;
  yearOfExperience: number;
  mode: number;
  approval_status: string;
  avg_rating: number;
  review_count: number;
  patient_count: number;
}

interface AdminDoctorsProps {
  data: {
    page_title: string;
    total_count: number;
    query: string;
    spec_filter: string;
    subcategories: { id: number, name: string }[];
    doctors: Doctor[];
  };
}

export function AdminDoctors({ data }: AdminDoctorsProps) {
  
  const handleApprove = (id: number, name: string) => {
    if(window.confirm(`Are you sure you want to approve Dr. ${name}?`)) {
        const csrfToken = document.getElementById('adminCsrfToken')?.textContent?.replace(/"/g, '').trim() || '';
        fetch(`/site-admin/approve/doctor/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(resData => {
            if(resData.status === 'success') { window.location.reload(); }
            else { alert(resData.message); }
        }).catch(() => alert("An error occurred."));
    }
  };

  const handleReject = (id: number, name: string) => {
    if(window.confirm(`Are you sure you want to reject Dr. ${name}? An email will be sent to them.`)) {
        const csrfToken = document.getElementById('adminCsrfToken')?.textContent?.replace(/"/g, '').trim() || '';
        fetch(`/site-admin/reject/doctor/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(resData => {
            if(resData.status === 'success') { window.location.reload(); }
            else { alert(resData.message); }
        }).catch(() => alert("An error occurred."));
    }
  };

  const handleDelete = (id: number, name: string) => {
      // @ts-ignore
      if (window.showDeleteModal) {
          // @ts-ignore
          window.showDeleteModal(`/site-admin/delete/doctor/${id}/`, name);
      }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{data.page_title}</h1>
                <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base text-wrap">Manage doctor profiles and specializations. Total: {data.total_count}</p>
            </div>
            <span className="badge badge-admin success p-2 px-3 text-sm w-fit">
                <i className="fa-solid fa-user-doctor me-1"></i> {data.total_count} Doctors
            </span>
        </div>

        <form method="GET" action="/site-admin/doctors/" className="filter-bar animate-in flex flex-col md:flex-row gap-3">
            <div className="search-input w-full">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" name="q" placeholder="Search by name..." className="w-full" defaultValue={data.query} />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <select name="specialization" className="filter-select flex-1 md:flex-none md:w-48" defaultValue={data.spec_filter}>
                    <option value="">All Specializations</option>
                    {data.subcategories.map(cat => (
                       <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                    ))}
                </select>
                
                <button type="submit" className="filter-btn flex-1 md:flex-none">Filter</button>
            </div>
            
            {(data.query || data.spec_filter) && (
                <a href="/site-admin/doctors/" className="filter-reset text-center md:text-left">Clear</a>
            )}
        </form>

        <div className="admin-card animate-in overflow-hidden">
            <div className="admin-card-body p-0">
                <div className="admin-table-wrapper overflow-x-auto w-full">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Doctor Info</th>
                                <th>Specialization</th>
                                <th>Contact</th>
                                <th>Exp. / Mode</th>
                                <th>Status</th>
                                <th>Stats</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.doctors.length > 0 ? data.doctors.map(doctor => (
                                <tr key={doctor.doctorID}>
                                    <td>#{doctor.doctorID}</td>
                                    <td>
                                        <div className="user-cell">
                                            {doctor.profilePicUrl ? (
                                                <img src={doctor.profilePicUrl} alt={doctor.displayName} />
                                            ) : (
                                                <img src={`https://ui-avatars.com/api/?name=Dr+${encodeURIComponent(doctor.displayName)}&background=10b981&color=fff`} alt={doctor.displayName} />
                                            )}
                                            <div className="user-cell-info">
                                                <div className="name"> {doctor.displayName}</div>
                                                <div className="email">{doctor.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge-admin info">{doctor.subcategory}</span>
                                    </td>
                                    <td>{doctor.displayContact}</td>
                                    <td>
                                        <div style={{fontWeight: 500}}>{doctor.yearOfExperience} Years</div>
                                        <div style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px'}}>
                                            {doctor.mode === 1 ? <><i className="fa-solid fa-video text-success"></i> Online</> : 
                                             doctor.mode === 2 ? <><i className="fa-solid fa-hospital text-primary"></i> Offline</> : 
                                             <><i className="fa-solid fa-house-medical"></i> Both</>}
                                        </div>
                                    </td>
                                    <td>
                                        {doctor.approval_status === 'pending' ? <span className="badge" style={{background:'#fff3cd', color:'#856404', padding:'5px 8px', borderRadius:'4px', fontWeight:600, fontSize:'12px'}}>Pending</span> :
                                         doctor.approval_status === 'approved' ? <span className="badge" style={{background:'#d4edda', color:'#155724', padding:'5px 8px', borderRadius:'4px', fontWeight:600, fontSize:'12px'}}>Approved</span> :
                                         <span className="badge" style={{background:'#f8d7da', color:'#721c24', padding:'5px 8px', borderRadius:'4px', fontWeight:600, fontSize:'12px'}}>Rejected</span>}
                                    </td>
                                    <td>
                                        <div className="star-rating mb-1">
                                            <i className="fa-solid fa-star"></i> {doctor.avg_rating}
                                            <span style={{fontSize: '0.75rem', color: '#94a3b8'}}> ({doctor.review_count})</span>
                                        </div>
                                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>
                                            <i className="fa-solid fa-bed-pulse me-1"></i> {doctor.patient_count} Patients
                                        </div>
                                    </td>
                                    <td className="text-center" style={{whiteSpace: 'nowrap'}}>
                                        {doctor.approval_status === 'pending' && (
                                            <>
                                                <button type="button" className="action-btn" style={{color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border:'none', borderRadius:'4px', padding:'6px', margin:'0 2px'}} onClick={() => handleApprove(doctor.doctorID, doctor.displayName)} title="Approve Doctor">
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                                <button type="button" className="action-btn" style={{color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border:'none', borderRadius:'4px', padding:'6px', margin:'0 2px'}} onClick={() => handleReject(doctor.doctorID, doctor.displayName)} title="Reject Doctor">
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </>
                                        )}
                                        <button type="button" className="action-btn delete" onClick={() => handleDelete(doctor.doctorID, doctor.displayName)} title="Delete Doctor">
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <i className="fa-solid fa-user-doctor"></i>
                                            <h4>No doctors found</h4>
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
