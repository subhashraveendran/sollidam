---

# Sollidam

## (Beta)

A modern React TypeScript application for location encoding and mapping, featuring an interactive map interface with Tamil Nadu-specific grid system.

---

## Project Vision

**Sollidam** (சொல்லிடம்) is a free, open-source location encoding system inspired by What3Words, built especially for Tamil Nadu. It turns complex GPS coordinates into simple and memorable three-word addresses, with optional support for floor-level precision.

### Why Sollidam?

Tamil Nadu and much of India struggle with ambiguous or non-standard addresses:

* "2nd street near murugan temple" is not machine-readable
* Many buildings lack house numbers or floor indicators
* Voice assistants and low-literacy populations face usability issues
* Existing systems (like What3Words) are closed-source, do not support floor levels, and require internet access

**Sollidam solves this.**

* Open-source and fully transparent
* Works offline in mobile (not yet implemented)
* Tamil Nadu specific
* Floor-level support

---

## Serverless API (No Frontend)

### Goal

Create a simple, production-ready API that:

* Converts **GPS coordinates ↔ 3-word code** using existing `Sollidam` algorithm
* Works via REST endpoints
* Deployed fully **serverless** with **no frontend**
* Also supports **Telegram Bot integration (Coming Soon)**

### Tech Stack

* **React 18**: Modern UI library for building interactive interfaces.
* **TypeScript**: Type-safe JavaScript for robust code and better developer experience.
* **React Router DOM v6**: Client-side routing for seamless navigation.
* **Leaflet.js**: Open-source library for interactive maps and geospatial features.
* **Lucide React**: Icon library for crisp and modern SVG icons.
* **CSS3**: Responsive styling with mobile-first design patterns.

---

## API Documentation

### Endpoint 1: Convert Words to Coordinates

**GET** Convert a 3-word address to geographic coordinates

```url
https://api-sollidam.vercel.app/api/lookup?words=word1.word2.word3
```

**Example Request:**

```url
GET https://api-sollidam.vercel.app/api/lookup?words=blue.sky.cloud
```

**Response Format:**

```json
{
  "lat": 8.795380650062402,
  "long": 77.53822544897345
}
```

### Endpoint 2: Convert Coordinates to Words

**GET** Convert geographic coordinates to a 3-word address

```url
https://api-sollidam.vercel.app/api/lookup?location=latitude,longitude
```

**Example Request:**

```url
GET https://api-sollidam.vercel.app/api/lookup?location=11.0168,76.9558
```

**Response Format:**

```json
{
  "words": "moon.visitor.point"
}
```

### API Code Repository

To explore the backend logic and integrate your own tools:

[**api-sollidam**](https://github.com/subhashraveendran/api-sollidam)


### API Base URL:

```
https://api-sollidam.vercel.app
```

Main Application:

```
https://sollidam.vercel.app
```

---

## Telegram Bot Integration (Coming Soon)

This feature will allow:

* Share location → Get 3-word code + map link
* Send 3-word code → Get location + map
* Seamless location sharing without GPS apps

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build
```

## Testing

```bash
# Run tests
npm test

# Accuracy and Stress
npm run accuracy-test
npm run stress-test
```

## Deployment

### Vercel (Recommended)

* One-click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/subhashraveendran/sollidam)
* Or manually using:

```bash
npm install -g vercel
vercel --prod
```

## Key Features

* 3-word reversible encoding for Tamil Nadu
* Floor-level support
* Grid-encoded map using Leaflet.js
* Works offline in mobile (not yet implemented)
* Fully open-source and documented

## License

This project is licensed under the MIT License.

## GitHub

* Repository: [github.com/subhashraveendran/sollidam](https://github.com/subhashraveendran/sollidam)
* API Documentation: [https://api-sollidam.vercel.app](https://api-sollidam.vercel.app)

Made with 💖 for Hero's on Wheels

\#NenjeEzhu
