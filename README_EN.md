# Focus on Aircraft - Making Focus Fun

*[中文](README.md) | **English***

A flight-themed focus training application that helps users maintain concentration through simulated flight experiences.

## 🎯 Project Features

- **Immersive Flight Experience**: Make focus fun through aviation themes
- **Complete Process Design**: Full experience from takeoff preparation to landing
- **Personalized Settings**: Support custom destinations, seat preferences, and focus tasks
- **Real-time Flight Tracking**: Visualize flight progress and focus duration
- **Achievement System**: Earn different achievements based on focus performance

## 🚀 Functional Modules

### 1. Welcome Page (`welcome/`)
- Application introduction and start guide
- Responsive design supporting multiple devices

### 2. Departure Selection (`departure/`)
- Global major city airport selection
- Search and filter functionality
- Geographic location visualization

### 3. Destination Selection (`arrival/`)
- Smart destination recommendations
- Distance and flight time calculation
- Interactive map display

### 4. Seat Selection (`seat/`)
- Different seat type selection
- Personalized preference settings
- 3D seat preview

### 5. Task Setup (`tasks/`)
- Multiple focus task types
- Custom task support
- Task priority management

### 6. Pre-flight Check (`preflight/`)
- Flight information summary
- Preparation status checklist
- Final confirmation process

### 7. In Flight (`flight/`)
- Real-time flight dashboard
- Interactive flight map
- Task reminders and progress tracking
- Pause and emergency landing functions

### 8. Flight Completion (`completion/`)
- Flight statistics and achievement display
- Sharing functionality
- New flight initiation

## 📁 Project Structure

```
Focus_on_Aircraft/
├── frontend/
│   ├── index.html              # Main entry file
│   ├── shared/                 # Shared resources
│   │   ├── common.css         # Common styles
│   │   └── steps.css          # Step page styles
│   ├── welcome/               # Welcome page
│   ├── departure/             # Departure selection
│   ├── arrival/               # Destination selection
│   ├── seat/                  # Seat selection
│   ├── tasks/                 # Task setup
│   ├── preflight/             # Pre-flight check
│   ├── flight/                # In flight
│   └── completion/            # Flight completion
├── README.md                  # Chinese documentation
├── README_EN.md              # English documentation
└── backend/                  # Backend services
```

Each functional module contains:
- `index.html` - Page structure
- `*.css` - Module styles
- `*.js` - Interactive logic

## 🛠️ Tech Stack

### Frontend Technologies
- **HTML5**: Semantic structure and modern standards
- **CSS3**: Flexbox, Grid layout, CSS variables, animations
- **JavaScript (ES6+)**: Modular development, Promise/async-await
- **Map Services**: AutoNavi Map API (AMap), Leaflet.js
- **Icon Library**: Font Awesome 6.4.0
- **Data Storage**: LocalStorage + SessionStorage
- **Responsive Design**: Mobile-first, multi-device adaptation

### Backend Technologies
- **Node.js**: Server runtime environment
- **Express.js**: Web application framework
- **CORS**: Cross-origin resource sharing
- **Body-parser**: Request body parsing middleware

### Development Tools
- **Nodemon**: Development environment hot reload
- **HTTP Server**: Static file service

## 💻 System Requirements

### Minimum Configuration
- **OS**: Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+)
- **Node.js**: 16.0+ (recommended 18.0+)
- **Memory**: 4GB RAM
- **Storage**: 500MB available space
- **Network**: Stable internet connection (for map services)

### Browser Compatibility
| Browser | Minimum Version | Recommended Version | Mobile Support |
|---------|----------------|-------------------|----------------|
| Chrome | 88+ | Latest | ✅ |
| Firefox | 85+ | Latest | ✅ |
| Safari | 14+ | Latest | ✅ |
| Edge | 88+ | Latest | ✅ |

## 🚀 Quick Start

### Method 1: Complete Installation (Recommended)

