const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory database (in production, use MongoDB/PostgreSQL)
const appointments = [];
const availableSlots = {
    'ראשון': ['09:00', '11:00', '18:30'],
    'שני': ['10:00', '14:00', '20:00'],
    'שלישי': ['08:30', '13:00', '19:30'],
    'רביעי': ['09:30', '15:30', '21:00'],
};

// Helper: Get next occurrence of a weekday
function getNextOccurrence(hebrewDay) {
    const dayMap = {
        'ראשון': 0,
        'שני': 1,
        'שלישי': 2,
        'רביעי': 3,
    };
    
    const targetDay = dayMap[hebrewDay];
    const today = new Date();
    const daysUntilTarget = (targetDay - today.getDay() + 7) % 7 || 7;
    const date = new Date(today);
    date.setDate(date.getDate() + daysUntilTarget);
    return date;
}

// API: Get available slots
app.get('/api/availability', (req, res) => {
    const availability = {};
    
    Object.entries(availableSlots).forEach(([day, slots]) => {
        const date = getNextOccurrence(day);
        availability[day] = {
            date: date.toISOString().split('T')[0],
            slots: slots.filter(slot => {
                const bookedSlot = appointments.find(
                    appt => appt.day === day && appt.time === slot
                );
                return !bookedSlot;
            })
        };
    });
    
    res.json(availability);
});

// API: Book an appointment
app.post('/api/book-appointment', (req, res) => {
    const { day, time, phone, name, service } = req.body;
    
    // Validate input
    if (!day || !time || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
    
    // Check if slot is available
    const isBooked = appointments.some(
        appt => appt.day === day && appt.time === time
    );
    
    if (isBooked) {
        return res.status(409).json({
            success: false,
            message: 'This slot is already booked'
        });
    }
    
    // Create appointment
    const appointment = {
        id: Date.now().toString(),
        day,
        time,
        phone,
        name: name || 'אורח',
        service: service || 'פגישה כללית',
        bookedAt: new Date(),
        status: 'confirmed'
    };
    
    appointments.push(appointment);
    
    // Send WhatsApp reminder (you'll need Twilio/WhatsApp API)
    sendWhatsAppReminder(phone, appointment);
    
    res.json({
        success: true,
        message: 'הפגישה נשמרה בהצלחה ✅',
        appointment
    });
});

// API: Send WhatsApp reminder
function sendWhatsAppReminder(phone, appointment) {
    // This requires Twilio WhatsApp API integration
    // For now, we'll log it
    console.log(`WhatsApp reminder scheduled for: ${phone}`);
    
    // Example (requires Twilio setup):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    const reminderText = `
שלום ${appointment.name}! 👋
זוהי תזכורת לפגיש�� שלך:
📅 יום: ${appointment.day}
⏰ שעה: ${appointment.time}
🎾 סוג: ${appointment.service}
    `;
    
    client.messages.create({
        from: 'whatsapp:+14155552671',
        to: `whatsapp:+${phone.replace(/[^\d]/g, '')}`,
        body: reminderText
    });
    */
}

// API: Get appointments (for admin)
app.get('/api/appointments', (req, res) => {
    res.json(appointments);
});

// API: Cancel appointment
app.delete('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const index = appointments.findIndex(appt => appt.id === id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Appointment not found'
        });
    }
    
    const appointment = appointments[index];
    appointments.splice(index, 1);
    
    res.json({
        success: true,
        message: 'הפגישה בוטלה',
        appointment
    });
});

// API: AI Chat endpoint
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({
            success: false,
            message: 'Message is required'
        });
    }
    
    // AI response logic
    let response = getAIResponse(message);
    
    res.json({
        success: true,
        response,
        timestamp: new Date()
    });
});

// AI Response generator
function getAIResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    const responses = {
        'טניס': 'ניתן להזמין מגרש טניס 🎾\n\nקיימות שעות פנויות השבוע. אם תרצה, אוכל לעזור לך לקבוע פגישה.',
        'פאדל': 'ניתן להזמין מגרש פאדל 🎾\n\nיש לנו אפשרויות זמינות. מה הזמן המעדיף לך?',
        'משלוח': 'ניתן גם לתאם משלוחים 🚚\n\nאנחנו משלחים לכל הצפון. מהו המוקד שלך?',
        'תזכורת': 'ניתן לקבל תזכורת ישירות לוואטסאפ 📲\n\nפשוט הזן את מספר הטלפון שלך ואנחנו נזכיר לך לפני התור.',
        'מחיר': 'המחירים משתנים בהתאם לסוג השירות 💳\n\nטניס: 150 ש״ח, פאדל: 180 ש״ח, משלוח: בהתאם למרחק',
        'שעות': 'זמינויות השבוע:\n\n📅 ראשון: 09:00, 11:00, 18:30\n📅 שני: 10:00, 14:00, 20:00\n📅 שלישי: 08:30, 13:00, 19:30\n📅 רביעי: 09:30, 15:30, 21:00',
        'help': 'אני יכול לעזור לך ב:\n✓ קביעת פגישות\n✓ בחירת שעות פנויות\n✓ השמת תזכורות בוואטסאפ\n✓ מידע על שירותים\n\nמה תרצה לעשות?'
    };
    
    for (const [keyword, response] of Object.entries(responses)) {
        if (lowerMsg.includes(keyword)) {
            return response;
        }
    }
    
    return `תודה על ההודעה 🙌\n\nניתן לקבוע פגישה דרך המערכת או לשאול אותי על:\n• טניס\n• פאדל\n• משלוח\n• תזכורות\n• מחירים\n• שעות פנויות`;
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An error occurred',
        error: err.message
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 MeetAI Server running on http://localhost:${PORT}`);
    console.log(`📅 Available appointments: ${appointments.length}`);
});

module.exports = app;
