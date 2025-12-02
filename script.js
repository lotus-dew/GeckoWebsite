let trust = localStorage.getItem("geckoTrust") || 0;
trust = parseInt(trust);

let geckoName = localStorage.getItem("geckoName") || null;

let feedCooldown = false;
let interactCooldown = false;

let lastAction = null;
let consecutiveCount = 0;

// Theme preference
let theme = localStorage.getItem("theme") || "dark";
document.body.classList.add(theme);
document.getElementById("theme-icon").innerText = theme === "dark" ? "dark_mode" : "light_mode";

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
    "If you do one action too many times, your gecko may not like it!"
];

// Mood images (placeholder paths)
const moodImages = {
    superBad: "images/superbad.png",
    bad: "images/bad.png",
    neutral: "images/neutral.png",
    good: "images/good.png",
    superGood: "images/supergood.png",
    sick: "images/sick.png",
    stressed: "images/stressed.png"
};

// Show name modal if no name yet
window.onload = function() {
    if (!geckoName) {
        document.getElementById("name-modal").style.display = "block";
    } else {
        updateTrustBar();
        document.getElementById("status").innerText = `${geckoName} is waiting...`;
        showHintOrFact(); // <-- show a hint/fact immediately on load
    }
};

// Save name
document.getElementById("save-name-btn").addEventListener("click", () => {
    const input = document.getElementById("gecko-name-input").value.trim();
    if (input) {
        geckoName = input;
        localStorage.setItem("geckoName", geckoName);
        document.getElementById("name-modal").style.display = "none";
        document.getElementById("status").innerText = `${geckoName} is waiting...`;
        updateTrustBar();
        showHintOrFact(); // <-- also show one right after naming
    }
});


// Save name
document.getElementById("save-name-btn").addEventListener("click", () => {
    const input = document.getElementById("gecko-name-input").value.trim();
    if (input) {
        geckoName = input;
        localStorage.setItem("geckoName", geckoName);
        document.getElementById("name-modal").style.display = "none";
        document.getElementById("status").innerText = `${geckoName} is waiting...`;
        updateTrustBar();
    }
});

function updateTrustBar() {
    document.getElementById("trust-fill").style.width = trust + "%";
    if (trust >= 100) {
        document.getElementById("status").innerText = `${geckoName} fully trusts you!`;
    } else if (trust <= 0) {
        document.getElementById("status").innerText = `${geckoName} feels neglected...`;
    }
    updateGeckoMood();
}

function updateGeckoMood() {
    const geckoElement = document.getElementById("gecko");

    // Illness states override affection
    if (lastAction === "feed" && consecutiveCount >= 3) {
        geckoElement.innerHTML = `<img src="${moodImages.sick}" alt="Sick Gecko" style="width:100px;">`;
        return;
    }
    if (lastAction === "interact" && consecutiveCount >= 3) {
        geckoElement.innerHTML = `<img src="${moodImages.stressed}" alt="Stressed Gecko" style="width:100px;">`;
        return;
    }

    // Affection-based moods
    if (trust <= 20) {
        geckoElement.innerHTML = `<img src="${moodImages.superBad}" alt="Super Bad Gecko" style="width:100px;">`;
    } else if (trust <= 40) {
        geckoElement.innerHTML = `<img src="${moodImages.bad}" alt="Bad Gecko" style="width:100px;">`;
    } else if (trust <= 60) {
        geckoElement.innerHTML = `<img src="${moodImages.neutral}" alt="Neutral Gecko" style="width:100px;">`;
    } else if (trust <= 80) {
        geckoElement.innerHTML = `<img src="${moodImages.good}" alt="Good Gecko" style="width:100px;">`;
    } else {
        geckoElement.innerHTML = `<img src="${moodImages.superGood}" alt="Super Good Gecko" style="width:100px;">`;
    }
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

function startInteractCooldown() {
    interactCooldown = true;
    document.getElementById("interact-btn").disabled = true;
    setTimeout(() => {
        interactCooldown = false;
        document.getElementById("interact-btn").disabled = false;
    }, 5000);
}

function startFeedCooldown() {
    feedCooldown = true;
    document.getElementById("feed-btn").disabled = true;
    setTimeout(() => {
        feedCooldown = false;
        document.getElementById("feed-btn").disabled = false;
    }, 5000);
}

function trackAction(actionType) {
    if (lastAction === actionType) {
        consecutiveCount++;
    } else {
        consecutiveCount = 1;
        lastAction = actionType;
    }

    if (actionType === "feed" && consecutiveCount >= 3) {
        document.getElementById("status").innerText = `${geckoName} feels sick from overeating!`;
        trust = Math.max(trust - 5, 0);
        updateTrustBar();
    } else if (actionType === "interact" && consecutiveCount >= 3) {
        document.getElementById("status").innerText = `${geckoName} feels stressed from too much play!`;
        trust = Math.max(trust - 5, 0);
        updateTrustBar();
    }
}

function feedGecko() {
    if (feedCooldown) return;
    trust = Math.min(trust + 10, 100);
    localStorage.setItem("geckoTrust", trust);
    document.getElementById("status").innerText = `You fed ${geckoName}. ${geckoName} looks happy!`;
    updateTrustBar();
    startFeedCooldown();
    trackAction("feed");
}

function interactGecko() {
    if (interactCooldown) return;
    trust = Math.min(trust + 5, 100);
    localStorage.setItem("geckoTrust", trust);
    document.getElementById("status").innerText = `You played with ${geckoName}. ${geckoName} trusts you more!`;
    updateTrustBar();
    startInteractCooldown();
    trackAction("interact");
}

// 🕒 Trust decay
function decayTrust() {
    trust = Math.max(trust - 1, 0);
    localStorage.setItem("geckoTrust", trust);
    updateTrustBar();
    showHintOrFact(); // <-- only update hints/facts here
}
setInterval(decayTrust, 10000);

// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
    theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.getElementById("theme-icon").innerText = theme === "dark" ? "dark_mode" : "light_mode";
});

// Attach event listeners
document.getElementById("feed-btn").addEventListener("click", feedGecko);
document.getElementById("interact-btn").addEventListener("click", interactGecko);

// Initialize bar on load
updateTrustBar();