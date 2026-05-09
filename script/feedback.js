/* =====================
   VISUAL FEEDBACK SYSTEM
   - XP progress bar on habit completion
   - Level-up popup (Dutch)
===================== */

let _xpBarTimeout = null;
let _levelUpTimeout = null;

/**
 * Snapshot current XP and levels for all stats + overall.
 * Call BEFORE toggling a habit completion.
 */
function snapshotXP() {
    let xpMap = getStatXP();
    let snap = {};

    STAT_CATEGORIES.forEach(s => {
        snap[s] = {
            xp: xpMap[s],
            level: getLevel(xpMap[s])
        };
    });

    let totalXP = 0;
    STAT_CATEGORIES.forEach(s => totalXP += xpMap[s]);
    snap._overall = {
        xp: totalXP,
        level: getLevel(totalXP)
    };

    return snap;
}

/**
 * Compare before/after snapshots and trigger visual feedback.
 * Call AFTER toggling a habit completion.
 */
function showXPFeedback(beforeSnap, habitCategory) {
    let afterXPMap = getStatXP();

    let beforeXP = beforeSnap[habitCategory]?.xp ?? 0;
    let afterXP  = afterXPMap[habitCategory] ?? 0;
    let xpGained = afterXP - beforeXP;

    // Only show feedback when gaining XP (completing, not un-completing)
    if (xpGained <= 0) return;

    let afterLevel = getLevel(afterXP);
    let currLevelXP = getXPForLevel(afterLevel);
    let nextLevelXP = getXPForNextLevel(afterLevel);
    let progress = nextLevelXP === Infinity ? 1 :
        (afterXP - currLevelXP) / (nextLevelXP - currLevelXP);

    // Show XP bar
    showXPBar(habitCategory, xpGained, afterXP, afterLevel, progress);

    // Check for level-ups (per-stat and overall)
    let beforeLevel = beforeSnap[habitCategory]?.level ?? 1;
    if (afterLevel > beforeLevel) {
        setTimeout(() => {
            showLevelUpPopup(habitCategory, afterLevel);
        }, 400);
    }

    // Check overall level-up
    let totalAfterXP = 0;
    STAT_CATEGORIES.forEach(s => totalAfterXP += afterXPMap[s]);
    let overallAfterLevel = getLevel(totalAfterXP);
    let overallBeforeLevel = beforeSnap._overall?.level ?? 1;

    if (overallAfterLevel > overallBeforeLevel) {
        setTimeout(() => {
            showLevelUpPopup("Totaal", overallAfterLevel, true);
        }, afterLevel > beforeLevel ? 2800 : 400);
    }
}


/* ─────────────────────────────────
   XP PROGRESS BAR (bottom of screen)
───────────────────────────────── */

function showXPBar(statName, xpGained, totalXP, level, progress) {
    // Remove existing bar if any
    let existing = document.getElementById("xpFeedbackBar");
    if (existing) existing.remove();
    if (_xpBarTimeout) clearTimeout(_xpBarTimeout);

    let color = STAT_COLORS[statName] || "#ffffff";
    let icon  = STAT_ICONS[statName]  || "⭐";

    let bar = document.createElement("div");
    bar.id = "xpFeedbackBar";
    bar.innerHTML = `
        <div class="xp-fb-content">
            <div class="xp-fb-top">
                <span class="xp-fb-icon">${icon}</span>
                <span class="xp-fb-stat" style="color:${color}">${statName}</span>
                <span class="xp-fb-gain">+${xpGained} XP</span>
                <span class="xp-fb-level">NIV ${level}</span>
            </div>
            <div class="xp-fb-bar-track">
                <div class="xp-fb-bar-fill" style="background:${color}"></div>
            </div>
            <div class="xp-fb-xp-text">${totalXP} XP totaal</div>
        </div>
    `;
    document.body.appendChild(bar);

    // Trigger entrance animation
    requestAnimationFrame(() => {
        bar.classList.add("xp-fb-visible");
        // Animate the fill bar
        let fill = bar.querySelector(".xp-fb-bar-fill");
        requestAnimationFrame(() => {
            fill.style.width = (progress * 100) + "%";
        });
    });

    // Auto-dismiss after 2.5s
    _xpBarTimeout = setTimeout(() => {
        bar.classList.remove("xp-fb-visible");
        bar.classList.add("xp-fb-exit");
        setTimeout(() => bar.remove(), 500);
    }, 2500);
}


