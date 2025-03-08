const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const { logger, stream } = require('./utils/logger');

// Load Swagger documentation
const swaggerDocument = require('./swagger.json');

// Create the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/charts', express.static(path.join(__dirname, '..', 'data', 'charts')));

// Ensure required directories exist
const dirs = [
  path.join(__dirname, '..', 'data', 'charts'),
  path.join(__dirname, '..', 'logs')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'astro_guide.db'), (err) => {
  if (err) {
    logger.error('Error opening database', { error: err.message });
  } else {
    logger.info('Connected to the SQLite database.');
    
    // Create users table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birthday TEXT NOT NULL,
        birthtime TEXT NOT NULL,
        birthplace TEXT NOT NULL,
        job_title TEXT NOT NULL,
        astro_data TEXT NOT NULL,
        hd_data TEXT NOT NULL,
        resonance TEXT,
        archetype TEXT,
        chart_url TEXT,
        lat REAL,
        lng REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        logger.error('Error creating users table', { error: err.message });
      } else {
        logger.info('Users table ready');
      }
    });

    // Create chat_messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        logger.error('Error creating chat table', { error: err.message });
      } else {
        logger.info('Chat messages table ready');
      }
    });
  }
});

// Load city coordinates
const loadCities = () => {
  try {
    const citiesData = fs.readFileSync(path.join(__dirname, '..', 'data', 'cities.json'), 'utf8');
    return JSON.parse(citiesData);
  } catch (error) {
    console.error('Error loading cities data:', error);
    return {};
  }
};

const cities = loadCities();

// Function to get coordinates for a place
const getCoordinates = (place) => {
  const normalizedPlace = place.toLowerCase().trim();
  
  // Try to find exact match
  if (cities[normalizedPlace]) {
    return {
      lat: cities[normalizedPlace].lat,
      lng: cities[normalizedPlace].lng
    };
  }
  
  // Try to find partial match
  for (const [city, data] of Object.entries(cities)) {
    if (normalizedPlace.includes(city) || city.includes(normalizedPlace)) {
      return {
        lat: data.lat,
        lng: data.lng
      };
    }
  }
  
  // Default fallback
  console.log(`Location not found: ${place}. Using default coordinates.`);
  return { lat: 0, lng: 0 };
};

// Run Python script and get the result
const runPythonScript = (scriptPath, args) => {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const process = spawn(pythonPath, [scriptPath, ...args]);
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    process.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(`Error: ${errorOutput}`);
        reject(new Error(`Script execution failed: ${errorOutput}`));
      } else {
        try {
          resolve(JSON.parse(output));
        } catch (error) {
          reject(new Error(`Failed to parse script output: ${output}`));
        }
      }
    });
  });
};

// Define resonance based on astrology and human design
const determineResonance = (astroData, hdData) => {
  // Simple example logic
  const sunSign = astroData.sunSign;
  const hdType = hdData.type;
  
  // Element categorization
  const fireElements = ['Aries', 'Leo', 'Sagittarius'];
  const earthElements = ['Taurus', 'Virgo', 'Capricorn'];
  const airElements = ['Gemini', 'Libra', 'Aquarius'];
  const waterElements = ['Cancer', 'Scorpio', 'Pisces'];
  
  // Determine element resonance
  let elementResonance = '';
  if (fireElements.includes(sunSign)) {
    elementResonance = 'Fire';
  } else if (earthElements.includes(sunSign)) {
    elementResonance = 'Earth';
  } else if (airElements.includes(sunSign)) {
    elementResonance = 'Air';
  } else if (waterElements.includes(sunSign)) {
    elementResonance = 'Water';
  }
  
  // Create resonance description
  let resonance = '';
  
  if (hdType === 'Generator' || hdType === 'Manifesting Generator') {
    resonance = `${elementResonance} energy channeled through creative work`;
  } else if (hdType === 'Projector') {
    resonance = `${elementResonance} energy focused through guiding others`;
  } else if (hdType === 'Manifestor') {
    resonance = `${elementResonance} energy expressed through initiative`;
  } else if (hdType === 'Reflector') {
    resonance = `${elementResonance} energy sampled and reflected over time`;
  }
  
  return resonance;
};

