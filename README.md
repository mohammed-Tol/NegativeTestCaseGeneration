# 🔧 API Test Forge

> A powerful, free online tool for generating edge cases and documenting test scenarios for JSON APIs.

![API Test Forge](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🚀 Edge Case Generator
- **Auto-detects JSON keys** - Paste your JSON and automatically see all available keys
- **Comprehensive edge cases** - Generates 15+ edge cases per field including:
  - Null/undefined values
  - Empty strings & whitespace
  - SQL injection payloads
  - XSS attack vectors
  - Unicode & special characters
  - Boundary values (MAX_INT, very long strings)
  - Type mismatches
  - And more!
- **Testing progress tracking** - Mark individual cases as tested
- **Complete key tracking** - Mark entire keys as fully tested
- **Export to JSON/CSV** - Download your test cases for documentation

### 📝 Custom Test Cases
- **Card-based UI** - Document manual test scenarios easily
- **4 fields per case**: Title, Scenario, Expected Behaviour, Actual Behaviour
- **Pass/Fail status** - Mark test outcomes visually
- **Auto-save** - All data persists in localStorage
- **Export capabilities** - Copy all or export to JSON

### 🎨 User Experience
- **Dark Mode** - Easy on the eyes
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, professional interface
- **Offline Support** - Works without internet (after first load)

## 🚀 Quick Start

1. Clone or download this repository
2. Open `index.html` in your browser
3. Paste your JSON and start generating test cases!

## 📁 Project Structure

```
API-Test-Forge/
├── index.html      # Edge Case Generator page
├── custom.html     # Custom Test Cases page
├── styles.css      # Main stylesheet
├── custom.css      # Custom page styles
├── script.js       # Edge Case Generator logic
├── custom.js       # Custom Test Cases logic
└── README.md       # This file
```

## 🌐 Deployment

### GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select `main` branch
4. Your site will be live at `https://username.github.io/repo-name`

### Netlify
1. Connect your GitHub repo
2. Deploy automatically on every push

### Vercel
1. Import your project
2. Deploy with zero configuration

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🙏 Support

If you find this tool useful:
- ⭐ Star this repository
- 🐦 Share on Twitter
- 📢 Tell your QA team about it!

---

Built with ❤️ for QA Engineers & Developers