/* =====================
   STATS & LEVEL SYSTEM
   Each completed habit day = 10 XP for its stat category
   Level = floor(sqrt(totalXP / 25)) + 1  (caps at 99)
===================== */

const STAT_CATEGORIES = ["Intelligence", "Physical", "Charisma", "Spirit"];

const STAT_ICONS = {
    Intelligence: "🧠",
    Physical:     "💪",
    Charisma:     "✨",
    Spirit:       "🌟"
};

const STAT_COLORS = {
    Intelligence: "#60a5fa",   // blue
    Physical:     "#f87171",   // red
    Charisma:     "#facc15",   // gold
    Spirit:       "#a78bfa"    // purple
};

const XP_PER_COMPLETION = 10;

/* =====================
   CALCULATE XP per stat
===================== */

function getStatXP() {
    let xp = {};
    STAT_CATEGORIES.forEach(s => xp[s] = 0);

    // Global booster check
    let hasGlobal = purchasedCount["glo_b"] >= 1;

    habits.forEach(h => {
        if (!STAT_CATEGORIES.includes(h.category)) return;
        let done = Object.values(h.completions).filter(Boolean).length;
        
        let baseXP = done * XP_PER_COMPLETION;
        
        // Passive hook
        let passiveNode = SKILLS_DATA[h.category] && SKILLS_DATA[h.category].passive;
        if (passiveNode && purchasedCount[passiveNode.id]) {
            baseXP += done * 2; // +2 per completion
        }

        xp[h.category] += baseXP;
    });

    // Active boosters hook
    STAT_CATEGORIES.forEach(s => {
        if (typeof activeChargesUsed !== 'undefined' && activeChargesUsed[s]) {
             xp[s] += activeChargesUsed[s] * (XP_PER_COMPLETION * 1.0);
        }
        
        if (hasGlobal) {
             xp[s] = Math.floor(xp[s] * 1.15);
        }
    });

    return xp;
}

/* =====================
   XP → LEVEL
   Leveling curve: level N requires N² * 25 total XP
   Level 1 = 0 XP, Level 2 = 25 XP, Level 3 = 100 XP, ...
===================== */

function getLevel(xp) {
    let lvl = Math.floor(Math.sqrt(xp / 25)) + 1;
    return Math.min(lvl, 99);
}

function getXPForLevel(level) {
    return (level - 1) * (level - 1) * 25;
}

function getXPForNextLevel(level) {
    if (level >= 99) return Infinity;
    return level * level * 25;
}

/* =====================
   OVERALL LEVEL (average of all stats)
===================== */

function getOverallLevel(xpMap) {
    let totalXP = 0;
    STAT_CATEGORIES.forEach(s => totalXP += xpMap[s]);
    return getLevel(totalXP);
}

/* =====================
   RENDER STATS PANEL
===================== */

function renderStats() {
    let panel = document.getElementById("statsPanel");
    if (!panel) return;

    panel.className = "box panel" + (focusPanel === "stats" ? " focused" : "");

    if (showSkillsPanel) {
        panel.innerHTML = renderSkillsUI();
        return;
    }

    let xpMap = getStatXP();
    let overallXP = 0;
    STAT_CATEGORIES.forEach(s => overallXP += xpMap[s]);
    let overallLvl = getLevel(overallXP);
    let overallNext = getXPForNextLevel(overallLvl);
    let overallCurr = getXPForLevel(overallLvl);
    let overallProg = overallNext === Infinity ? 1 :
        (overallXP - overallCurr) / (overallNext - overallCurr);

    let html = `<span class="panel-title">Stats & Level</span>`;

    /* Overall level display */
    html += `<div class="stat-overall">`;
    html += `<div class="stat-overall-label">OVERALL LEVEL</div>`;
    html += `<div class="stat-overall-level">${overallLvl}</div>`;
    html += `<div class="stat-overall-xp">${overallXP} XP totaal</div>`;
    html += renderProgressBar(overallProg, "#ffffff");
    if (overallNext !== Infinity) {
        html += `<div class="stat-xp-hint">${overallXP - overallCurr} / ${overallNext - overallCurr} XP naar LVL ${overallLvl + 1}</div>`;
    } else {
        html += `<div class="stat-xp-hint">MAX LEVEL</div>`;
    }
    html += `</div>`;

    /* Separator */
    html += `<div class="stat-separator">──────────────────</div>`;

    /* Per-stat rows */
    STAT_CATEGORIES.forEach(stat => {
        let xp = xpMap[stat];
        let lvl = getLevel(xp);
        let currXP = getXPForLevel(lvl);
        let nextXP = getXPForNextLevel(lvl);
        let progress = nextXP === Infinity ? 1 :
            (xp - currXP) / (nextXP - currXP);
        let color = STAT_COLORS[stat];
        let icon = STAT_ICONS[stat];

        html += `<div class="stat-row">`;
        html += `<div class="stat-row-header">`;
        html += `<span class="stat-icon">${icon}</span>`;
        html += `<span class="stat-name" style="color:${color}">${stat}</span>`;
        html += `<span class="stat-lvl">LVL ${lvl}</span>`;
        html += `</div>`;
        html += renderProgressBar(progress, color);
        html += `<div class="stat-xp-detail">${xp} XP`;
        if (nextXP !== Infinity) {
            html += ` · ${nextXP - xp} XP tot LVL ${lvl + 1}`;
        }
        html += `</div>`;
        html += `</div>`;
    });

    /* Stat summary table */
    html += `<div class="stat-separator">──────────────────</div>`;
    html += `<div class="stat-table">`;
    html += `<div class="stat-table-header">`;
    html += `<span class="stat-table-col">STAT</span>`;
    html += `<span class="stat-table-col">LVL</span>`;
    html += `<span class="stat-table-col">XP</span>`;
    html += `</div>`;

    STAT_CATEGORIES.forEach(stat => {
        let xp = xpMap[stat];
        let lvl = getLevel(xp);
        let color = STAT_COLORS[stat];
        let icon = STAT_ICONS[stat];

        html += `<div class="stat-table-row">`;
        html += `<span class="stat-table-col" style="color:${color}">${icon} ${stat.substring(0, 4)}</span>`;
        html += `<span class="stat-table-col">${lvl}</span>`;
        html += `<span class="stat-table-col">${xp}</span>`;
        html += `</div>`;
    });

    html += `</div>`;

    panel.innerHTML = html;
}

function renderProgressBar(progress, color) {
    let filled = Math.round(progress * 16);
    let empty = 16 - filled;
    let bar = "█".repeat(filled) + "░".repeat(empty);
    return `<div class="stat-bar" style="color:${color}">[${bar}]</div>`;
}