// Define archetype based on astrological and human design data
const determineArchetype = (astroData, hdData) => {
  // Simple example logic
  const sunSign = astroData.sunSign;
  const hdType = hdData.type;
  
  // Archetype mapping
  const archetypeMap = {
    'Aries': {
      'Generator': 'The Warrior (like Achilles)',
      'Projector': 'The Strategist (like Sun Tzu)',
      'Manifestor': 'The Pioneer (like Amelia Earhart)',
      'Reflector': 'The Observer (like Jane Goodall)'
    },
    'Taurus': {
      'Generator': 'The Builder (like Frank Lloyd Wright)',
      'Projector': 'The Artisan (like Georgia O\'Keeffe)',
      'Manifestor': 'The Provider (like Jamie Oliver)',
      'Reflector': 'The Conservator (like John Muir)'
    },
    'Gemini': {
      'Generator': 'The Messenger (like Mercury)',
      'Projector': 'The Teacher (like Socrates)',
      'Manifestor': 'The Communicator (like Oscar Wilde)',
      'Reflector': 'The Diplomat (like Kofi Annan)'
    },
    'Cancer': {
      'Generator': 'The Nurturer (like Mother Teresa)',
      'Projector': 'The Caretaker (like Florence Nightingale)',
      'Manifestor': 'The Protector (like Diana)',
      'Reflector': 'The Empathizer (like Carl Rogers)'
    },
    'Leo': {
      'Generator': 'The Performer (like Elvis Presley)',
      'Projector': 'The Director (like Steven Spielberg)',
      'Manifestor': 'The Leader (like Alexander the Great)',
      'Reflector': 'The Magnifier (like Oprah Winfrey)'
    },
    'Virgo': {
      'Generator': 'The Craftsperson (like Leonardo da Vinci)',
      'Projector': 'The Analyst (like Sherlock Holmes)',
      'Manifestor': 'The Perfectionist (like Marie Curie)',
      'Reflector': 'The Purifier (like Gandhi)'
    },
    'Libra': {
      'Generator': 'The Harmonizer (like Jimmy Carter)',
      'Projector': 'The Mediator (like Desmond Tutu)',
      'Manifestor': 'The Peacemaker (like Eleanor Roosevelt)',
      'Reflector': 'The Judge (like Ruth Bader Ginsburg)'
    },
    'Scorpio': {
      'Generator': 'The Investigator (like Marie Curie)',
      'Projector': 'The Alchemist (like Carl Jung)',
      'Manifestor': 'The Phoenix (like Frida Kahlo)',
      'Reflector': 'The Mystic (like Rumi)'
    },
    'Sagittarius': {
      'Generator': 'The Explorer (like Amelia Earhart)',
      'Projector': 'The Philosopher (like Aristotle)',
      'Manifestor': 'The Visionary (like Walt Disney)',
      'Reflector': 'The Seeker (like Joseph Campbell)'
    },
    'Capricorn': {
      'Generator': 'The Builder (like Benjamin Franklin)',
      'Projector': 'The Manager (like Warren Buffet)',
      'Manifestor': 'The Authority (like Margaret Thatcher)',
      'Reflector': 'The Elder (like Nelson Mandela)'
    },
    'Aquarius': {
      'Generator': 'The Innovator (like Thomas Edison)',
      'Projector': 'The Humanitarian (like Martin Luther King Jr.)',
      'Manifestor': 'The Revolutionary (like Galileo)',
      'Reflector': 'The Outsider (like Alan Turing)'
    },
    'Pisces': {
      'Generator': 'The Artist (like Claude Monet)',
      'Projector': 'The Healer (like Carl Jung)',
      'Manifestor': 'The Dreamer (like Albert Einstein)',
      'Reflector': 'The Mystic (like Joan of Arc)'
    }
  };
  
  return archetypeMap[sunSign]?.[hdType] || 'The Cosmic Voyager';
};