/* ─────────────────────────────────
   LEVEL-UP POPUP
───────────────────────────────── */

function showLevelUpPopup(statName, newLevel, isOverall) {
    // Remove existing popup if any
    let existing = document.getElementById("levelUpPopup");
    if (existing) existing.remove();
    if (_levelUpTimeout) clearTimeout(_levelUpTimeout);

    let color = isOverall ? "#ffffff" : (STAT_COLORS[statName] || "#ffffff");
    let icon  = isOverall ? "🏆" : (STAT_ICONS[statName] || "⭐");

    let popup = document.createElement("div");
    popup.id = "levelUpPopup";
    popup.innerHTML = `
        <div class="lvl-popup-backdrop"></div>
        <div class="lvl-popup-box">
            <div class="lvl-popup-particles" id="lvlParticles"></div>
            <div class="lvl-popup-icon">${icon}</div>
            <div class="lvl-popup-title">NIVEAU OMHOOG!</div>
            <div class="lvl-popup-stat" style="color:${color}">${statName}</div>
            <div class="lvl-popup-level">${newLevel}</div>
            <div class="lvl-popup-subtitle">Gefeliciteerd!</div>
            <div class="lvl-popup-reward">
                ${isOverall ? `<span class="lvl-popup-reward-icon">🎁</span> +1 SP (vaardigheidspunt) verdiend!` : `<span class="lvl-popup-reward-icon">✨</span> Blijf zo doorgaan!`}
            </div>
            ${isOverall ? `<div class="lvl-popup-hint">Gebruik jouw vaardigheidspunten bij de 'Stats &amp; Niveau' tab!</div>` : ``}
            <div class="lvl-popup-dismiss">druk op een toets om door te gaan</div>
        </div>
    `;
    document.body.appendChild(popup);

    // Create particles
    spawnLevelUpParticles(color);

    // Entrance animation
    requestAnimationFrame(() => {
        popup.classList.add("lvl-popup-visible");
    });

    // Dismiss on any key press
    function dismissHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        popup.classList.remove("lvl-popup-visible");
        popup.classList.add("lvl-popup-exit");
        setTimeout(() => popup.remove(), 400);
        document.removeEventListener("keydown", dismissHandler, true);
    }

    // Delay adding the dismiss handler so the triggering keypress doesn't close it
    setTimeout(() => {
        document.addEventListener("keydown", dismissHandler, true);
    }, 300);

    // Auto-dismiss after 5s
    _levelUpTimeout = setTimeout(() => {
        popup.classList.remove("lvl-popup-visible");
        popup.classList.add("lvl-popup-exit");
        setTimeout(() => popup.remove(), 400);
        document.removeEventListener("keydown", dismissHandler, true);
    }, 5000);
}


function spawnLevelUpParticles(color) {
    let container = document.getElementById("lvlParticles");
    if (!container) return;

    let chars = ["✦", "★", "◆", "●", "▲", "♦"];

    for (let i = 0; i < 20; i++) {
        let p = document.createElement("span");
        p.className = "lvl-particle";
        p.textContent = chars[Math.floor(Math.random() * chars.length)];
        p.style.left = Math.random() * 100 + "%";
        p.style.animationDelay = (Math.random() * 0.6) + "s";
        p.style.animationDuration = (1.5 + Math.random() * 1.5) + "s";
        p.style.color = color;
        p.style.fontSize = (10 + Math.random() * 14) + "px";
        container.appendChild(p);
    }
}
