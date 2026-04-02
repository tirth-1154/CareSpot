import React from 'react';

interface Blog {
  postID: number;
  title: string;
  doctorName: string;
  doctorPicUrl: string;
  description: string;
  createDT: string;
}

interface AdminBlogsProps {
  data: {
    page_title: string;
    total_count: number;
    query: string;
    blogs: Blog[];
  };
}

export function AdminBlogs({ data }: AdminBlogsProps) {

  const handleDelete = (id: number, title: string) => {
      // @ts-ignore
      if (window.showDeleteModal) {
          // @ts-ignore
          window.showDeleteModal(`/site-admin/delete/blog/${id}/`, title);
      }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{data.page_title}</h1>
                <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base text-wrap">Manage health blogs and articles shared by doctors. Total: {data.total_count}</p>
            </div>
            <span className="badge badge-admin primary p-2 px-3 text-sm w-fit">
                <i className="fa-solid fa-file-text me-1"></i> {data.total_count} Blogs
            </span>
        </div>

        <form method="GET" action="/site-admin/blogs/" className="filter-bar animate-in flex flex-col md:flex-row gap-3">
            <div className="search-input w-full">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" name="q" placeholder="Search by title, doctor..." className="w-full" defaultValue={data.query} />
            </div>
            
            <button type="submit" className="filter-btn w-full md:w-auto">Search Blogs</button>
            {data.query && (
                <a href="/site-admin/blogs/" className="filter-reset text-center md:text-left">Clear</a>
            )}
        </form>

        <div className="admin-card animate-in overflow-hidden">
            <div className="admin-card-body p-0">
                <div className="admin-table-wrapper overflow-x-auto w-full">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Blog Info</th>
                                <th>Author (Doctor)</th>
                                <th>Description</th>
                                <th>Posted Date</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.blogs.length > 0 ? data.blogs.map(blog => (
                                <tr key={blog.postID}>
                                    <td>
                                        <div className="name" style={{fontSize: '0.9rem', fontWeight: 600, color: '#334155'}}>{blog.title}</div>
                                        <div style={{fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>ID: #{blog.postID}</div>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <img src={blog.doctorPicUrl || `https://ui-avatars.com/api/?name=Dr+${encodeURIComponent(blog.doctorName)}&background=4F46E5&color=fff`} alt="" style={{width: '30px', height: '30px', borderRadius: '50%'}} />
                                            <div className="user-cell-info">
                                                <div className="name" style={{fontSize: '0.8rem'}}>{blog.doctorName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, maxWidth: '300px'}}>
                                            {blog.description.length > 100 ? blog.description.substring(0, 100) + '...' : blog.description}
                                        </div>
                                    </td>
                                    <td style={{fontSize: '0.8rem', color: '#64748b'}}>{blog.createDT}</td>
                                    <td className="text-center">
                                        <button type="button" className="action-btn delete" onClick={() => handleDelete(blog.postID, blog.title)} title="Delete Blog">
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            <i className="fa-solid fa-file-lines"></i>
                                            <h4>No blogs found</h4>
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