// Generate chatbot response
const generateChatbotResponse = (userData, astroData, hdData, message) => {
  // Analyze the message for keywords
  const messageKeywords = {
    career: ['career', 'job', 'work', 'profession', 'occupation'],
    love: ['love', 'relationship', 'partner', 'marriage', 'dating', 'romance'],
    health: ['health', 'wellness', 'fitness', 'diet', 'exercise', 'healing'],
    purpose: ['purpose', 'meaning', 'mission', 'destiny', 'path', 'calling'],
    guidance: ['guide', 'advice', 'suggest', 'recommend', 'help', 'guidance']
  };
  
  // Check if message contains any keywords
  let topic = 'general';
  for (const [category, words] of Object.entries(messageKeywords)) {
    if (words.some(word => message.toLowerCase().includes(word))) {
      topic = category;
      break;
    }
  }
  
  // Generate response based on user data and topic
  let response = '';
  
  switch (topic) {
    case 'career':
      response = `As a ${astroData.sunSign} ${hdData.type}, your professional strengths are unique. `;
      
      if (hdData.type === 'Generator' || hdData.type === 'Manifesting Generator') {
        response += `Your natural ability to sustain energy makes you excellent at roles requiring consistent output. `;
      } else if (hdData.type === 'Projector') {
        response += `Your gift for seeing others clearly makes you an excellent guide, manager, or advisor. `;
      } else if (hdData.type === 'Manifestor') {
        response += `Your ability to initiate makes you a natural entrepreneur or leader in your field. `;
      } else {
        response += `Your reflective nature gives you unique insights that others might miss. `;
      }
      
      response += `With your ${astroData.sunSign} traits, you thrive in environments that value your ${getSignStrength(astroData.sunSign)}.`;
      break;
      
    case 'love':
      response = `In relationships, your ${astroData.sunSign} energy combines with your ${hdData.type} design in fascinating ways. `;
      
      if (hdData.type === 'Generator' || hdData.type === 'Manifesting Generator') {
        response += `You bring consistent energy and responsiveness to your partnerships. `;
      } else if (hdData.type === 'Projector') {
        response += `You see your partners deeply and can offer profound guidance when invited. `;
      } else if (hdData.type === 'Manifestor') {
        response += `You initiate and lead in relationships, but remember to inform your partner of your plans. `;
      } else {
        response += `You reflect your partner's energy, giving you deep empathy but requiring time for processing. `;
      }
      
      response += `Your ${astroData.sunSign} traits mean you value ${getSignRelationshipValue(astroData.sunSign)} in your connections.`;
      break;
      
    case 'health':
      response = `For optimal wellbeing, your ${hdData.type} energy needs specific attention. `;
      
      if (hdData.type === 'Generator' || hdData.type === 'Manifesting Generator') {
        response += `Regular physical activity that you enjoy is essential for your sacral energy. `;
      } else if (hdData.type === 'Projector') {
        response += `Rest and recognition are critical - don't overextend yourself trying to keep up with others. `;
      } else if (hdData.type === 'Manifestor') {
        response += `You need freedom and space to discharge your powerful energy. `;
      } else {
        response += `Your health is tied to your environment - seek places that feel nourishing. `;
      }
      
      response += `As a ${astroData.sunSign}, paying attention to your ${getSignBodyFocus(astroData.sunSign)} can support your overall balance.`;
      break;
      
    case 'purpose':
      response = `Your cosmic purpose blends your ${astroData.sunSign} essence with your ${hdData.type} design. `;
      
      if (hdData.authority === 'Sacral') {
        response += `Trust your gut responses to guide you toward what's correct for you. `;
      } else if (hdData.authority === 'Emotional') {
        response += `Ride the waves of your emotions and make decisions over time for clarity. `;
      } else if (hdData.authority === 'Splenic') {
        response += `Your intuitive hits are instantaneous wisdom - honor them. `;
      } else {
        response += `Your ${hdData.authority} authority is your inner guidance system - learn to listen to it. `;
      }
      
      response += `When you align with your design and cosmic signature, you'll find yourself ${getPurposeOutcome(astroData.sunSign, hdData.type)}.`;
      break;
      
    default:
      response = `As a ${astroData.sunSign} ${hdData.type}, your cosmic signature has unique gifts and challenges. `;
      response += `Your ${hdData.authority} authority guides your decisions best when you ${getAuthorityAdvice(hdData.authority)}. `;
      response += `Consider exploring how your ${astroData.moonSign || 'moon sign'} influences your emotional landscape as well. `;
      response += `What specific questions do you have about your design or cosmic path?`;
  }
  
  return response;
};

