let selectedFileUrl = null;

// Check if user is already logged in when visiting from other devices
window.onload = function() {
    const savedUser = localStorage.getItem('fx_user');
    if(savedUser) {
        document.getElementById('displayUsername').innerText = savedUser;
        document.getElementById('headerUserGreeting').innerText = `환영, ${savedUser}`;
        document.getElementById('welcomeAuthModal').style.display = 'none';
    } else {
        document.getElementById('welcomeAuthModal').style.display = 'flex';
    }
}

// Simulate Direct Google Sign-In (Direct Gmail prompt/popup feel)
function handleGoogleLogin() {
    let dummyEmail = prompt("আপনার ফোনের জিমেইল অ্যাকাউন্টটি লিখুন বা সিলেক্ট করুন:", "trader.rakib@gmail.com");
    if(dummyEmail && dummyEmail.includes("@")) {
        const username = dummyEmail.split('@')[0];
        localStorage.setItem('fx_user', username);
        document.getElementById('displayUsername').innerText = username;
        document.getElementById('headerUserGreeting').innerText = username;
        document.getElementById('welcomeAuthModal').style.display = 'none';
        alert(`সফলভাবে লগইন হয়েছে! স্বাগতম ${username}`);
    } else {
        alert("দয়া করে সঠিক জিমেইল প্রদান করুন।");
    }
}

function handleEmailLogin() {
    const email = document.getElementById('userEmailInput').value;
    const pass = document.getElementById('userPasswordInput').value;
    if(!email) {
        alert('দয়া করে আপনার জিমেইল প্রদান করুন।');
        return;
    }
    const username = email.split('@')[0];
    localStorage.setItem('fx_user', username);
    document.getElementById('displayUsername').innerText = username;
    document.getElementById('headerUserGreeting').innerText = username;
    document.getElementById('welcomeAuthModal').style.display = 'none';
    alert('লগইন সফল হয়েছে!');
}

function logoutUser() {
    localStorage.removeItem('fx_user');
    location.reload();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedFileUrl = e.target.result;
            alert('মিডিয়া সফলভাবে যুক্ত হয়েছে! এবার "পোস্ট করুন" বাটনে ক্লিক করুন।');
        }
        reader.readAsDataURL(file);
    }
}

function publishPost() {
    const text = document.getElementById('postTextContent').value;
    if(!text && !selectedFileUrl) {
        alert('দয়া করে কিছু লিখুন অথবা ছবি সংযুক্ত করুন।');
        return;
    }
    const username = localStorage.getItem('fx_user') || 'Member Trader';
    const feedContainer = document.getElementById('feedStreamContainer');
    
    let mediaHtml = '';
    if(selectedFileUrl) {
        mediaHtml = `<img src="${selectedFileUrl}" class="feed-media" alt="Media">`;
    }

    const newCard = document.createElement('div');
    newCard.className = 'feed-card';
    newCard.innerHTML = `
        <div class="feed-header">
            <div class="feed-user-avatar">${username.substring(0,2).toUpperCase()}</div>
            <div class="feed-user-info">
                <h4>${username}</h4>
                <span>এই মাত্র</span>
            </div>
        </div>
        <div class="feed-text">${text}</div>
        ${mediaHtml}
    `;

    feedContainer.prepend(newCard);
    document.getElementById('postTextContent').value = '';
    selectedFileUrl = null;
}

function toggleAIChat() {
    const box = document.getElementById('aiChatBox');
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

function sendAIMessage() {
    const input = document.getElementById('aiUserInput');
    const text = input.value.trim();
    if(!text) return;

    const messagesContainer = document.getElementById('aiMessages');
    
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerText = text;
    messagesContainer.appendChild(userMsg);
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        
        const lowerText = text.toLowerCase();
        if(lowerText.includes('exness') || lowerText.includes('ব্রোকার')) {
            botMsg.innerText = 'আপনি সাইডবার মেনু থেকে আমাদের অফিশিয়াল লিংকের মাধ্যমে এক্সনেস একাউন্ট খুলতে পারেন। সহযোগিতার জন্য @sumaiyasimux-এ যোগাযোগ করুন!';
        } else if(lowerText.includes('vip') || lowerText.includes('সিগন্যাল')) {
            botMsg.innerText = 'ভিআইপি সিগন্যাল পেতে আমাদের অফিশিয়াল বটে যুক্ত হোন: @FXATradingZoneBot';
        } else {
            botMsg.innerText = 'আমি FX.A ট্রেডিং জোনের অ্যাসিস্ট্যান্ট! ব্রোকার বা টেলিগ্রাম চ্যানেল সম্পর্কে কিছু জানার থাকলে বলতে পারেন।';
        }
        
        messagesContainer.appendChild(botMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);
}

function handleAIPress(e) {
    if(e.key === 'Enter') {
        sendAIMessage();
    }
}
