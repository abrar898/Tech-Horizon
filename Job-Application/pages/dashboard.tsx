
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { BellIcon, BookmarkIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Rejected' | 'Accepted';
}

interface Alert {
  id: string;
  title: string;
  keywords: string;
  location: string;
  frequency: string;
  isActive: boolean;
}

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  savedDate: string;
}

const mockApplications: Application[] = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    appliedDate: '2024-01-15',
    status: 'Under Review'
  },
  {
    id: '2',
    jobTitle: 'Product Manager',
    company: 'StartupXYZ',
    appliedDate: '2024-01-10',
    status: 'Interview'
  },
  {
    id: '3',
    jobTitle: 'UX Designer',
    company: 'Design Studio',
    appliedDate: '2024-01-08',
    status: 'Applied'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Frontend Developer Jobs',
    keywords: 'React, JavaScript, Frontend',
    location: 'San Francisco',
    frequency: 'Daily',
    isActive: true
  },
  {
    id: '2',
    title: 'Remote Product Roles',
    keywords: 'Product Manager, Remote',
    location: 'Remote',
    frequency: 'Weekly',
    isActive: true
  }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    keywords: '',
    location: '',
    frequency: 'Daily'
  });

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApplications = localStorage.getItem('jobApplications');
      const savedAlerts = localStorage.getItem('jobAlerts');
      const savedJobsList = localStorage.getItem('savedJobsList');

      setApplications(savedApplications ? JSON.parse(savedApplications) : mockApplications);
      setAlerts(savedAlerts ? JSON.parse(savedAlerts) : mockAlerts);
      setSavedJobs(savedJobsList ? JSON.parse(savedJobsList) : []);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Interview': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Accepted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleAlert = (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('jobAlerts', JSON.stringify(updatedAlerts));
  };

  const createAlert = () => {
    if (!newAlert.title.trim() || !newAlert.keywords.trim()) {
      alert('Please fill in title and keywords');
      return;
    }

    const alert = {
      id: Date.now().toString(),
      title: newAlert.title,
      keywords: newAlert.keywords,
      location: newAlert.location || 'Any',
      frequency: newAlert.frequency,
      isActive: true
    };

    const updatedAlerts = [...alerts, alert];
    setAlerts(updatedAlerts);
    localStorage.setItem('jobAlerts', JSON.stringify(updatedAlerts));
    
    setNewAlert({ title: '', keywords: '', location: '', frequency: 'Daily' });
    setShowNewAlert(false);
  };

  const deleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('jobAlerts', JSON.stringify(updatedAlerts));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - JobBoard</title>
        <meta name="description" content="Manage your job applications and alerts" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">JobBoard</Link>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-blue-600">
                Jobs
              </Link>
              <Link href="/dashboard" className="text-gray-900 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Post a Job
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
          <p className="text-gray-600">Manage your job applications and set up job alerts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button 
            onClick={() => setActiveTab('applications')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => a.isActive).length}</p>
              </div>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <BookmarkIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{savedJobs.length}</p>
              </div>
            </div>
          </button>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Applications
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'alerts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Job Alerts
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Saved Jobs
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">My Applications</h2>
                  <span className="text-gray-500">{applications.length} applications</span>
                </div>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{application.jobTitle}</h3>
                          <p className="text-blue-600">{application.company}</p>
                          <p className="text-sm text-gray-500">Applied on {new Date(application.appliedDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Job Alerts</h2>
                  <button
                    onClick={() => setShowNewAlert(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create New Alert
                  </button>
                </div>

                {showNewAlert && (
                  <div className="mb-6 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                    <h3 className="text-lg font-semibold mb-4">Create New Job Alert</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Alert title"
                        value={newAlert.title}
                        onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Keywords (e.g., React, JavaScript)"
                        value={newAlert.keywords}
                        onChange={(e) => setNewAlert({...newAlert, keywords: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={newAlert.location}
                        onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select 
                        value={newAlert.frequency}
                        onChange={(e) => setNewAlert({...newAlert, frequency: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={createAlert}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Create Alert
                      </button>
                      <button
                        onClick={() => setShowNewAlert(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {alert.isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Keywords: {alert.keywords}</p>
                          <p className="text-sm text-gray-600 mb-1">Location: {alert.location}</p>
                          <p className="text-sm text-gray-600">Frequency: {alert.frequency}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAlert(alert.id)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              alert.isActive
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {alert.isActive ? 'Pause' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => deleteAlert(alert.id)}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Jobs Tab */}
            {activeTab === 'saved' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Saved Jobs</h2>
                  <span className="text-gray-500">{savedJobs.length} saved jobs</span>
                </div>
                {savedJobs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BookmarkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Your saved jobs will appear here</p>
                    <p className="text-sm mt-2">Start saving jobs from the <Link href="/" className="text-blue-600 hover:underline">job listings</Link></p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedJobs.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-blue-600">{job.company}</p>
                            <p className="text-sm text-gray-500">{job.location}</p>
                            <p className="text-sm text-gray-500">{job.salary}</p>
                            <p className="text-xs text-gray-400 mt-2">Saved on {new Date(job.savedDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                            <Link href={`/job/${job.id}`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