// Helper functions for response generation
const getSignStrength = (sign) => {
  const strengths = {
    'Aries': 'initiative and courage',
    'Taurus': 'stability and resourcefulness',
    'Gemini': 'versatility and communication',
    'Cancer': 'intuition and nurturing',
    'Leo': 'creativity and leadership',
    'Virgo': 'analysis and practical solutions',
    'Libra': 'diplomacy and aesthetic sense',
    'Scorpio': 'depth and transformation',
    'Sagittarius': 'vision and optimism',
    'Capricorn': 'discipline and management',
    'Aquarius': 'innovation and humanitarian values',
    'Pisces': 'compassion and artistic expression'
  };
  
  return strengths[sign] || 'unique talents';
};

const getSignRelationshipValue = (sign) => {
  const values = {
    'Aries': 'excitement and independence',
    'Taurus': 'loyalty and sensuality',
    'Gemini': 'mental connection and variety',
    'Cancer': 'emotional security and nurturing',
    'Leo': 'admiration and romance',
    'Virgo': 'practical support and thoughtfulness',
    'Libra': 'harmony and partnership',
    'Scorpio': 'intensity and depth',
    'Sagittarius': 'freedom and adventure',
    'Capricorn': 'commitment and stability',
    'Aquarius': 'friendship and intellectual stimulation',
    'Pisces': 'spiritual connection and empathy'
  };
  
  return values[sign] || 'authentic connection';
};

const getSignBodyFocus = (sign) => {
  const focus = {
    'Aries': 'head and adrenals',
    'Taurus': 'throat and thyroid',
    'Gemini': 'lungs and nervous system',
    'Cancer': 'digestive system and breasts',
    'Leo': 'heart and spine',
    'Virgo': 'intestines and assimilation',
    'Libra': 'kidneys and balance',
    'Scorpio': 'reproductive system and elimination',
    'Sagittarius': 'liver and thighs',
    'Capricorn': 'bones and joints',
    'Aquarius': 'circulation and ankles',
    'Pisces': 'lymphatic system and feet'
  };
  
  return focus[sign] || 'overall energy balance';
};

const getPurposeOutcome = (sign, type) => {
  if (type === 'Generator' || type === 'Manifesting Generator') {
    return 'creating satisfaction and impact through your response to life';
  } else if (type === 'Projector') {
    return 'guiding others with your wisdom and experiencing success';
  } else if (type === 'Manifestor') {
    return 'initiating important changes and experiencing peace';
  } else {
    return 'reflecting and sampling life, offering surprise and wonder';
  }
};