1. **Clone Project**
   ```bash
   git clone [project-url]
   cd Focus_on_Aircraft
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Backend Service**
   ```bash
   npm start
   # or development mode
   npm run dev
   ```

4. **Start Frontend Service**
   Open a new terminal window:
   ```bash
   cd frontend
   # Using Python
   python -m http.server 8080
   # or using Node.js
   npx http-server -p 8080 -c-1
   ```

5. **Access Application**
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3000`

### Method 2: Frontend Only Experience

If you only want to experience frontend features:

1. **Start Frontend Directly**
   ```bash
   cd frontend
   python -m http.server 8080
   ```

2. **Access Application**
   Open browser and visit `http://localhost:8080`

### Method 3: Online Experience

Visit online demo: [Online Experience Link]

## 📱 Usage Instructions

1. **Start Flight**: Click "Start Flight" button
2. **Select Departure**: Choose starting point from global airports
3. **Select Destination**: Choose desired destination
4. **Choose Seat**: Select seat type based on personal preference
5. **Set Tasks**: Choose tasks to complete during focus time
6. **Pre-flight Check**: Confirm all settings and prepare for takeoff
7. **Start Focus**: Enter flight mode and focus on completing tasks
8. **View Results**: Check statistics and achievements after flight completion

## 🔧 Development Environment Setup

### Frontend Development

1. **Live Preview**
   ```bash
   # Use Live Server extension (recommended)
   # or use http-server
   cd frontend
   npx http-server -p 8080 -c-1 --cors
   ```

2. **Style Development**
   - Shared styles: `frontend/shared/common.css`
   - Step styles: `frontend/shared/steps.css`
   - Module styles: CSS files in respective module directories

3. **JavaScript Development**
   - Use ES6+ syntax
   - Modular development
   - Event-driven architecture

### Backend Development

1. **Start Development Server**
   ```bash
   npm run dev  # Use nodemon for auto-restart
   ```

2. **API Testing**
   ```bash
   # Test server status
   curl http://localhost:3000/api/health
   
   # Test airport data
   curl http://localhost:3000/api/airports
   ```

3. **Data Management**
   - Airport data: `backend/data/airports.json`
   - Route configuration: `backend/routes/`

## 📚 API Documentation

### Basic Information
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **Response Format**: JSON

### Endpoint List

#### 1. Health Check
```http
GET /api/health
```
**Response Example**:
```json
{
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Get Airport List
```http
GET /api/airports
```
**Query Parameters**:
- `search` (optional): Search keyword
- `limit` (optional): Limit return count, default 100

**Response Example**:
```json
{
    "success": true,
    "data": [
        {
            "code": "PEK",
            "name": "Beijing Capital International Airport",
            "city": "Beijing",
            "country": "China",
            "latitude": 40.0799,
            "longitude": 116.6031
        }
    ],
    "total": 1
}
```

#### 3. Calculate Route Distance
```http
POST /api/calculate-route
```
**Request Body**:
```json
{
    "departure": "PEK",
    "arrival": "PVG"
}
```

**Response Example**:
```json
{
    "success": true,
    "data": {
        "distance": 1088.5,
        "duration": 130,
        "route": {
            "departure": {...},
            "arrival": {...}
        }
    }
}
```

#### 4. Save Flight Record
```http
POST /api/flights
```
**Request Body**:
```json
{
    "departure": "PEK",
    "arrival": "PVG",
    "duration": 7200,
    "tasks": ["Work", "Study"],
    "completed": true
}
```

## 🎨 Design Philosophy

- **Immersive Experience**: Create focus atmosphere through aviation themes
- **Progressive Guidance**: Step-by-step user guidance through setup
- **Visual Feedback**: Real-time progress and status display
- **Achievement Motivation**: Enhance user engagement through achievement system

## 🚀 Deployment Guide

### Production Environment Deployment

#### Method 1: Traditional Server Deployment

1. **Prepare Server Environment**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm nginx
   
   # CentOS/RHEL
   sudo yum install nodejs npm nginx
   ```

