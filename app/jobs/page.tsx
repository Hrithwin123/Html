"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { getUserJobs, type JobStatus } from "@/lib/api";
import { Activity, Clock, CheckCircle2, PlayCircle, BarChart3, AlertCircle } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const userDataString = localStorage.getItem("user-data");
        if (!userDataString) {
          window.location.href = "/auth";
          return;
        }
        
        const user = JSON.parse(userDataString);
        const userId = user._id || user.id;
        
        if (!userId) {
          throw new Error("User ID not found");
        }

        const data = await getUserJobs(userId);
        setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load your simulation history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
    
    // Auto refresh every 10 seconds if there are running jobs
    const interval = setInterval(() => {
      setJobs((currentJobs) => {
        const hasRunningJobs = currentJobs.some(j => j.status === 'running' || j.status === 'queued');
        if (hasRunningJobs) {
          fetchJobs();
        }
        return currentJobs;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="text-emerald-500" />;
      case 'running': return <Activity className="text-blue-500 animate-pulse" />;
      case 'queued': return <Clock className="text-amber-500" />;
      case 'failed': return <AlertCircle className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'done': return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case 'running': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'queued': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'failed': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-10 mt-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Simulations</h1>
              <p className="text-lg text-gray-500">Your past and ongoing market simulation experiments</p>
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <button 
                onClick={() => window.location.href = '/main'}
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-gray-800 transition-colors"
              >
                <PlayCircle size={20} />
                New Simulation
              </button>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border text-center border-gray-200 rounded-3xl p-16 shadow-sm flex flex-col items-center justify-center"
            >
              <BarChart3 size={64} className="text-gray-300 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No simulations yet</h3>
              <p className="text-gray-500 mb-8 max-w-sm">Launch your first market simulation to predict social adoption and network effects.</p>
              <button 
                onClick={() => window.location.href = '/main'}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all"
              >
                Launch Simulation
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.job_id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  onClick={() => window.location.href = `/results-frontend?jobId=${job.job_id}`}
                  className="group bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6 w-full">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadgeClass(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      {new Date(job.created_at * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mb-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {job.product || "Untitled Product"}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      Market: {job.market || "Unknown"}
                    </p>
                  </div>
                  
                  <div className="flex items-end justify-between w-full mt-auto pt-4 border-t border-gray-100">
                    <div>
                      {job.status === 'done' ? (
                        <div>
                          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Final Adoption</p>
                          <p className="text-2xl font-black text-indigo-600">
                            {job.final_adoption_pct ? `${job.final_adoption_pct.toFixed(1)}%` : '---'}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full min-w-[120px]">
                          <p className="text-xs text-gray-500 mb-2 truncate max-w-[180px]">{job.progress}</p>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.max(5, (job.progress_step / 6) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                      <ArrowRight />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Arrow icon inline
function ArrowRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );
}
