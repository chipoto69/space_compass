# Enhanced Astro

Advanced astrological and human design application that combines traditional astrology with Human Design system analysis.

## Features

- 🌟 Astrological calculations using PyEphem
- 🎨 Human Design analysis and chart generation
- 💬 Interactive chat interface with personalized guidance
- 📊 PDF chart generation with detailed analysis
- 🚀 RESTful API with Swagger documentation
- 🎯 Modern React frontend with Tailwind CSS
- 📱 Responsive and intuitive UI/UX

## Tech Stack

### Backend
- Node.js & Express
- Python (PyEphem, Pandas, ReportLab)
- SQLite Database
- Swagger/OpenAPI
- Winston Logger

### Frontend
- React with TypeScript
- Tailwind CSS
- Axios for API calls
- Modern UI components

## Prerequisites

- Node.js (>=18.0.0)
- npm (>=9.0.0)
- Python (>=3.8)
- pip

## Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd enhanced-astro
```

2. **Install dependencies**

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend & backend)
npm run install-all
```

3. **Set up Python environment**

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install pyephem pandas reportlab
```

4. **Create required directories**

```bash
mkdir -p backend/data/charts
mkdir -p backend/logs
```

5. **Environment Setup**

Create `.env` files in both frontend and backend directories:

backend/.env:
```env
PORT=5000
NODE_ENV=development
PYTHON_PATH=python3
DB_PATH=data/astro_guide.db
CHARTS_DIR=data/charts
LOGS_DIR=logs
```

frontend/.env:
```env
PORT=3001
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WEBSOCKET_URL=ws://localhost:5000
REACT_APP_CHARTS_URL=http://localhost:5000/charts
```

## Running the Application

1. **Development Mode**

```bash
# Start both frontend and backend in development mode
npm run dev
```

2. **Production Mode**

```bash
# Build and start the application
npm run build
npm start
```

## API Documentation

Once the server is running, access the API documentation at:
```
http://localhost:5000/api-docs
```

## Project Structure

```
enhanced-astro/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── utils/
│   │       ├── astro_calculator.py
│   │       ├── human_design.py
│   │       ├── chart_generator.py
│   │       └── logger.js
│   ├── data/
│   │   ├── charts/
│   │   └── cities.json
│   └── logs/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.tsx
│   └── public/
└── package.json
```

## Available Scripts

- `npm start` - Start both frontend and backend
- `npm run server` - Start backend server only
- `npm run client` - Start frontend application
- `npm run install-all` - Install all dependencies
- `npm run dev` - Run in development mode
- `npm run build` - Build frontend for production
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository. 