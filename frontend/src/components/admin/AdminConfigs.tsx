import React, { useState } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category: string;
}

interface State {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
  state: string;
}

interface AdminConfigsProps {
  data: {
    page_title: string;
    categories?: Category[];
    subcategories?: Subcategory[];
    states?: State[];
    cities?: City[];
  };
}

export function AdminConfigs({ data }: AdminConfigsProps) {
  const isLocations = data.states !== undefined;
  const [showModal, setShowModal] = useState<string | null>(null); // 'cat', 'sub', 'state', 'city'
  const [newVal, setNewVal] = useState('');
  const [parentID, setParentID] = useState('');

  const csrfToken = document.getElementById('adminCsrfToken')?.textContent?.replace(/"/g, '').trim() || '';

  const handleDelete = (type: string, id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${type} "${name}"?`)) {
      const url = `/site-admin/delete/${type.toLowerCase()}/${id}/`;
      fetch(url, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken }
      }).then(res => res.json()).then(resData => {
        if (resData.status === 'success') window.location.reload();
        else alert(resData.message);
      });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    let url = '';
    const formData = new FormData();
    
    if (showModal === 'cat') {
      url = '/site-admin/add/category/';
      formData.append('categoryName', newVal);
    } else if (showModal === 'sub') {
      url = '/site-admin/add/subcategory/';
      formData.append('subcategoryName', newVal);
      formData.append('categoryID', parentID);
    } else if (showModal === 'state') {
      url = '/site-admin/add/state/';
      formData.append('stateName', newVal);
    } else if (showModal === 'city') {
      url = '/site-admin/add/city/';
      formData.append('cityName', newVal);
      formData.append('stateID', parentID);
    }

    fetch(url, {
      method: 'POST',
      body: formData,
      headers: { 'X-CSRFToken': csrfToken }
    }).then(() => {
        window.location.reload();
    });
  };

  return (
    <div className="p-8 pb-12 relative">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.page_title}</h1>
                <p className="text-slate-500 mt-1 font-medium">Manage system {isLocations ? 'locations' : 'categories and specializations'}.</p>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => { setShowModal(isLocations ? 'state' : 'cat'); setNewVal(''); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Add {isLocations ? 'State' : 'Category'}
                </button>
                <button 
                  onClick={() => { setShowModal(isLocations ? 'city' : 'sub'); setNewVal(''); setParentID(''); }}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Add {isLocations ? 'City' : 'Subcategory'}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Primary List (Categories or States) */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 px-1">{isLocations ? 'States' : 'Main Categories'}</h3>
                <div className="admin-card animate-in border-indigo-100 shadow-indigo-50/50">
                    <div className="admin-card-body p-0">
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(isLocations ? data.states : data.categories)?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td style={{width: '60px', color: '#64748b'}}>#{item.id}</td>
                                            <td className="font-semibold text-slate-700">{item.name}</td>
                                            <td className="text-center">
                                                <button 
                                                  onClick={() => handleDelete(isLocations ? 'State' : 'Category', item.id, item.name)}
                                                  className="action-btn delete" title="Delete"
                                                >
                                                    <i className="fa-regular fa-trash-can"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary List (Subcategories or Cities) */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 px-1">{isLocations ? 'Cities' : 'Specializations'}</h3>
                <div className="admin-card animate-in border-slate-100">
                    <div className="admin-card-body p-0">
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Parent</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(isLocations ? data.cities : data.subcategories)?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td style={{width: '60px', color: '#64748b'}}>#{item.id}</td>
                                            <td className="font-semibold text-slate-700">{item.name}</td>
                                            <td>
                                                <span className="badge-admin info text-xs px-2 py-0.5" style={{borderRadius: '10px'}}>
                                                    {isLocations ? item.state : item.category}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button 
                                                  onClick={() => handleDelete(isLocations ? 'City' : 'Subcategory', item.id, item.name)}
                                                  className="action-btn delete" title="Delete"
                                                >
                                                    <i className="fa-regular fa-trash-can"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Add Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Add New {showModal.charAt(0).toUpperCase() + showModal.slice(1)}</h3>
                    <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <form onSubmit={handleAdd} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                        <input 
                          type="text" 
                          required 
                          value={newVal}
                          onChange={(e) => setNewVal(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                          placeholder={`Enter ${showModal} name...`}
                        />
                    </div>
                    {(showModal === 'sub' || showModal === 'city') && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Parent {isLocations ? 'State' : 'Category'}</label>
                        <select 
                          required 
                          value={parentID}
                          onChange={(e) => setParentID(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                        >
                            <option value="">Select Parent...</option>
                            {(isLocations ? data.states : data.categories)?.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                      </div>
                    )}
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
                            Create {showModal}
                        </button>
                    </div>
                </form>
             </div>
          </div>
        )}
    </div>
  );
}
