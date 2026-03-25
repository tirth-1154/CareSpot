import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, ChevronRight, Tag, TrendingUp, Clock, AlertCircle } from 'lucide-react';

// --- Interfaces based on common backend structure ---
export interface Author {
  id: number;
  name: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  author: Author;
  category: string;
  date: string;
  readTime?: string;
}

export default function PatientBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Mock API call - Replace with your actual API endpoint
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Example: const response = await fetch('/api/blogs/');
        // const data = await response.json();
        
        // Simulating API response delay for skeleton loader demonstration
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data to demonstrate UI
        const mockData: BlogPost[] = Array(12).fill(null).map((_, i) => ({
          id: i + 1,
          title: [
            "10 Ways to Manage Stress and Anxiety",
            "The Importance of a Balanced Diet for Heart Health",
            "5 Easy Fitness Habits to Start Today",
            "Understanding Mental Health Warning Signs",
            "How Sleep Affects Your Immune System",
            "Managing Diabetes: A Complete Guide",
            "The Benefits of Regular Check-ups",
            "Simple Steps to Improve Your Digestion"
          ][i % 8],
          excerpt: "Learn how you can take control of your health with these simple, effective lifestyle changes and evidence-based tips. Discover practical advice for a healthier, happier you.",
          image: `https://images.unsplash.com/photo-${1571019614242 + i}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`,
          author: { id: 1, name: ["Dr. Sarah Jenkins", "Dr. Mark Thorne", "Nurse Emma White", "Dr. Alan Green"][i % 4] },
          category: ["Mental Health", "Diet", "Fitness", "Diseases"][i % 4],
          date: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          readTime: `${Math.floor(Math.random() * 5) + 3} min read`
        }));
        
        setPosts(mockData);
      } catch (err: any) {
        setError(err.message || 'Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const categories = ['All', 'Diet', 'Fitness', 'Mental Health', 'Diseases'];

  // Filtering Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Hero Header Section */}
      <section className="relative text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden" 
               style={{ background: 'linear-gradient(135deg, #2D9CDB 0%, #1c7ab1 100%)' }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           {/* Abstract health pattern overlay could go here */}
           <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-white blur-3xl"></div>
           <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 rounded-full bg-[#27AE60] blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
            Patient Health Blog
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 font-light drop-shadow-sm">
            Stay informed with the latest healthcare tips, wellness advice, and medical insights from our trusted experts.
          </p>
          
          {/* Main Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#2D9CDB] transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg transition-all text-lg"
              placeholder="Search conditions, treatments, or healthy habits..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset pagination on search
              }}
            />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Blog Area (Left) */}
          <div className="lg:w-2/3 xl:w-3/4">
            
            {/* Category Filter Pills (Mobile/Tablets might prefer them here) */}
            <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-200">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category 
                      ? "bg-[#2D9CDB] text-white shadow-md transform scale-105" 
                      : "bg-white text-gray-600 hover:bg-gray-100 hover:text-[#2D9CDB] border border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start mb-8">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error Loading Posts</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-48 bg-gray-200 w-full"></div>
                    <div className="p-6">
                      <div className="flex gap-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                      <div className="flex justify-between items-center mt-auto">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded-full w-28"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredPosts.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No related posts found</h3>
                <p className="text-gray-500 mb-6">We couldn't find any articles matching "{searchQuery}" in {selectedCategory}.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="px-6 py-2.5 bg-[#2D9CDB] text-white rounded-full font-medium hover:bg-[#2082b8] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Actual Blog Grid */}
            {!loading && !error && filteredPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentPosts.map(post => (
                  <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full transform hover:-translate-y-1">
                    <div className="relative overflow-hidden h-52">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#2D9CDB] shadow-sm uppercase tracking-wide">
                        {post.category}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#2D9CDB] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      {/* Meta Footer */}
                      <div className="mt-auto border-t border-gray-100 pt-4 flex flex-col gap-3">
                        <div className="flex items-center text-xs text-gray-500 gap-4">
                          <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1" /> {post.author.name}</span>
                          <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {post.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#27AE60] bg-[#27AE60]/10 px-2.5 py-1 rounded-md flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> {post.readTime || '5 min read'}
                          </span>
                          <a href={`/blog/${post.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-gray-50 hover:bg-[#2D9CDB] text-[#2D9CDB] hover:text-white rounded-full text-sm font-semibold transition-all duration-300 group/btn">
                            Read More
                            <ChevronRight className="w-4 h-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-[#2D9CDB] transition-colors"
                >
                  <ChevronRight className="w-5 h-5 transform rotate-180" />
                </button>
                
                {[...Array(totalPages)].map((_, idx) => {
                  // logic for displaying page numbers
                  const pageNumber = idx + 1;
                  // simple ellipsis logic
                  if (totalPages > 5) {
                    if (pageNumber !== 1 && pageNumber !== totalPages && Math.abs(currentPage - pageNumber) > 1) {
                      if (pageNumber === 2 || pageNumber === totalPages - 1) return <span key={idx} className="px-2 text-gray-400">...</span>;
                      return null;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors ${
                        currentPage === pageNumber 
                          ? 'bg-[#2D9CDB] text-white shadow-md' 
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#2D9CDB]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-[#2D9CDB] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <aside className="lg:w-1/3 xl:w-1/4 space-y-8">
            
            {/* Widget: Popular Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
                <Tag className="w-5 h-5 mr-2 text-[#2D9CDB]" />
                Explore Topics
              </h3>
              <ul className="space-y-3">
                {categories.filter(c => c !== 'All').map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                      className={`w-full text-left flex items-center justify-between p-2 rounded-lg transition-colors group ${
                        selectedCategory === cat ? 'bg-blue-50 text-[#2D9CDB] font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="group-hover:translate-x-1 transition-transform">{cat}</span>
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full group-hover:bg-[#2D9CDB] group-hover:text-white transition-colors">
                        {posts.filter(p => p.category === cat).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget: Trending Posts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
                <TrendingUp className="w-5 h-5 mr-2 text-[#27AE60]" />
                Trending Now
              </h3>
              <div className="space-y-5">
                {/* Getting 3 random posts for "trending" purely for UI demonstration */}
                {!loading && posts.slice(0, 3).map((post, idx) => (
                  <a key={idx} href={`/blog/${post.id}`} className="group flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#2D9CDB] transition-colors">{post.title}</h4>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> {post.date}
                      </div>
                    </div>
                  </a>
                ))}
                {loading && [1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1 py-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="rounded-2xl p-6 shadow-sm border-none overflow-hidden relative text-white" 
                 style={{ background: 'linear-gradient(135deg, #1c7ab1 0%, #2D9CDB 100%)' }}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
               <h3 className="text-xl font-bold mb-2 relative z-10">Health Insights Weekly</h3>
               <p className="text-sm text-blue-100 mb-4 relative z-10">Get the latest healthcare tips and advice delivered directly to your inbox.</p>
               <form className="relative z-10" onSubmit={(e) => e.preventDefault()}>
                 <input type="email" placeholder="Your email address" className="w-full px-4 py-2.5 rounded-lg text-gray-900 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-white/50" />
                 <button type="submit" className="w-full bg-[#27AE60] hover:bg-[#219653] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-md">
                   Subscribe Now
                 </button>
               </form>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
