# 🦉 LearnNest

<div align="center">
  <img src="public/mascot-dashboard.png" alt="LearnNest Mascot" width="120" height="120">
  
  **Your AI-Powered Learning Companion**
  
  A modern, intelligent study platform that transforms your learning experience with AI-powered features.

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7+-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## ✨ Features

### 🤖 **AI-Powered Learning**

- **Smart Document Upload**: Upload PDFs and documents with AI-powered analysis and organization
- **AI-Generated Notes**: Automatically generate comprehensive study notes from your materials
- **Interactive Quizzes**: Test your knowledge with personalized quizzes and assessments
- **Intelligent Content Processing**: Advanced AI algorithms analyze and structure your content

### 🎨 **Modern User Experience**

- **3D Interactive Mascot**: Engaging 3D owl mascot with Three.js animations
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Dark/Light Theme**: Customizable theme preferences with smooth transitions
- **Smooth Animations**: Framer Motion powered animations and micro-interactions

### 🛡️ **Security & Safety**

- **Firebase Authentication**: Secure user authentication and authorization
- **Campus Safety Resources**: Access to campus safety information and emergency resources
- **Protected Routes**: Secure access control for authenticated users

### 📚 **Study Tools**

- **Subject Management**: Organize your studies by subjects and topics
- **Note Organization**: Structured note-taking with markdown support
- **Progress Tracking**: Monitor your learning progress with interactive charts
- **File Management**: Upload and organize study materials efficiently

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or later)
- **npm** or **yarn** package manager
- **Firebase** account for authentication and backend services

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ksm007/hackathon-fe.git
   cd hackathon-fe
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory and add your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` to see the application.

## 🛠️ Built With

### **Frontend Framework**

- **[React 19.1.1](https://reactjs.org/)** - Modern JavaScript library for building user interfaces
- **[TypeScript 5.8.3](https://www.typescriptlang.org/)** - Static type checking for JavaScript
- **[Vite](https://vitejs.dev/)** - Fast build tool and development server

### **UI & Styling**

- **[Tailwind CSS 4.1.13](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives and components
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready motion library
- **[Lucide React](https://lucide.dev/)** - Beautiful and consistent icon library

### **3D Graphics**

- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** - React renderer for Three.js
- **[React Three Drei](https://docs.pmnd.rs/drei)** - Useful helpers for React Three Fiber

### **Backend & Authentication**

- **[Firebase](https://firebase.google.com/)** - Authentication, database, and hosting
- **[Axios](https://axios-http.com/)** - HTTP client for API requests

### **Additional Libraries**

- **[React Router DOM](https://reactrouter.com/)** - Client-side routing
- **[React Hook Form](https://react-hook-form.com/)** - Performant, flexible forms
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[React Markdown](https://remarkjs.github.io/react-markdown/)** - Markdown component
- **[React Dropzone](https://react-dropzone.js.org/)** - File upload component
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (MainLayout, Navbar, Sidebar)
│   └── ui/              # Reusable UI components (Button, Card, Dialog, etc.)
├── contexts/            # React Context providers (Auth, Theme)
├── lib/                 # Utility functions and configurations
│   ├── ai.ts           # AI service integration
│   ├── apiClient.ts    # API client configuration
│   ├── firebase.ts     # Firebase configuration
│   └── utils.ts        # General utility functions
├── pages/              # Application pages/routes
│   ├── DashboardPage.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── NotesPage.tsx
│   ├── QuizzesPage.tsx
│   ├── SettingsPage.tsx
│   ├── SubjectsPage.tsx
│   ├── UploadPage.tsx
│   └── CampusSafetyPage.tsx
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## 🎯 Available Scripts

| Command           | Description                 |
| ----------------- | --------------------------- |
| `npm run dev`     | Start development server    |
| `npm run build`   | Build for production        |
| `npm run preview` | Preview production build    |
| `npm run lint`    | Run ESLint for code quality |

## 🌟 Key Features Overview

### **Dashboard**

The main hub where users can navigate to different sections of the application, featuring:

- Interactive cards for each major feature
- Progress overview and statistics
- Quick access to recent activities

### **Document Upload & Processing**

- Drag-and-drop file upload interface
- Support for PDF and various document formats
- AI-powered content analysis and extraction
- Automatic categorization and tagging

### **AI Note Generation**

- Intelligent summarization of uploaded content
- Structured note formatting with markdown support
- Key concept extraction and highlighting
- Customizable note templates

### **Interactive Quizzes**

- Auto-generated questions based on uploaded content
- Multiple question types (MCQ, True/False, Short Answer)
- Progress tracking and performance analytics
- Adaptive difficulty based on user performance

### **Campus Safety**

- Emergency contact information
- Safety resource links
- Campus map integration
- Real-time safety alerts

## 🎨 Design System

The application follows a consistent design system with:

- **Color Palette**: Blue and purple gradients with dark/light theme support
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: Reusable components built with Radix UI primitives
- **Animations**: Smooth transitions and micro-interactions

## 🚦 Routing

The application uses React Router for navigation with the following routes:

### **Public Routes**

- `/` - Landing page
- `/login` - User authentication
- `/signup` - User registration

### **Protected Routes** (requires authentication)

- `/dashboard` - Main dashboard
- `/dashboard/subjects` - Subject management
- `/dashboard/uploads` - File upload interface
- `/dashboard/notes` - Generated notes
- `/dashboard/quizzes` - Interactive quizzes
- `/dashboard/settings` - User preferences
- `/dashboard/campus-safety` - Safety resources

## 🔧 Configuration

### **Environment Variables**

The application requires the following environment variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# API Configuration (if applicable)
VITE_API_BASE_URL=
VITE_AI_SERVICE_URL=
```

### **Firebase Setup**

1. Create a new Firebase project
2. Enable Authentication with email/password
3. Set up Firestore database
4. Configure storage rules
5. Add your domain to authorized domains

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Development Guidelines**

- Follow the existing code style and conventions
- Add TypeScript types for new components and functions
- Include unit tests for new features
- Update documentation as needed
- Ensure responsive design principles

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Vercel** for Vite and the excellent developer experience
- **Tailwind Labs** for the utility-first CSS framework
- **Radix UI** for accessible UI primitives
- **Three.js** community for 3D graphics capabilities
- **Firebase** team for backend services


---

<div align="center">
  <p>Made with ❤️ by the LearnNest team</p>
  <p>🦉 <strong>Study Smarter, Not Harder</strong> 🦉</p>
</div>