const getAuthorityAdvice = (authority) => {
  const advice = {
    'Sacral': 'listen to your gut response (uh-huh or uh-uh)',
    'Emotional': 'wait through your emotional wave before deciding',
    'Splenic': 'pay attention to immediate intuitive hits',
    'Ego': 'listen to your heart\'s desire and commitments',
    'Self': 'wait for clarity and certainty to emerge',
    'Mental Projector': 'consult with others you trust before deciding',
    'Lunar': 'wait through a full lunar cycle for clarity'
  };
  
  return advice[authority] || 'honor your inner knowing';
};

// Endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Main user data endpoint
app.post('/api/user', async (req, res) => {
  try {
    const { name, birthday, birthtime = '12:00', birthplace, jobTitle } = req.body;
    
    // Input validation
    if (!name || !birthday || !birthplace || !jobTitle) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate date format
    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Get coordinates for birthplace
    const { lat, lng } = getCoordinates(birthplace);
    
    // Run Python scripts for calculations
    // Calculate astrology data
    const astroData = await runPythonScript(
      path.join(__dirname, 'utils', 'astro_calculator.py'),
      [birthday, birthtime, lat.toString(), lng.toString()]
    );
    
    // Calculate human design data
    const hdData = await runPythonScript(
      path.join(__dirname, 'utils', 'human_design.py'),
      [birthday, birthtime, lat.toString(), lng.toString()]
    );
    
    // Determine quantum resonance and archetype
    const resonance = determineResonance(astroData, hdData);
    const archetype = determineArchetype(astroData, hdData);
    
    // Generate human design chart PDF
    const chartFilename = `${name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const chartPath = path.join(chartsDir, chartFilename);
    
    await runPythonScript(
      path.join(__dirname, 'utils', 'chart_generator.py'),
      [JSON.stringify(hdData), JSON.stringify(astroData), name, chartPath]
    );
    
    const chartUrl = `/charts/${chartFilename}`;
    
    // Generate initial chatbot response
    const chatResponse = `Welcome to your cosmic guide! As a ${astroData.sunSign} ${hdData.type}, you have a unique cosmic signature. Your archetype is "${archetype}" and your resonance is aligned with ${resonance}. Ask me anything about your design or how it relates to your life.`;
    
    // Save user data to database
    const stmt = db.prepare(`
      INSERT INTO users (
        name, birthday, birthtime, birthplace, job_title, 
        astro_data, hd_data, resonance, archetype, chart_url, lat, lng
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      name, 
      birthday, 
      birthtime, 
      birthplace, 
      jobTitle, 
      JSON.stringify(astroData), 
      JSON.stringify(hdData), 
      resonance, 
      archetype, 
      chartUrl,
      lat, 
      lng, 
      function(err) {
        if (err) {
          console.error('Error saving user data', err.message);
          return res.status(500).json({ message: 'Error saving user data' });
        }
        
        // Send response with user id and determined values
        res.status(201).json({
          userId: this.lastID,
          name,
          astroData,
          hdData,
          resonance,
          archetype,
          chartUrl: `http://localhost:${PORT}${chartUrl}`,
          chatResponse
        });
      }
    );
    
    stmt.finalize();
    
  } catch (error) {
    console.error('Server error', error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required' });
    }
    
    // Get user data from database
    db.get(
      'SELECT name, astro_data, hd_data FROM users WHERE id = ?',
      [userId],
      async (err, user) => {
        if (err || !user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Parse stored JSON data
        const userData = { name: user.name };
        const astroData = JSON.parse(user.astro_data);
        const hdData = JSON.parse(user.hd_data);
        
        // Generate response
        const response = generateChatbotResponse(userData, astroData, hdData, message);
        
        // Store chat message and response
        db.run(
          'INSERT INTO chat_messages (user_id, message, response) VALUES (?, ?, ?)',
          [userId, message, response],
          (err) => {
            if (err) {
              console.error('Error saving chat message', err.message);
            }
            
            // Return the response
            res.json({ response });
          }
        );
      }
    );
    
  } catch (error) {
    console.error('Chat error', error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason: reason,
    promise: promise
  });
}); 