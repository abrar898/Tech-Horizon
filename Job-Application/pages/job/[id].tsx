
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { MapPinIcon, CurrencyDollarIcon, ClockIcon, BuildingOfficeIcon, CalendarIcon } from '@heroicons/react/24/outline';

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
  requirements?: string;
  benefits?: string;
}

// Mock job data - fallback if job not found
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    category: 'Technology',
    postedDate: '2024-01-15',
    description: `We are looking for an experienced frontend developer to join our growing team. You'll be working on cutting-edge web applications using the latest technologies and frameworks.

In this role, you'll collaborate with designers, product managers, and backend engineers to create exceptional user experiences. We value clean code, attention to detail, and innovative problem-solving.`,
    requirements: `• 5+ years of experience with React and TypeScript
• Strong understanding of modern JavaScript (ES6+)
• Experience with state management libraries (Redux, Zustand)
• Proficiency in CSS-in-JS solutions and responsive design
• Familiarity with testing frameworks (Jest, Cypress)
• Experience with build tools (Webpack, Vite)
• Knowledge of Git and version control workflows
• Bachelor's degree in Computer Science or equivalent experience`,
    benefits: `• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work hours and remote work options
• Professional development budget ($3,000/year)
• Modern equipment and workspace
• Catered meals and snacks
• Unlimited PTO policy
• 401(k) with company matching`
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
    category: 'Product',
    requirements: '• 3+ years of product management experience\n• Strong analytical and problem-solving skills\n• Experience with agile development methodologies',
    benefits: '• Competitive salary\n• Remote work flexibility\n• Health insurance\n• Professional development opportunities'
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
    category: 'Design',
    requirements: '• 2+ years of UX design experience\n• Proficiency in Figma, Sketch, or similar tools\n• Strong portfolio showcasing user-centered design',
    benefits: '• Flexible contract terms\n• Creative freedom\n• Collaborative work environment'
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
    category: 'Technology',
    requirements: '• 4+ years of backend development experience\n• Experience with Node.js, Python, or similar\n• Knowledge of database design and optimization',
    benefits: '• Competitive salary and bonuses\n• Health and dental insurance\n• Stock options\n• Professional development budget'
  }
];

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<Job | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      // Try to find the job from posted jobs first
      const postedJobs = JSON.parse(localStorage.getItem('postedJobs') || '[]');
      const allJobs = [...mockJobs, ...postedJobs];
      
      const foundJob = allJobs.find(j => j.id === id);
      if (foundJob) {
        setJob(foundJob);
      } else {
        // Fallback to first mock job if not found
        setJob(mockJobs[0]);
      }
    }
  }, [id]);

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create application object
    const application = {
      id: Date.now().toString(),
      jobId: job?.id,
      jobTitle: job?.title,
      company: job?.company,
      firstName: applicationData.firstName,
      lastName: applicationData.lastName,
      email: applicationData.email,
      phone: applicationData.phone,
      coverLetter: applicationData.coverLetter,
      appliedDate: new Date().toISOString()
    };

    // Save application to localStorage
    const existingApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    const updatedApplications = [...existingApplications, application];
    localStorage.setItem('jobApplications', JSON.stringify(updatedApplications));
    
    console.log('Application submitted:', application);
    alert('Application submitted successfully!');
    setShowApplicationForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApplicationData({
        ...applicationData,
        resume: e.target.files[0]
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const saveJob = () => {
    if (!job) return;
    
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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the job details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{job.title} at {job.company} - JobBoard</title>
        <meta name="description" content={`Apply for ${job.title} position at ${job.company}`} />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">JobBoard</Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Jobs</Link>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow p-8">
              {/* Job Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex items-center text-xl text-blue-600 mb-4">
                  <BuildingOfficeIcon className="h-6 w-6 mr-2" />
                  {job.company}
                </div>
                
                <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    {job.type}
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    {job.salary}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Posted {formatDate(job.postedDate)}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Apply Now
                  </button>
                  <button 
                    onClick={saveJob}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 font-medium"
                  >
                    Save Job
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 font-medium">
                    Share
                  </button>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-blue max-w-none">
                  {job.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                  <div className="prose prose-blue max-w-none">
                    {job.requirements.split('\n').map((requirement, index) => (
                      requirement.trim() && (
                        <p key={index} className="text-gray-700 mb-2 leading-relaxed">
                          {requirement}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h2>
                  <div className="prose prose-blue max-w-none">
                    {job.benefits.split('\n').map((benefit, index) => (
                      benefit.trim() && (
                        <p key={index} className="text-gray-700 mb-2 leading-relaxed">
                          {benefit}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Company:</span>
                  <p className="text-gray-900">{job.company}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Location:</span>
                  <p className="text-gray-900">{job.location}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Job Type:</span>
                  <p className="text-gray-900">{job.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Category:</span>
                  <p className="text-gray-900">{job.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Salary:</span>
                  <p className="text-gray-900">{job.salary}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Posted:</span>
                  <p className="text-gray-900">{formatDate(job.postedDate)}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full mt-6 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 font-medium"
              >
                Apply for this Position
              </button>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
                <p className="text-gray-600">at {job.company}</p>
              </div>
              
              <form onSubmit={handleApplicationSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={applicationData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={applicationData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={applicationData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={applicationData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">PDF, DOC, or DOCX format only</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    name="coverLetter"
                    rows={6}
                    value={applicationData.coverLetter}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
