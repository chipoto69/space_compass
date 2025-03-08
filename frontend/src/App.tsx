import React, { useState } from 'react';
import axios from 'axios';
import CursorEffects from './components/CursorEffects';
import CosmicBackground from './components/CosmicBackground';
import { FormData, ResultData, ChatMessage, AstroData, HumanDesignData } from './types';

function App() {
  // State variables
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthday: '',
    birthtime: '12:00',
    birthplace: '',
    jobTitle: ''
  });
  const [results, setResults] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Send data to backend
      const response = await axios.post('http://localhost:5000/api/user', formData);
      
      // Update results state with response data
      setResults(response.data);
      
      // Add initial chatbot message
      setChatMessages([
        {
          text: `Welcome ${formData.name}! ${response.data.chatResponse}`,
          isBot: true
        }
      ]);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send a message to the chatbot
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    // Add user message to chat
    const newMessage = { text: messageText, isBot: false };
    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);
    
    // Chat functionality - use API if available, fallback to local response
    try {
      if (results) {
        const response = await axios.post('http://localhost:5000/api/chat', {
          message: messageText,
          userId: results.userId
        });
        
        setChatMessages([
          ...updatedMessages,
          { text: response.data.response, isBot: true }
        ]);
      }
    } catch (error) {
      // Fallback response if API fails
      setTimeout(() => {
        setChatMessages([
          ...updatedMessages, 
          { 
            text: `As a ${results?.astroData.sunSign} ${results?.hdData.type}, I suggest you follow your intuition on this matter.`, 
            isBot: true 
          }
        ]);
      }, 1000);
    }
  };

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = document.getElementById('chatInput') as HTMLInputElement;
    sendMessage(input.value);
    input.value = '';
  };

  // Function to download HD chart PDF
  const downloadChart = () => {
    if (results?.chartUrl) {
      window.open(results.chartUrl, '_blank');
    }
  };

  return (
    <div className="App relative min-h-screen text-white">
      <CosmicBackground />
      <CursorEffects />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Cosmic Guide
          </h1>
          <p className="text-xl text-blue-200">
            Discover your astrological and human design insights
          </p>
        </header>
        
        <main className="max-w-3xl mx-auto">
          {!results ? (
            <section className="form-section backdrop-blur-lg bg-black bg-opacity-30 rounded-2xl p-8 shadow-xl border border-indigo-900/30">
              <h2 className="text-2xl font-semibold mb-6 text-center text-blue-200">
                Enter Your Information
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-6">
                  <label htmlFor="name" className="block mb-2 font-medium text-blue-300">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-black bg-opacity-40 border border-indigo-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                
                <div className="form-group mb-6">
                  <label htmlFor="birthday" className="block mb-2 font-medium text-blue-300">
                    Birthday:
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-black bg-opacity-40 border border-indigo-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                
                <div className="form-group mb-6">
                  <label htmlFor="birthtime" className="block mb-2 font-medium text-blue-300">
                    Birth Time (if known):
                  </label>
                  <input
                    type="time"
                    id="birthtime"
                    name="birthtime"
                    value={formData.birthtime}
                    onChange={handleChange}
                    className="w-full p-3 bg-black bg-opacity-40 border border-indigo-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                
                <div className="form-group mb-6">
                  <label htmlFor="birthplace" className="block mb-2 font-medium text-blue-300">
                    Place of Birth:
                  </label>
                  <input
                    type="text"
                    id="birthplace"
                    name="birthplace"
                    value={formData.birthplace}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-black bg-opacity-40 border border-indigo-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                
                <div className="form-group mb-6">
                  <label htmlFor="jobTitle" className="block mb-2 font-medium text-blue-300">
                    Job Title:
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-black bg-opacity-40 border border-indigo-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Discover Your Guide'
                  )}
                </button>
                
                {error && (
                  <p className="error-message mt-4 text-red-400 text-center">
                    {error}
                  </p>
                )}
              </form>
            </section>
          ) : (
            <section className="results-section backdrop-blur-lg bg-black bg-opacity-30 rounded-2xl p-8 shadow-xl border border-indigo-900/30">
              <div className="profile-info mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-center text-blue-200">
                  Your Cosmic Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="profile-detail p-4 bg-indigo-900/30 rounded-lg">
                    <p className="mb-1 font-medium text-blue-300">Name:</p>
                    <p className="text-lg">{formData.name}</p>
                  </div>
                  <div className="profile-detail p-4 bg-indigo-900/30 rounded-lg">
                    <p className="mb-1 font-medium text-blue-300">Birthday:</p>
                    <p className="text-lg">{new Date(formData.birthday).toLocaleDateString()}</p>
                  </div>
                  <div className="profile-detail p-4 bg-indigo-900/30 rounded-lg">
                    <p className="mb-1 font-medium text-blue-300">Place of Birth:</p>
                    <p className="text-lg">{formData.birthplace}</p>
                  </div>
                  <div className="profile-detail p-4 bg-indigo-900/30 rounded-lg">
                    <p className="mb-1 font-medium text-blue-300">Job Title:</p>
                    <p className="text-lg">{formData.jobTitle}</p>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-center text-blue-200">Astrology</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-blue-300">Sun Sign</p>
                        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                          {results.astroData.sunSign}
                        </p>
                      </div>
                      
                      {results.astroData.moonSign && (
                        <div>
                          <p className="text-blue-300">Moon Sign</p>
                          <p className="text-lg font-medium text-blue-100">
                            {results.astroData.moonSign}
                          </p>
                        </div>
                      )}
                      
                      {results.astroData.ascendant && (
                        <div>
                          <p className="text-blue-300">Ascendant</p>
                          <p className="text-lg font-medium text-blue-100">
                            {results.astroData.ascendant}
                          </p>
                        </div>
                      )}
                      
                      {results.resonance && (
                        <div>
                          <p className="text-blue-300">Quantum Resonance</p>
                          <p className="text-lg font-medium text-blue-100">
                            {results.resonance}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-center text-blue-200">Human Design</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-blue-300">Type</p>
                        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
                          {results.hdData.type}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-blue-300">Authority</p>
                        <p className="text-lg font-medium text-blue-100">
                          {results.hdData.authority}
                        </p>
                      </div>
                      
                      {results.hdData.profile && (
                        <div>
                          <p className="text-blue-300">Profile</p>
                          <p className="text-lg font-medium text-blue-100">
                            {results.hdData.profile}
                          </p>
                        </div>
                      )}
                      
                      {results.archetype && (
                        <div>
                          <p className="text-blue-300">Archetype</p>
                          <p className="text-lg font-medium text-blue-100">
                            {results.archetype}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {results.chartUrl && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={downloadChart}
                      className="inline-flex items-center py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download Human Design Chart
                    </button>
                  </div>
                )}
              </div>
              
              <div className="chat-section mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-center text-blue-200">
                  Your Personalized Guide
                </h2>
                <div className="chat-messages h-80 overflow-y-auto p-4 mb-4 bg-black bg-opacity-40 rounded-lg border border-indigo-800/50">
                  {chatMessages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`message mb-3 p-3 rounded-lg max-w-3/4 ${
                        msg.isBot 
                          ? 'bg-indigo-900/60 mr-auto' 
                          : 'bg-purple-900/60 ml-auto text-right'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleChatSubmit} className="chat-input flex gap-2">
                  <input
                    type="text"
                    id="chatInput"
                    placeholder="Ask about your cosmic path..."
                    className="flex-grow p-3 bg-black bg-opacity-40 border border-indigo-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button 
                    type="submit"
                    className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                  >
                    Send
                  </button>
                </form>
              </div>
              
              <button 
                onClick={() => {
                  setResults(null);
                  setChatMessages([]);
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
              >
                Start Over
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
