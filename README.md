# Prepzy PYQ

<div align="center">

![Prepzy PYQ Logo](./public/prepzy_logo.svg)

**AI-Powered Platform for Analyzing Previous Year Questions**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

[Features](#-features) • [Installation](#-installation) • [Configuration](#-configuration) • [Usage](#-usage) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📖 About

Prepzy PYQ is an open-source, AI-powered web application designed to help students and educators analyze previous year question papers. The platform uses advanced OCR technology and AI analysis to extract, classify, and organize questions from PDF documents and images, making exam preparation more efficient and data-driven.

### Key Highlights

- 🔒 **Privacy-First**: All processing happens locally in your browser. No server-side storage.
- 🚀 **Fast & Efficient**: Analyze papers in 10-20 seconds with real-time progress tracking.
- 🎯 **AI-Powered**: Intelligent question classification by topics, subjects, and keywords.
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices.
- 🔐 **Local Session Management**: Secure, browser-based session storage with no external authentication.

---

## ✨ Features

### Core Features

- **📄 Multi-Format Support**
  - Upload PDF files and images (JPG, PNG)
  - OCR for scanned documents
  - Batch processing for multiple files

- **🤖 AI-Powered Analysis**
  - Automatic question extraction
  - Topic and subject classification
  - Keyword extraction and pattern recognition
  - Integration with DeepSeek or OpenRouter API for advanced analysis

- **📊 Smart Organization**
  - Filter questions by year, topic, subject, or keywords
  - View statistics and analytics
  - Export results as JSON
  - Session-based storage for multiple analyses

- **🎥 Video Resources** (Optional)
  - Curated educational video recommendations
  - YouTube API integration for relevant learning resources

- **🔒 Privacy & Security**
  - Local browser storage only
  - Automatic file deletion after processing
  - No server-side authentication
  - Session-based data management

### User Experience

- **🎓 Onboarding System**: Guided tour for new users
- **📱 Fully Responsive**: Optimized for all screen sizes (mobile, tablet, desktop)
- **🌙 Dark Mode**: Beautiful dark theme interface
- **⚡ Real-time Progress**: Live updates during processing
- **💾 Session Management**: Create and manage multiple analysis sessions
- **🎨 Modern Landing Page**: Beautiful landing page with animated testimonials, roadmap, and FAQ sections
- **♾️ Infinite Scroll**: Seamless infinite scrolling testimonials with hover-to-pause functionality
- **📊 Animated Statistics**: Interactive stats counter with smooth animations

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** or **bun** package manager

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/SQADIRKVM/prepzy-pyq.git
cd prepzy-pyq
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
bun install
```

3. **Start the development server**

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

4. **Open your browser**

Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Build for Production

```bash
npm run build
# or
yarn build
# or
bun run build
```

The production build will be in the `dist/` directory.

---

## ⚙️ Configuration

### API Keys Setup

Prepzy PYQ requires API keys for full functionality:

#### 1. AI API Key (Required for AI Analysis)

You can use either **DeepSeek** or **OpenRouter** API key:

##### Option A: DeepSeek API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

##### Option B: OpenRouter API Key (Alternative)

1. Visit [OpenRouter](https://openrouter.ai)
2. Sign up or log in
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key

> **Note**: OpenRouter provides access to DeepSeek models and other AI models. The app uses the model `deepseek/deepseek-chat-v3-0324:free` when using OpenRouter.

#### 2. YouTube API Key (Optional, for Video Resources)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key

#### Adding API Keys

1. Open the application
2. Click on **Settings** (gear icon) in the sidebar
3. Navigate to **API Keys** section
4. Select your preferred AI provider (DeepSeek or OpenRouter)
5. Enter your AI API key (required - either DeepSeek or OpenRouter)
6. Enter your YouTube API key (optional)
7. Click **Save**

> **Note**: Basic text extraction works without API keys, but AI analysis and video resources require them. You only need **one** AI API key (either DeepSeek or OpenRouter), not both.

---

## 📚 Usage

### Getting Started

1. **Create a Session** (Optional but Recommended)
   - Click "Create Account" in the sidebar
   - Enter your email, password, and username
   - Your session is stored locally in your browser

2. **Upload Question Papers**
   - Drag and drop PDF files or images
   - Or click to browse and select files
   - Multiple files can be uploaded at once

3. **Wait for Processing**
   - Monitor real-time progress
   - Processing typically takes 10-20 seconds per file
   - Results appear automatically when complete

4. **Analyze Results**
   - View extracted questions
   - Filter by year, topic, subject, or keywords
   - Explore statistics and analytics
   - Access video resources (if YouTube API is configured)

5. **Export Data** (Optional)
   - Export results as JSON
   - Save analysis for offline use

### Features Guide

- **Filtering**: Use the filter bar to find specific questions
- **Statistics**: View question distribution by topics and subjects
- **Sessions**: Manage multiple analysis sessions
- **Settings**: Configure API keys, view sessions, and manage profile

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **TanStack Query** - Data fetching

### Core Libraries

- **Tesseract.js** - OCR for text extraction
- **pdfjs-dist** - PDF parsing
- **React Dropzone** - File uploads
- **Sonner** - Toast notifications
- **Lucide React** - Icons

### APIs

- **DeepSeek API** or **OpenRouter API** - AI-powered question analysis
- **YouTube Data API v3** - Video resource recommendations

---

## 📁 Project Structure

```
prepzy-pyq/
├── public/                 # Static assets
│   ├── prepzy_logo.svg    # Logo
│   └── ...
├── src/
│   ├── components/        # React components
│   │   ├── analyzer/      # Analyzer-specific components
│   │   └── ui/            # shadcn/ui components
│   ├── pages/             # Page components
│   │   ├── Index.tsx      # Landing page
│   │   ├── Documentation.tsx
│   │   └── analyzer/      # Analyzer pages
│   ├── services/          # Business logic
│   │   ├── apiService.ts
│   │   ├── ocrService.ts
│   │   ├── deepSeekService.ts
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities
│   └── App.tsx            # Main app component
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation if needed
- Test your changes thoroughly

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🌐 Multi-language support
- 🧪 Testing

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [DeepSeek](https://www.deepseek.com/) and [OpenRouter](https://openrouter.ai/) for AI analysis capabilities
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR functionality
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- All contributors and users of Prepzy PYQ

---

## 📞 Support

- **Documentation**: Check out our [Documentation Page](./src/pages/Documentation.tsx) in the app
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/SQADIRKVM/prepzy-pyq/issues)
- **Discussions**: Join discussions on [GitHub Discussions](https://github.com/SQADIRKVM/prepzy-pyq/discussions)

---

## 🗺️ Roadmap

### Phase 1 - Foundation & Core Modules ✅
- ✅ PYQ Analyzer (OCR extraction, AI analysis, question classification)
- ✅ Session Management (Local browser-based sessions)
- ✅ Smart Filtering (Filter by year, topic, subject, keywords)
- ✅ Analytics Dashboard (Statistics and insights)
- ✅ Video Resources Integration (YouTube API)
- ✅ Responsive Design (Mobile, tablet, desktop)
- ✅ Modern Landing Page (Animated testimonials, roadmap, FAQ)
- ✅ Infinite Scroll Testimonials (Seamless scrolling with hover-to-pause)

### Phase 2 - Connect & Intelligence (In Progress)
- [ ] Multi-language OCR support (Hindi, Spanish, etc.)
- [ ] Advanced analytics dashboard with visualizations
- [ ] Question difficulty analysis
- [ ] Export to PDF/Excel formats
- [ ] Enhanced AI models integration

### Phase 3 - Advanced Intelligence & Personalization (Planned)
- [ ] Collaborative features
- [ ] Personalized study recommendations
- [ ] Progress tracking and analytics
- [ ] Custom study plans

### Phase 4 - Complete Study Operating System (Future)
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] API for third-party integrations
- [ ] Offline mode support
- [ ] Cloud sync (optional)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for students and educators**

[⬆ Back to Top](#prepzy-pyq)

</div>
