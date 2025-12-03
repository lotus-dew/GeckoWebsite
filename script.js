let trust = parseInt(localStorage.getItem("geckoTrust")) || 0;
let geckoName = localStorage.getItem("geckoName") || null;

let feedCooldown = false;
let interactCooldown = false;

let lastAction = null;
let consecutiveCount = 0;

// Theme preference
let theme = localStorage.getItem("theme") || "dark";
document.body.classList.add(theme);
document.getElementById("theme-icon").innerText = theme === "dark" ? "dark_mode" : "light_mode";
document.getElementById("theme-toggle").setAttribute("aria-pressed", theme = "dark");

// Mood images
const moodImages = {
    superBad: "images/super_sad.png",
    bad: "images/sad.png",
    neutral: "images/neutral.png",
    good: "images/happy.png",
    superGood: "images/super_happy.png",
    sick: "images/sick.png",
    stressed: "images/stressed.png",
    topHat: "images/top_hat.png"
};

// Arrays of fun facts and hints
const funFacts = [
    "Most pet reptiles are captive-bred, not domesticated like dogs.",
    "Leopard geckos use a slow tail wag to signal high stress, not happiness.",
    "A rapid tail vibration in leopard geckos often precedes a bite during hunting or territorial displays.",
    "Leopard geckos produce at least three distinct sounds: a juvenile scream, a gargle/hiss, and a faint click.",
    "Tokay geckos can recognize familiar human handlers and change their behavior around people they know.",
    "Tortoises can show optimistic or pessimistic mood-like states depending on their environment and enrichment.",
    "Reptiles can adapt their routines to their owners, such as shifting sleep patterns or begging for food.",
    "Many reptile keepers describe trust, not affection, as the main bond reptiles show toward people."
];

const hints = [
    "Affection decreases over time. Try to make sure it doesn’t fall too low!",
    "There is a cooldown after each interaction.",
    "If you do one action too many times, your gecko may not like it!",
    "Try petting your gecko! You may be in for a fun surprise!"
];

// Show name modal if no name yet
window.onload = function() {
    if (!geckoName) {
        document.getElementById("name-modal").style.display = "block";
    } else {
        updateTrustBar();
        showHintOrFact();
    }
};

// Save name
document.getElementById("save-name-btn").addEventListener("click", () => {
    const input = document.getElementById("gecko-name-input").value.trim();
    if (input) {
        geckoName = input;
        localStorage.setItem("geckoName", geckoName);
        document.getElementById("name-modal").style.display = "none";
        updateTrustBar();
        showHintOrFact();
    }
});

// Close modal
document.getElementById("close-modal-btn").addEventListener("click", () => {
    document.getElementById("name-modal").style.display = "none";
});

// Helper: set gecko image
function setGeckoImage(imagePath, altText) {
    const geckoElement = document.getElementById("gecko");
    geckoElement.innerHTML = `<img src="${imagePath}" alt="${altText}">`;
}

// Easter egg: top hat
function clickGecko() {
    animateGecko("gecko-shake");
    if (Math.random() < 0.05) { // 5% chance
        setGeckoImage(moodImages.topHat, "Top Hat");
    }
}

function updateTrustBar() {
    const fill = document.getElementById("trust-fill");
    fill.style.width = trust + "%";

    // Dynamic color class
    fill.className = trust < 30 ? "low" : trust < 70 ? "medium" : "high";

    updateGeckoMood();
}

