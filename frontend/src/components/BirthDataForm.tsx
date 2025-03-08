import React, { useState } from 'react';
import { FormData } from '../types';

interface BirthDataFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const BirthDataForm: React.FC<BirthDataFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthday: '',
    birthtime: '',
    birthplace: '',
    jobTitle: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="form-section">
      <div className="glass p-8 rounded-xl max-w-md mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white text-center mb-8 sparkle">
          Your Cosmic Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="birthday" className="block text-white mb-2">
              Birth Date
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              required
              value={formData.birthday}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="birthtime" className="block text-white mb-2">
              Birth Time (if known)
            </label>
            <input
              type="time"
              id="birthtime"
              name="birthtime"
              value={formData.birthtime}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="birthplace" className="block text-white mb-2">
              Birth Place
            </label>
            <input
              type="text"
              id="birthplace"
              name="birthplace"
              required
              value={formData.birthplace}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-white mb-2">
              Current Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              required
              value={formData.jobTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your job title"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 py-3 px-6 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Reveal Your Cosmic Profile'
          )}
        </button>
      </div>
    </form>
  );
};

export default BirthDataForm; 