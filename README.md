# Sollidam

A modern React TypeScript application for location encoding and mapping, featuring an interactive map interface with Tamil Nadu-specific grid system.

## Features

- **Interactive Map Interface**: Built with Leaflet.js for seamless location selection
- **Location Encoding**: Custom encoding system for precise location representation
- **Tamil Nadu Grid System**: Specialized grid resolution for Tamil Nadu region
- **Responsive Design**: Modern UI with mobile-friendly interface
- **TypeScript**: Full type safety and better development experience
- **React Router**: Client-side routing for smooth navigation

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Maps**: Leaflet.js
- **Routing**: React Router DOM v6
- **Styling**: CSS3 with modern design patterns
- **Icons**: Lucide React
- **Build Tool**: Create React App

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/subhashraveendran/sollidam.git
   cd sollidam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Deployment

### Vercel Deployment (Recommended)

This project is **optimized for easy Vercel deployment** with pre-configured settings:

1. **One-Click Deploy**
   - Click the "Deploy" button below
   - Connect your GitHub repository
   - Vercel will automatically detect the React app and deploy

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/subhashraveendran/sollidam)

2. **Manual Deployment**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **GitHub Integration**
   - Push to your GitHub repository
   - Connect repository to Vercel dashboard
   - Automatic deployments on every push

### Other Deployment Options

- **Netlify**: Drag and drop the `build` folder
- **GitHub Pages**: Use `gh-pages` package
- **AWS S3**: Upload build files to S3 bucket
- **Firebase Hosting**: Use Firebase CLI

## Project Structure

```
sollidam/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Header.tsx
│   │   ├── LocationMap.tsx
│   │   └── SearchBar.tsx
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   └── ApiPage.tsx
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Configuration

### Vercel Configuration
The project includes a `vercel.json` file with optimized settings:
- Automatic build detection
- Client-side routing support
- Legacy peer deps for compatibility
- Proper output directory configuration

### Environment Variables
No environment variables required for basic functionality.

## Testing

```bash
# Run tests
npm test

# Run accuracy tests
npm run accuracy-test

# Run stress tests
npm run stress-test
```

## Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm run accuracy-test` - Run accuracy tests
- `npm run stress-test` - Run stress tests
- `npm run update-words` - Update word list

## Key Features

### Location Encoding System
- Custom grid-based encoding for Tamil Nadu
- Precise location representation
- Floor-level support

### Interactive Map
- Leaflet.js integration
- Tamil Nadu boundary constraints
- Grid overlay system
- Satellite and street view options

### Modern UI/UX
- Responsive design
- Smooth animations
- Intuitive navigation
- Mobile-friendly interface

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the test files for usage examples

## Live Demo

Visit the live application: [Sollidam on Vercel](https://sollidam-7surlzarg-cybersparrowsystems-projects.vercel.app)

---

**Built with React, TypeScript, and Leaflet.js** 