2. **Deploy Application**
   ```bash
   # Clone code
   git clone [project-url]
   cd Focus_on_Aircraft
   
   # Install dependencies
   npm install --production
   
   # Start backend service
   pm2 start backend/server.js --name "focus-aircraft-api"
   
   # Configure frontend static files
   sudo cp -r frontend/* /var/www/html/focus-aircraft/
   ```

3. **Nginx Configuration Example**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend static files
       location / {
           root /var/www/html/focus-aircraft;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API proxy
       location /api/ {
           proxy_pass http://localhost:3000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

#### Method 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   # Build image
   docker build -t focus-aircraft .
   
   # Run container
   docker run -d -p 3000:3000 --name focus-aircraft focus-aircraft
   ```

3. **Using Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
       volumes:
         - ./frontend:/usr/share/nginx/html
         - ./nginx.conf:/etc/nginx/nginx.conf
       depends_on:
         - app
   ```

### Cloud Platform Deployment

#### Vercel (Recommended for Frontend)
```bash
npm install -g vercel
cd frontend
vercel --prod
```

#### Heroku (Full Stack)
```bash
# Install Heroku CLI
heroku create focus-aircraft
git push heroku main
```

#### Railway
```bash
# Connect Railway project
railway login
railway link
railway up
```

## 🧪 Testing Instructions

### Frontend Testing

1. **Manual Testing Checklist**
   - [ ] All pages load normally
   - [ ] Responsive design works on different devices
   - [ ] Map functionality displays correctly
   - [ ] Local storage functions normally
   - [ ] Navigation between pages is smooth

2. **Browser Compatibility Testing**
   ```bash
   # Test with different browsers
   # Chrome, Firefox, Safari, Edge
   # Desktop and mobile
   ```

### Backend Testing

1. **API Endpoint Testing**
   ```bash
   # Health check
   curl -X GET http://localhost:3000/api/health
   
   # Airport data
   curl -X GET "http://localhost:3000/api/airports?limit=5"
   
   # Route calculation
   curl -X POST http://localhost:3000/api/calculate-route \
     -H "Content-Type: application/json" \
     -d '{"departure":"PEK","arrival":"PVG"}'
   ```

2. **Load Testing**
   ```bash
   # Using Apache Bench
   ab -n 1000 -c 10 http://localhost:3000/api/airports
   
   # Using wrk
   wrk -t12 -c400 -d30s http://localhost:3000/api/health
   ```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Occupied
```bash
# Check port usage
netstat -nlp | grep :3000
lsof -i :3000

# Kill occupying process
kill -9 <PID>
```

#### 2. Dependency Installation Failed
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 3. Map Cannot Display
- Check network connection
- Verify map API key configuration
- Check browser console error messages
- Verify CORS settings

#### 4. Data Storage Issues
```javascript
// Check LocalStorage support
if (typeof(Storage) !== "undefined") {
    // LocalStorage supported
} else {
    // LocalStorage not supported
    console.error("Browser does not support localStorage");
}

// Clear local data
localStorage.clear();
sessionStorage.clear();
```

#### 5. CORS Issues
```javascript
// Development environment CORS configuration
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));
```

### Performance Optimization

#### Frontend Optimization
- **Image Optimization**: Use WebP format, appropriate compression
- **Code Splitting**: Load modules on demand
- **Caching Strategy**: Set appropriate cache headers
- **CDN Acceleration**: Use CDN for third-party resources

#### Backend Optimization
- **Data Caching**: Use Redis cache for frequent queries
- **Database Indexing**: Optimize query performance
- **Load Balancing**: Use PM2 cluster mode
- **Monitoring & Alerting**: Integrate performance monitoring tools

### Debugging Tips

1. **Frontend Debugging**
   ```javascript
   // Enable detailed logging
   localStorage.debug = 'focus-aircraft:*';
   
   // Performance monitoring
   console.time('Page Load');
   // ... code ...
   console.timeEnd('Page Load');
   ```

2. **Backend Debugging**
   ```bash
   # Enable debug mode
   DEBUG=focus-aircraft:* npm run dev
   
   # View detailed request logs
   npm install morgan
   ```

## 🔒 Security Considerations

### Data Security
- User data stored only in local browser
- No collection of personal privacy information
- API requests use HTTPS (production environment)
- Appropriate validation and cleaning of input data

### Deployment Security
```bash
# Set appropriate file permissions
chmod 755 -R frontend/
chmod 600 backend/config/

# Use environment variables for sensitive configuration
export NODE_ENV=production
export API_KEY=your-api-key
```

### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
               style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
               img-src 'self' data: https:;">
```

## 🔧 Custom Configuration

### Adding New Airports
Modify airport data in the corresponding JavaScript file:
```javascript
const airports = [
    {
        code: 'PEK',
        name: 'Beijing Capital International Airport',
        city: 'Beijing',
        country: 'China',
        latitude: 40.0799,
        longitude: 116.6031
    }
    // Add more airports...
];
```

### Custom Themes
Modify CSS variables in `shared/common.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
    /* Modify other color variables... */
}
```

## 📊 Performance Metrics

### Page Load Performance
- **First Screen Load**: < 2 seconds
- **Complete Load**: < 5 seconds
- **Bundle Size**: Frontend < 2MB, Backend < 500KB
- **API Response**: Average < 200ms

### Resource Usage
- **Memory Usage**: Frontend < 50MB, Backend < 100MB
- **CPU Usage**: Normal operation < 5%
- **Network Bandwidth**: Initial load < 1MB
- **Local Storage**: < 10MB

## 📝 Changelog

### v1.0.0 (2024-01-01)
#### 🎉 Initial Release
- ✅ Complete flight experience flow
- ✅ 8 core functional modules
- ✅ Responsive design support
- ✅ Local data storage
- ✅ Real-time flight tracking
- ✅ Achievement system

#### 🚀 Features
- Global airport database
- Interactive map display
- Multiple focus task types
- Personalized seat selection
- Flight statistics analysis

#### 🛠️ Technical Implementation
- Frontend-backend separation architecture
- RESTful API design
- Tencent Maps integration
- ES6+ JavaScript
- CSS3 animation effects

### Future Roadmap

#### v1.1.0 (Planned)
- [ ] User account system
- [ ] Cloud data synchronization
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Social sharing features

#### v1.2.0 (Planned)
- [ ] AI smart recommendations
- [ ] Voice reminder functionality
- [ ] Pomodoro timer integration
- [ ] Team collaboration mode
- [ ] Data export functionality

#### v2.0.0 (Long-term)
- [ ] VR/AR experience
- [ ] Real-time flight data
- [ ] Machine learning optimization
- [ ] Blockchain points system
- [ ] Enterprise version

## 🤝 Contributing

### How to Contribute

We welcome all forms of contributions! Whether it's:
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📝 Improving documentation
- 🔧 Submitting code fixes
- 🎨 Improving UI/UX design

### Contribution Process

1. **Fork Project**
   ```bash
   # Click Fork button on GitHub page
   git clone https://github.com/your-username/Focus_on_Aircraft.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b bugfix/fix-issue-123
   # or  
   git checkout -b docs/improve-readme
   ```

3. **Local Development**
   ```bash
   # Install dependencies
   npm install
   
   # Start development environment
   npm run dev
   
   # Run tests
   npm test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   
   # Commit message conventions
   # feat: new feature
   # fix: bug fix
   # docs: documentation update
   # style: code formatting
   # refactor: code refactoring
   # test: test related
   # chore: build/tool related
   ```

5. **Push Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Describe changes in detail
   - Link related issues
   - Add test screenshots (if applicable)
   - Ensure CI checks pass

### Code Standards

#### JavaScript Standards
```javascript
// Use const/let instead of var
const API_BASE_URL = 'http://localhost:3000/api';
let currentFlight = null;

// Use arrow functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Implementation logic
};

