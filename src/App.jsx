import React, { useState, useEffect } from 'react';
import { getJobs, createJob, deleteJob, loginUser, registerUser } from './api';
import { Briefcase, Plus, Trash2, ExternalLink, LogOut, Lock, Mail } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [jobs, setJobs] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Job Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('Wishlist');
  const [url, setUrl] = useState('');

  useEffect(() => { if (token) fetchJobs(); }, [token]);

  const fetchJobs = async () => {
    try { setJobs(await getJobs()); } catch { handleLogout(); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await registerUser(email, password);
        alert("Account created! Please log in.");
        setIsRegistering(false);
      } else {
        await loginUser(email, password);
        setToken(localStorage.getItem('token'));
      }
    } catch (err) { alert(err.response?.data?.detail || "Authentication Failed"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setJobs([]);
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!title || !company) return;
    await createJob({ title, company, status, url });
    setTitle(''); setCompany(''); setUrl(''); setStatus('Wishlist');
    fetchJobs();
  };

  const handleDeleteJob = async (id) => {
    await deleteJob(id);
    fetchJobs();
  };

  // Auth Screen Template
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border max-w-md w-full">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Briefcase className="h-10 w-10 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{isRegistering ? "Create Account" : "Welcome Back"}</h2>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow">
              {isRegistering ? "Sign Up" : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            {isRegistering ? "Already have an account?" : "New to the platform?"} {' '}
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-semibold hover:underline">
              {isRegistering ? "Log In" : "Register Now"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Columns dictionary helper for Kanban distribution
  const columns = ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3"><Briefcase className="text-blue-600 h-6 w-6" /><h1 className="text-xl font-bold">Job Tracker Dashboard</h1></div>
        <button onClick={handleLogout} className="flex items-center gap-2 border px-4 py-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors"><LogOut className="h-4 w-4" /> Logout</button>
      </header>

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Rapid Creation Inline Bar */}
        <form onSubmit={handleAddJob} className="bg-white p-4 rounded-xl border flex flex-wrap gap-4 items-end shadow-sm">
          <div className="flex-1 min-w-[200px]"><label className="text-xs font-semibold text-gray-500 block mb-1">JOB TITLE</label><input type="text" placeholder="Frontend Architect" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div className="flex-1 min-w-[200px]"><label className="text-xs font-semibold text-gray-500 block mb-1">COMPANY</label><input type="text" placeholder="Stripe" value={company} onChange={e=>setCompany(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div className="w-[180px]"><label className="text-xs font-semibold text-gray-500 block mb-1">STAGE</label><select value={status} onChange={e=>setStatus(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500">{columns.map(col=><option key={col} value={col}>{col}</option>)}</select></div>
          <div className="flex-1 min-w-[200px]"><label className="text-xs font-semibold text-gray-500 block mb-1">POSTING URL</label><input type="url" placeholder="https://..." value={url} onChange={e=>setUrl(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 h-[42px]"><Plus className="h-4 w-4" /> Add</button>
        </form>

        {/* Dynamic Kanban Boards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
          {columns.map(col => {
            const filteredJobs = jobs.filter(j => j.status === col);
            return (
              <div key={col} className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-w-[250px] flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700 tracking-wide uppercase text-sm">{col}</h3>
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md text-xs font-bold">{filteredJobs.length}</span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {filteredJobs.map(job => (
                    <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow relative group">
                      <h4 className="font-bold text-gray-900 pr-6 leading-snug">{job.title}</h4>
                      <p className="text-sm text-gray-500 font-medium mb-3">{job.company}</p>
                      <div className="flex items-center gap-2">
                        {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600"><ExternalLink className="h-3.5 w-3.5" /></a>}
                        <button onClick={() => handleDeleteJob(job.id)} className="absolute right-3 bottom-3 text-gray-300 hover:text-red-600 p-1 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;