// Unified mood + status
function updateGeckoMood() {
    if (!geckoName) geckoName = "Your gecko";

    if (lastAction === "feed" && consecutiveCount >= 3) {
        setGeckoImage(moodImages.sick, "Sick Gecko");
        document.getElementById("status").innerText = `${geckoName} feels sick from overeating!`;
        return;
    }
    if (lastAction === "interact" && consecutiveCount >= 3) {
        setGeckoImage(moodImages.stressed, "Stressed Gecko");
        document.getElementById("status").innerText = `${geckoName} feels stressed from too many cuddles!`;
        return;
    }

    if (trust <= 20) {
        setGeckoImage(moodImages.superBad, "Super Bad Gecko");
        document.getElementById("status").innerText = `${geckoName} looks very unhappy...`;
    } else if (trust <= 40) {
        setGeckoImage(moodImages.bad, "Bad Gecko");
        document.getElementById("status").innerText = `${geckoName} seems upset.`;
    } else if (trust <= 60) {
        setGeckoImage(moodImages.neutral, "Neutral Gecko");
        document.getElementById("status").innerText = `${geckoName} is calm and neutral.`;
    } else if (trust <= 80) {
        setGeckoImage(moodImages.good, "Good Gecko");
        document.getElementById("status").innerText = `${geckoName} looks happy!`;
    } else {
        setGeckoImage(moodImages.superGood, "Super Good Gecko");
        document.getElementById("status").innerText = `${geckoName} is thrilled and trusts you deeply!`;
    }
}

// Animations
function animateGecko(animationClass) {
    const gecko = document.getElementById("gecko");
    gecko.classList.add(animationClass);
    setTimeout(() => gecko.classList.remove(animationClass), 700);
}

// Cooldown handler
function startCooldown(buttonId, flagName, duration) {
    const btn = document.getElementById(buttonId);
    btn.disabled = true;
    if (flagName === "feedCooldown") feedCooldown = true;
    if (flagName === "interactCooldown") interactCooldown = true;

    setTimeout(() => {
        btn.disabled = false;
        if (flagName === "feedCooldown") feedCooldown = false;
        if (flagName === "interactCooldown") interactCooldown = false;
    }, duration);
}

function trackAction(actionType) {
    if (lastAction === actionType) consecutiveCount++;
    else { consecutiveCount = 1; lastAction = actionType; }

    if (actionType === "feed" && consecutiveCount >= 3) {
        trust = Math.max(trust - 5, 0);
        localStorage.setItem("geckoTrust", trust);
        updateTrustBar();
    } else if (actionType === "interact" && consecutiveCount >= 3) {
        trust = Math.max(trust - 5, 0);
        localStorage.setItem("geckoTrust", trust);
        updateTrustBar();
    }
}

function feedGecko() {
    if (feedCooldown) return;
    trust = Math.min(trust + 10, 100);
    localStorage.setItem("geckoTrust", trust);
    updateTrustBar();
    trackAction("feed");
    animateGecko("gecko-bounce");
    startCooldown("feed-btn", "feedCooldown", 5000);
}

function interactGecko() {
    if (interactCooldown) return;
    trust = Math.min(trust + 5, 100);
    localStorage.setItem("geckoTrust", trust);
    updateTrustBar();
    trackAction("interact");
    animateGecko("gecko-bounce");
    startCooldown("interact-btn", "interactCooldown", 5000);
}

// Display a random hint or fun fact
function showHintOrFact() {
    const combined = [...funFacts, ...hints];
    const randomText = combined[Math.floor(Math.random() * combined.length)];

    let hintBox = document.getElementById("hint-box");
    if (!hintBox) {
        hintBox = document.createElement("p");
        hintBox.id = "hint-box";
        hintBox.style.fontStyle = "italic";
        hintBox.style.marginTop = "8px";
        document.body.insertBefore(hintBox, document.getElementById("name-modal"));
    }
    hintBox.innerText = "💡 " + randomText;
}

// Trust decay
function decayTrust() {
    trust = Math.max(trust - 1, 0);
    localStorage.setItem("geckoTrust", trust);
    updateTrustBar();
    showHintOrFact(); // refresh facts/hints with decayS
}
setInterval(decayTrust, 30000);


// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
    theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.getElementById("theme-icon").innerText =
        theme === "dark" ? "dark_mode" : "light_mode";
    document.getElementById("theme-toggle").setAttribute("aria-pressed", theme = "dark");
});

// Attach event listeners
document.getElementById("feed-btn").addEventListener("click", feedGecko);
document.getElementById("interact-btn").addEventListener("click", interactGecko);
document.getElementById("gecko-btn").addEventListener("click", clickGecko);


// Initialize bar on a page load
updateTrustBar();