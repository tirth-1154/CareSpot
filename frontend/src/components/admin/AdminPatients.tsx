import React from 'react';

interface Patient {
  clientID: number;
  name: string;
  email: string;
  avatarLetter: string;
  contactNo: string;
  gender: string;
  age: number;
  bloodGroup: string;
  address: string;
}

interface AdminPatientsProps {
  data: {
    page_title: string;
    total_count: number;
    query: string;
    gender_filter: string;
    blood_filter: string;
    patients: Patient[];
  };
}

export function AdminPatients({ data }: AdminPatientsProps) {

  const handleDelete = (id: number, name: string) => {
      // @ts-ignore
      if (window.showDeleteModal) {
          // @ts-ignore
          window.showDeleteModal(`/site-admin/delete/patient/${id}/`, name);
      }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{data.page_title}</h1>
                <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base text-wrap">Manage and view patient demographics. Total: {data.total_count}</p>
            </div>
            <span className="badge badge-admin info p-2 px-3 text-sm w-fit">
                <i className="fa-solid fa-bed-pulse me-1"></i> {data.total_count} Patients
            </span>
        </div>

        <form method="GET" action="/site-admin/patients/" className="filter-bar animate-in flex flex-col md:flex-row gap-3">
            <div className="search-input w-full">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" name="q" placeholder="Search by name..." className="w-full" defaultValue={data.query} />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <select name="gender" className="filter-select flex-1 md:flex-none md:min-w-[120px]" defaultValue={data.gender_filter}>
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                
                <select name="blood" className="filter-select flex-1 md:flex-none md:min-w-[120px]" defaultValue={data.blood_filter}>
                    <option value="">Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                    ))}
                </select>
                
                <button type="submit" className="filter-btn flex-1 md:flex-none">Filter</button>
            </div>
            
            {(data.query || data.gender_filter || data.blood_filter) && (
                <a href="/site-admin/patients/" className="filter-reset text-center md:text-left">Clear</a>
            )}
        </form>

        <div className="admin-card animate-in overflow-hidden">
            <div className="admin-card-body p-0">
                <div className="admin-table-wrapper overflow-x-auto w-full">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patient Info</th>
                                <th>Demographics</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.patients.length > 0 ? data.patients.map(p => (
                                <tr key={p.clientID}>
                                    <td>#{p.clientID}</td>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle" style={{background: '#e0e7ff', color: '#4f46e5'}}>
                                                {p.avatarLetter}
                                            </div>
                                            <div className="user-cell-info">
                                                <div className="name">{p.name}</div>
                                                <div className="email">{p.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{fontWeight: 500, color: '#334155'}}>{p.age || 'N/A'} Years, {p.gender || 'N/A'}</div>
                                        {p.bloodGroup && (
                                            <span className="badge-admin danger mt-1 d-inline-block">
                                                <i className="fa-solid fa-droplet me-1"></i> {p.bloodGroup}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{fontWeight: 500}}>{p.contactNo || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Not provided</span>}</span>
                                    </td>
                                    <td>
                                        <span style={{color: '#64748b', fontSize: '0.875rem'}}>
                                            {p.address ? (p.address.length > 40 ? p.address.substring(0, 40) + '...' : p.address) : 'No address'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <button type="button" className="action-btn delete" onClick={() => handleDelete(p.clientID, p.name)} title="Delete Patient">
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <i className="fa-solid fa-bed-pulse"></i>
                                            <h4>No patients found</h4>
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
