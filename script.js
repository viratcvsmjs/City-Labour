// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  1.  FIREBASE INIT + ANONYMOUS AUTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const firebaseConfig = {
    apiKey: "AIzaSyCs2EcKuShOSaSbADg6gz7cVVtTfQdyP6U",
    authDomain: "city-labour-1a447.firebaseapp.com",
    databaseURL: "https://city-labour-1a447-default-rtdb.firebaseio.com",
    projectId: "city-labour-1a447",
    storageBucket: "city-labour-1a447.firebasestorage.app",
    messagingSenderId: "903387930261",
    appId: "1:903387930261:web:05646f5eaca7014a89059c",
    measurementId: "G-YJW7B8HB3B"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const reviewsRef = db.ref('websiteuserreview');

// ─── Anonymous Authentication ───
firebase.auth().signInAnonymously()
    .then(() => {
        console.log('✅ Authenticated anonymously');
    })
    .catch((error) => {
        console.error('❌ Auth error:', error);
        showToast('Authentication failed – please reload', 'error');
    });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  2.  DOM REFS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const form = document.getElementById('reviewForm');
const nameInput = document.getElementById('reviewName');
const ratingInput = document.getElementById('reviewRating');
const messageInput = document.getElementById('reviewMessage');
const submitBtn = document.getElementById('submitBtn');
const reviewList = document.getElementById('reviewList');
const reviewCount = document.getElementById('reviewCount');
const statReviews = document.getElementById('statReviews');
const statRating = document.getElementById('statRating');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  3.  STAR RATING (default = 1)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const stars = document.querySelectorAll('.star-rating-input .star');
let selectedRating = 1;

stars.forEach(star => {
    star.addEventListener('click', function() {
        const val = parseInt(this.dataset.val, 10);
        selectedRating = val;
        ratingInput.value = val;
        stars.forEach(s => {
            const sv = parseInt(s.dataset.val, 10);
            s.classList.toggle('active', sv <= val);
        });
    });
    star.addEventListener('mouseenter', function() {
        const val = parseInt(this.dataset.val, 10);
        stars.forEach(s => {
            const sv = parseInt(s.dataset.val, 10);
            s.classList.toggle('active', sv <= val);
        });
    });
    star.addEventListener('mouseleave', function() {
        stars.forEach(s => {
            const sv = parseInt(s.dataset.val, 10);
            s.classList.toggle('active', sv <= selectedRating);
        });
    });
});

// set default
stars.forEach(s => {
    const sv = parseInt(s.dataset.val, 10);
    s.classList.toggle('active', sv <= selectedRating);
});
ratingInput.value = selectedRating;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  4.  TOAST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let toastTimer = null;

function showToast(msg, type = 'success') {
    toastMsg.textContent = msg;
    toast.className = 'toast ' + type;
    toast.querySelector('i').className = type === 'success' ?
        'fas fa-check-circle' :
        'fas fa-exclamation-circle';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  5.  RENDER REVIEWS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function renderReviews(snapshot) {
    const data = snapshot.val();
    reviewList.innerHTML = '';
    let total = 0;
    let sum = 0;

    if (!data) {
        reviewList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No reviews yet. Be the first!</p>
            </div>
        `;
        reviewCount.innerHTML = '<span class="live-dot"></span> 0 reviews';
        statReviews.textContent = '0';
        statRating.textContent = '0.0';
        return;
    }

    const keys = Object.keys(data).reverse();

    keys.forEach(key => {
        const rev = data[key];
        total++;
        sum += Number(rev.rating) || 0;

        const starsHtml = '⭐'.repeat(Math.min(5, Math.round(Number(rev.rating) || 0)));

        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-top">
                <div class="review-name">
                    <span class="avatar">${(rev.name || '?')[0].toUpperCase()}</span>
                    ${escapeHtml(rev.name || 'Anonymous')}
                </div>
                <div class="review-stars">${starsHtml}</div>
            </div>
            <div class="review-text">${escapeHtml(rev.message || '')}</div>
            <div class="review-time">
                <i class="far fa-clock"></i> ${rev.timestamp ? new Date(rev.timestamp).toLocaleString() : 'just now'}
            </div>
        `;
        reviewList.appendChild(div);
    });

    const avg = total > 0 ? (sum / total) : 0;
    reviewCount.innerHTML = `<span class="live-dot"></span> ${total} review${total > 1 ? 's' : ''}`;
    statReviews.textContent = total;
    statRating.textContent = avg.toFixed(1);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  6.  FIREBASE: LISTEN FOR REAL-TIME UPDATES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

reviewsRef.on('value', (snapshot) => {
    renderReviews(snapshot);
}, (error) => {
    console.error('Firebase read error:', error);
    showToast('Error loading reviews', 'error');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  7.  SUBMIT REVIEW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = nameInput.value.trim() || 'Anonymous';
    const rating = parseInt(ratingInput.value, 10) || 1;
    const message = messageInput.value.trim();

    if (!message) {
        showToast('Please write your review', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        const newRef = reviewsRef.push();
        await newRef.set({
            name: name,
            rating: rating,
            message: message,
            timestamp: Date.now()
        });

        showToast('Review submitted successfully! 🎉', 'success');
        form.reset();
        // reset to 1 star
        selectedRating = 1;
        ratingInput.value = 1;
        stars.forEach(s => {
            const sv = parseInt(s.dataset.val, 10);
            s.classList.toggle('active', sv <= 1);
        });

    } catch (err) {
        console.error('Submit error:', err);
        showToast('Failed to submit. Check your connection.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  8.  MODAL FUNCTIONS (global)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.openModal = function() {
    document.getElementById('betaModal').classList.add('open');
};

window.closeModal = function() {
    document.getElementById('betaModal').classList.remove('open');
};

window.goPlay = function() {
    window.open(
        'https://play.google.com/apps/testing/com.whomakethis.citylabour',
        '_blank'
    );
    closeModal();
};

document.getElementById('betaModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  9.  ANTI-DEBUGGING & RIGHT-CLICK PROTECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Disable right-click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showToast('Right-click is disabled on this page.', 'error');
});

// Disable keyboard shortcuts for dev tools
document.addEventListener('keydown', function(e) {
    // Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, F12
    if (
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'j' || e.key === 'c')) ||
        (e.key === 'F12')
    ) {
        e.preventDefault();
        showToast('Developer tools are not allowed.', 'error');
        return false;
    }
});

console.log('🚀 City Labour Beta — Firebase + Anonymous Auth ready.');
console.log('📁 Path: /websiteuserreview');
console.log('⭐ Rating default = 1 star');
console.log('🛡️ Anti-debugging measures active.');
