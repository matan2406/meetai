# MeetAI - Smart Appointment Scheduling System

A modern appointment scheduling system with AI chatbot support, built with Node.js backend and vanilla JavaScript frontend.

## 🚀 Features

✅ **Smart AI Chat** - Hebrew language support with intelligent responses
✅ **Real-time Availability** - Dynamic scheduling with available time slots
✅ **WhatsApp Reminders** - Automatic appointment reminders via WhatsApp
✅ **Hybrid Mode** - Works with or without backend (LocalStorage fallback)
✅ **Responsive Design** - Beautiful gradient UI, works on all devices
✅ **Phone Validation** - Built-in phone number verification

## 📋 Quick Start

### Option A: Run Locally (Full Stack)

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
# or with auto-reload:
npm run dev
```

3. **Open in browser:**
```
http://localhost:3000
```

### Option B: Run Frontend Only (No Backend)

Simply open `index.html` in your browser. The app will automatically use LocalStorage for data persistence.

## 📁 Project Structure

```
MeetAI/
├── index.html          # Main HTML file (Hebrew RTL)
├── style.css           # Beautiful gradient styling
├── script.js           # Frontend with LocalStorage + API integration
├── server.js           # Express backend server
├── package.json        # Dependencies
├── .env               # Environment variables
└── .gitignore         # Git ignore rules
```

## 🔧 Configuration

Edit `.env` to customize:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Development or production
- `TWILIO_*` - WhatsApp integration (optional)

## 💾 Data Storage

- **With Server**: PostgreSQL/MongoDB (configurable)
- **Without Server**: Browser LocalStorage (automatic fallback)

## 🤖 AI Responses

The chatbot responds to:
- `טניס` - Tennis court booking
- `פאדל` - Padel court booking
- `משלוח` - Delivery coordination
- `תזכורת` - WhatsApp reminder info
- `מחיר` - Pricing information
- `שעות` - Available time slots

## 📞 Available Time Slots

- **ראשון (Sunday)**: 09:00, 11:00, 18:30
- **שני (Monday)**: 10:00, 14:00, 20:00
- **שלישי (Tuesday)**: 08:30, 13:00, 19:30
- **רביעי (Wednesday)**: 09:30, 15:30, 21:00

## 🐛 Debugging

Open browser console and use:
```javascript
// View all appointments
MeetAI.getAppointments()

// Check if server is connected
MeetAI.isServerAvailable

// Clear all local data
MeetAI.clearAllData()

// View appointments
console.log(MeetAI.getAppointments())
```

## 🚀 Deployment

### Deploy to Heroku:
```bash
git push heroku main
```

### Deploy to Railway/Vercel:
1. Connect your GitHub repo
2. Set environment variables
3. Deploy automatically

## 🔐 Security Notes

- Never commit `.env` file
- Use environment variables for secrets
- Validate all phone numbers
- Implement rate limiting for production

## 📝 Future Enhancements

- [ ] MongoDB integration
- [ ] WhatsApp API integration
- [ ] Email confirmations
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] Payment processing
- [ ] Calendar sync (Google Calendar, Outlook)

## 👨‍💻 Author

Created by **matan2406**

## 📄 License

MIT License

## 💬 Support

For issues or questions, check the GitHub repository.

---

**Made with ❤️ for Hebrew-speaking businesses**
