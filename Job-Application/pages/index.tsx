
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MagnifyingGlassIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedDate: string;
  category: string;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    description: 'We are looking for an experienced frontend developer to join our team...',
    postedDate: '2024-01-15',
    category: 'Technology'
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    description: 'Lead product strategy and development for our innovative platform...',
    postedDate: '2024-01-14',
    category: 'Product'
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'New York, NY',
    type: 'Contract',
    salary: '$80,000 - $100,000',
    description: 'Create beautiful and intuitive user experiences...',
    postedDate: '2024-01-13',
    category: 'Design'
  },
  {
    id: '4',
    title: 'Backend Engineer',
    company: 'CloudTech',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$110,000 - $140,000',
    description: 'Build scalable backend systems and APIs...',
    postedDate: '2024-01-12',
    category: 'Technology'
  }
];

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    // Load jobs from localStorage if available, otherwise use mock data
    if (typeof window !== 'undefined') {
      const savedJobs = localStorage.getItem('postedJobs');
      if (savedJobs) {
        return [...mockJobs, ...JSON.parse(savedJobs)];
      }
    }
    return mockJobs;
  });
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Initialize filteredJobs on mount and when jobs change
  useEffect(() => {
    setFilteredJobs(jobs);
  }, []);

  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCategory = categoryFilter === '' || job.category === categoryFilter;
      const matchesType = typeFilter === '' || job.type === typeFilter;
      
      return matchesSearch && matchesLocation && matchesCategory && matchesType;
    });

    // Sort the filtered jobs
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'salary-high':
          const aSalary = extractSalaryNumber(a.salary);
          const bSalary = extractSalaryNumber(b.salary);
          return bSalary - aSalary;
        case 'salary-low':
          const aSalaryLow = extractSalaryNumber(a.salary);
          const bSalaryLow = extractSalaryNumber(b.salary);
          return aSalaryLow - bSalaryLow;
        case 'date':
        default:
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
    });
    
    setFilteredJobs(sorted);
  }, [searchTerm, locationFilter, categoryFilter, typeFilter, jobs, sortBy]);

  const extractSalaryNumber = (salaryString: string) => {
    if (!salaryString || salaryString === 'Salary not specified') return 0;
    const numbers = salaryString.match(/\d+/g);
    if (!numbers) return 0;
    // Use the higher number if it's a range
    return parseInt(numbers[numbers.length - 1]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const saveJob = (job: Job) => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobsList') || '[]');
    const isAlreadySaved = savedJobs.some((savedJob: any) => savedJob.id === job.id);
    
    if (!isAlreadySaved) {
      const jobToSave = {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        savedDate: new Date().toISOString()
      };
      savedJobs.push(jobToSave);
      localStorage.setItem('savedJobsList', JSON.stringify(savedJobs));
      alert('Job saved successfully!');
    } else {
      alert('Job is already saved!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>JobBoard - Find Your Dream Job</title>
        <meta name="description" content="Find the perfect job opportunity" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">JobBoard</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-900 hover:text-blue-600 font-medium">
                Jobs
              </Link>
              <Link href="/dashboard" className="text-gray-500 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Post a Job
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Find Your Dream Job</h2>
          <p className="text-xl mb-8">Discover thousands of job opportunities from top companies</p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <button className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 font-medium">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="Technology">Technology</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('');
                    setCategoryFilter('');
                    setTypeFilter('');
                  }}
                  className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredJobs.length} Jobs Found
              </h3>
              <select 
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Most Recent</option>
                <option value="salary-high">Salary: High to Low</option>
                <option value="salary-low">Salary: Low to High</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h4>
                      <p className="text-lg text-blue-600 mb-2">{job.company}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{job.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Posted {formatDate(job.postedDate)}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => saveJob(job)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Save
                          </button>
                          <Link 
                            href={`/job/${job.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                          >
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