// Use async/await for asynchronous operations
const fetchAirports = async () => {
    try {
        const response = await fetch('/api/airports');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch airport data:', error);
    }
};
```

#### CSS Standards
```css
/* Use BEM naming convention */
.flight-dashboard {}
.flight-dashboard__header {}
.flight-dashboard__header--active {}

/* Use CSS variables */
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
}

/* Mobile-first approach */
.container {
    width: 100%;
}

@media (min-width: 768px) {
    .container {
        max-width: 1200px;
    }
}
```

### Issue Submission Guidelines

#### Bug Report Template
```markdown
**Bug Description**
Brief description of the issue encountered

**Steps to Reproduce**
1. Open application
2. Click '...'
3. See error

**Expected Behavior**
Describe what should happen

**Actual Behavior**
Describe what actually happened

**Environment Information**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120.0]
- Device: [e.g., Desktop/Mobile]

**Screenshots**
Add screenshots if applicable
```

#### Feature Request Template
```markdown
**Feature Description**
Brief description of the desired feature

**Use Cases**
Describe when this feature would be used

**Solution**
Describe how you'd like this feature implemented

**Alternatives**
Describe other possible implementation approaches

**Additional Information**
Add any other relevant information
```

## 📞 Contact Information

### Project Team
- **Project Maintainer**: [Maintainer Name]
- **Technical Lead**: [Technical Lead]
- **Design Lead**: [Design Lead]

### Getting Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-repo/Focus_on_Aircraft/issues)
- 💡 **Feature Suggestions**: [GitHub Discussions](https://github.com/your-repo/Focus_on_Aircraft/discussions)
- 📧 **Email Contact**: focus-aircraft@example.com
- 💬 **Live Chat**: [Discord Server Link]
- 📱 **WeChat Group**: Add WeChat ID focus-aircraft-bot

### Community Resources
- 📚 **Detailed Documentation**: [Online Documentation]
- 🎥 **Video Tutorials**: [Bilibili/YouTube Links]
- 📝 **Development Blog**: [Blog Address]
- 🗣️ **User Forum**: [Forum Address]

## ❓ Frequently Asked Questions (FAQ)

### Usage Questions

**Q: Why can't the map display?**
A: Please check:
1. Network connection is normal
2. Browser supports Geolocation API
3. JavaScript is enabled
4. Try refreshing page or clearing browser cache

**Q: Will data be lost?**
A: Data is stored locally in the browser and normally won't be lost. But we recommend:
1. Don't clear browser data
2. Regularly export important data
3. Use the same browser and device

**Q: Does it support offline usage?**
A: Most frontend features support offline usage, but maps and some data require network connection.

**Q: How to reset all data?**
A: Execute in browser developer tools:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Technical Questions

**Q: How to modify the default port?**
A: Modify startup script in package.json or use environment variable:
```bash
PORT=8080 npm start
```

**Q: How to add new airport data?**
A: Edit `backend/data/airports.json` file and add new airport information following the existing format.

**Q: Which browsers are supported?**
A: Supports all modern browsers (Chrome 88+, Firefox 85+, Safari 14+, Edge 88+)

**Q: How to integrate with existing systems?**
A: Can integrate through API interfaces or embed frontend pages in iframe.

### Development Questions

**Q: How to set up development environment?**
A: Follow the instructions in the "Development Environment Setup" section.

**Q: How to contribute code?**
A: Please refer to the "Contributing" section.

**Q: Is there development documentation?**
A: API documentation is in README, detailed development documentation available at [Documentation Link].

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Leaflet.js](https://leafletjs.com/) - Map functionality
- [Font Awesome](https://fontawesome.com/) - Icon library
- All contributors and users for their support

---

**Make focus fun and time more valuable!** ✈️
