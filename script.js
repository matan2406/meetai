const API_BASE = 'http://localhost:3000/api';

const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    loadAvailableSlots();
    initializeChatInterface();
    loadInitialMessage();
});

// ==================== CHAT FUNCTIONS ====================

function addBotMessage(message) {
    const messageHTML = `
        <div class="message">
            <div class="avatar">AI</div>
            <div class="message-content">${message}</div>
        </div>
    `;
    chatBox.innerHTML += messageHTML;
    scrollChat();
}

function addUserMessage(message) {
    const messageHTML = `
        <div class="message user">
            <div class="message-content">${message}</div>
        </div>
    `;
    chatBox.innerHTML += messageHTML;
    scrollChat();
}

function scrollChat() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function loadInitialMessage() {
    addBotMessage(`שלום 👋
        <br><br>
        אני עוזר הפגישות של MeetAI.
        <br><br>
        ניתן לבחור זמן פנוי
        או לשאול אותי שאלות.`);
}

function initializeChatInterface() {
    sendBtn.addEventListener("click", handleSendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

async function handleSendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;

    addUserMessage(message);
    userInput.value = "";

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        setTimeout(() => {
            if (data.success) {
                addBotMessage(data.response);
            } else {
                addBotMessage('אירעה שגיאה. אנא נסה שוב.');
            }
        }, 700);

    } catch (error) {
        console.error('Chat error:', error);
        addBotMessage('שגיאת חיבור. אנא בדוק את ההוקא.');
    }
}

// ==================== AVAILABILITY & BOOKING ====================

async function loadAvailableSlots() {
    try {
        const response = await fetch(`${API_BASE}/availability`);
        const availability = await response.json();

        const daysGrid = document.querySelector('.days-grid');
        if (!daysGrid) return;

        daysGrid.innerHTML = '';

        Object.entries(availability).forEach(([day, data]) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            
            let slotsHTML = `<h3>${day}</h3>`;
            
            if (data.slots.length === 0) {
                slotsHTML += '<p style="color: #ef4444;">אין שעות פנויות</p>';
            } else {
                data.slots.forEach(slot => {
                    slotsHTML += `<button class="time-slot" data-day="${day}" data-time="${slot}">${slot}</button>`;
                });
            }
            
            dayCard.innerHTML = slotsHTML;
            daysGrid.appendChild(dayCard);
        });

        // Attach event listeners to time slots
        attachTimeSlotListeners();

    } catch (error) {
        console.error('Error loading availability:', error);
    }
}

function attachTimeSlotListeners() {
    document.querySelectorAll(".time-slot").forEach(button => {
        button.addEventListener("click", async () => {
            const day = button.dataset.day;
            const time = button.dataset.time;
            const phone = document.getElementById("phoneInput").value;

            if (!phone) {
                addBotMessage('⚠️ אנא הזן מספר טלפון תחילה לקביעת פגישה.');
                return;
            }

            addUserMessage(`אני רוצה לקבוע לשעה ${time} ביום ${day}`);

            try {
                const response = await fetch(`${API_BASE}/book-appointment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        day,
                        time,
                        phone,
                        service: 'פגישה כללית'
                    })
                });

                const data = await response.json();

                setTimeout(() => {
                    if (data.success) {
                        addBotMessage(`
                            הפגישה נשמרה ✅
                            <br><br>
                            <strong>יום:</strong> ${day}
                            <br>
                            <strong>שעה:</strong> ${time}
                            <br><br>
                            תזכורת תשלח אליך קרוב לתור שלך 📲
                            <br>
                            <strong>מספר יעד:</strong> ${phone}
                        `);
                        loadAvailableSlots(); // Refresh slots
                    } else {
                        addBotMessage(`❌ ${data.message || 'שגיאה בקביעת הפגישה'}`);
                    }
                }, 700);

            } catch (error) {
                console.error('Booking error:', error);
                addBotMessage('❌ שגיאת חיבור בקביעת הפגישה');
            }
        });
    });
}

// ==================== PHONE INPUT VALIDATION ====================

document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById("phoneInput");
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Allow only digits
            e.target.value = e.target.value.replace(/[^\d+]/g, '');
        });

        // Validate phone format
        phoneInput.addEventListener('blur', (e) => {
            const phone = e.target.value;
            if (phone && phone.length < 9) {
                addBotMessage('⚠️ אנא הזן מספר טלפון תקין (לפחות 9 ספרות)');
                e.target.focus();
            }
        });
    }
});

// ==================== ADMIN FUNCTIONS ====================

async function getAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments`);
        const appointments = await response.json();
        console.log('All Appointments:', appointments);
        return appointments;
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

async function cancelAppointment(appointmentId) {
    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('Appointment cancelled:', data);
            loadAvailableSlots(); // Refresh slots
            addBotMessage('הפגישה בוטלה בהצלחה ❌');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Export for debugging
window.MeetAI = {
    getAppointments,
    cancelAppointment,
    loadAvailableSlots,
    addUserMessage,
    addBotMessage
};
