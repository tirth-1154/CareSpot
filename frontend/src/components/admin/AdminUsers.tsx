import React from 'react';

interface User {
  userID: number;
  userName: string;
  email: string;
  mobileNumber: string;
  IsDoctor: boolean;
  registrationDate: string;
  registrationTime: string;
}

interface AdminUsersProps {
  data: {
    page_title: string;
    total_count: number;
    query: string;
    role_filter: string;
    users: User[];
  };
}

export function AdminUsers({ data }: AdminUsersProps) {

  const handleDelete = (id: number, name: string) => {
      // @ts-ignore
      if (window.showDeleteModal) {
          // @ts-ignore
          window.showDeleteModal(`/site-admin/delete/user/${id}/`, name);
      }
  };

  return (
    <div className="p-8 pb-12">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.page_title}</h1>
                <p className="text-slate-500 mt-1 font-medium">Manage all registered users on the platform. Total: {data.total_count}</p>
            </div>
            <span className="badge badge-admin primary p-2 px-3 text-sm">
                <i className="fa-solid fa-users me-1"></i> {data.total_count} Total
            </span>
        </div>

        <form method="GET" action="/site-admin/users/" className="filter-bar animate-in">
            <div className="search-input">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" name="q" placeholder="Search users by name, email or mobile..." defaultValue={data.query} />
            </div>
            
            <select name="role" className="filter-select" defaultValue={data.role_filter}>
                <option value="">All Roles</option>
                <option value="patient">Patients Only</option>
                <option value="doctor">Doctors Only</option>
            </select>
            
            <button type="submit" className="filter-btn">Filter</button>
            {(data.query || data.role_filter) && (
                <a href="/site-admin/users/" className="filter-reset">Clear</a>
            )}
        </form>

        <div className="admin-card animate-in">
            <div className="admin-card-body p-0">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User Info</th>
                                <th>Role</th>
                                <th>Mobile</th>
                                <th>Registration Date</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.users.length > 0 ? data.users.map(u => (
                                <tr key={u.userID}>
                                    <td>#{u.userID}</td>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle">
                                                <i className={`fa-solid ${u.IsDoctor ? 'fa-user-doctor' : 'fa-user'}`}></i>
                                            </div>
                                            <div className="user-cell-info">
                                                <div className="name">{u.userName}</div>
                                                <div className="email">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {u.IsDoctor ? (
                                            <span className="badge-admin primary"><i className="fa-solid fa-user-doctor me-1"></i> Doctor</span>
                                        ) : (
                                            <span className="badge-admin success"><i className="fa-solid fa-user me-1"></i> Patient</span>
                                        )}
                                    </td>
                                    <td>{u.mobileNumber || <span style={{color:'#94a3b8', fontStyle:'italic'}}>Not provided</span>}</td>
                                    <td>
                                        <div style={{fontWeight: 500}}>{u.registrationDate}</div>
                                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>{u.registrationTime}</div>
                                    </td>
                                    <td className="text-center">
                                        <button type="button" className="action-btn delete" onClick={() => handleDelete(u.userID, u.userName)} title="Delete User">
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <i className="fa-solid fa-users"></i>
                                            <h4>No users found</h4>
                                            <p>Try adjusting your search query.</p>
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
