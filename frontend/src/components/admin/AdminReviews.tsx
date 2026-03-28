import React from 'react';

interface Review {
  reviewID: number;
  doctorName: string;
  userName: string;
  userPicUrl: string;
  rating: number;
  review: string;
  createdDT: string;
}

interface AdminReviewsProps {
  data: {
    page_title: string;
    total_count: number;
    query: string;
    rating_filter: string;
    reviews: Review[];
  };
}

export function AdminReviews({ data }: AdminReviewsProps) {

  const handleDelete = (id: number) => {
      // @ts-ignore
      if (window.showDeleteModal) {
          // @ts-ignore
          window.showDeleteModal(`/site-admin/delete/review/${id}/`, `review #${id}`);
      }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <i key={i} className={i < rating ? "fa-solid fa-star" : "fa-regular fa-star"} style={{color: i < rating ? '#f59e0b' : '#cbd5e1', fontSize: '0.8rem'}}></i>
    ));
  };

  return (
    <div className="p-8 pb-12">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.page_title}</h1>
                <p className="text-slate-500 mt-1 font-medium">Monitor patient feedback and ratings. Total: {data.total_count}</p>
            </div>
            <span className="badge badge-admin warning p-2 px-3 text-sm">
                <i className="fa-solid fa-star me-1"></i> {data.total_count} Reviews
            </span>
        </div>

        <form method="GET" action="/site-admin/reviews/" className="filter-bar animate-in">
            <div className="search-input">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" name="q" placeholder="Search by doctor, patient or review..." defaultValue={data.query} />
            </div>
            
            <select name="rating" className="filter-select" defaultValue={data.rating_filter}>
                <option value="">All Ratings</option>
                {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={String(r)}>{r} Stars</option>
                ))}
            </select>
            
            <button type="submit" className="filter-btn">Filter</button>
            {(data.query || data.rating_filter) && (
                <a href="/site-admin/reviews/" className="filter-reset">Clear</a>
            )}
        </form>

        <div className="admin-card animate-in">
            <div className="admin-card-body p-0">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Patient User</th>
                                <th>Doctor</th>
                                <th>Rating</th>
                                <th style={{width: '35%'}}>Review Content</th>
                                <th>Date</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.reviews.length > 0 ? data.reviews.map(rev => (
                                <tr key={rev.reviewID}>
                                    <td>
                                        <div className="user-cell">
                                            <img src={rev.userPicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.userName)}&background=64748b&color=fff`} alt="" style={{width: '30px', height: '30px', borderRadius: '50%'}} />
                                            <div className="user-cell-info">
                                                <div className="name" style={{fontSize: '0.8rem'}}>{rev.userName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="name" style={{fontSize: '0.85rem', fontWeight: 600, color: '#334155'}}>{rev.doctorName}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1">
                                            {renderStars(rev.rating)}
                                            <span style={{marginLeft: '4px', fontSize: '0.8rem', fontWeight: 600}}>{rev.rating}/5</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{fontSize: '0.8rem', color: '#475569', lineHeight: 1.5}}>
                                            {rev.review.length > 80 ? rev.review.substring(0, 80) + '...' : rev.review}
                                        </div>
                                    </td>
                                    <td style={{fontSize: '0.8rem', color: '#64748b'}}>{rev.createdDT}</td>
                                    <td className="text-center">
                                        <button type="button" className="action-btn delete" onClick={() => handleDelete(rev.reviewID)} title="Delete Review">
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <i className="fa-solid fa-star text-warning"></i>
                                            <h4>No reviews found</h4>
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
