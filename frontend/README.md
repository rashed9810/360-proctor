# 360° Proctor Frontend

This is the frontend application for the 360° Proctor System, built with React.js and Tailwind CSS.

## Features

- Real-time proctoring monitoring
- Trust score tracking
- Live violation alerts
- Exam calendar
- Multilingual support (English and Bengali)
- Dark/Light theme toggle with persistent preferences
- Responsive design
- Modern UI with animations and smooth transitions

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` directory.

## Testing

To run tests:

```bash
npm test
```

## Project Structure

```
src/
  ├── components/
  │   ├── common/
  │   │   ├── LanguageSwitcher.jsx
  │   │   └── ThemeToggle.jsx
  │   └── dashboard/
  │       ├── Dashboard.jsx
  │       ├── LiveProctoring.jsx
  │       ├── TrustScoreChart.jsx
  │       ├── NotificationPanel.jsx
  │       ├── ExamCalendar.jsx
  │       └── StatCard.jsx
  ├── hooks/
  │   └── useWebSocket.js
  ├── context/
  │   ├── AuthContext.jsx
  │   └── ThemeContext.jsx
  ├── locales/
  │   ├── en/
  │   │   └── translation.json
  │   └── bn/
  │       └── translation.json
  ├── App.js
  ├── index.js
  └── i18n.js
```

## Technologies Used

- React.js
- Tailwind CSS (with dark mode support)
- Framer Motion (for smooth animations)
- Recharts
- i18next (for multilingual support)
- WebSocket
- date-fns
- Context API (for theme and auth state management)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
