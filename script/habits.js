let habits = [];

let selectedHabitIndex = 0;

let focusPanel = "form";

let focusedFieldIndex = 1;

let formFields =
    ["naam", "categorie", "dagen", "duur"];

let habitNameBuffer = "";

let selectedDays =
    ["Mon", "Tue", "Wed", "Thu", "Fri"];

let duration = 7;

let category = "Intelligence";

let modus = "create"; // can be "create", "edit", or "delete"

let editHabitIndex = null; // index of the habit being edited


/* =====================
   RESET FORM
===================== */

function resetForm() {
    habitNameBuffer = "";
    selectedDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    duration = 7;
    category = "Intelligence";
    focusedFieldIndex = 0;
}

/* =====================
   RENDER FORM
===================== */

function renderForm() {
    let panel = document.getElementById("formPanel");
    panel.className =
        "box panel" + (focusPanel === "form" ? " focused" : "");

    let title = "Modus: Maak Habit";
    if (modus === "edit") {
        title = `Modus: Wijzig Habit: ${habits[editHabitIndex]?.name}`;
    } else if (modus === "delete") {
        title = `Modus: Verwijder Habit: ${habits[editHabitIndex]?.name}`;
    }

    panel.innerHTML = `<span class="panel-title">${title}</span>`;

    if (modus === "delete") {
        panel.innerHTML += `
            <div style="opacity:0.8;margin-top:10px;">
            [ENTER] → bevestig verwijderen<br>
            [ESC] → annuleer
            </div>`;
        return;
    }

    // For create or edit
    panel.innerHTML += `
        ${renderNaam()}
        ${renderCategorie()}
        ${renderDagen()}
        ${renderDuur()}
        <div style="opacity:0.6;font-size:0.9rem;margin-top:8px;">
        ENTER → ${modus === "edit" ? "opslaan wijzigingen" : "opslaan"}
        </div>`;
}


function renderNaam() {
    let f = focusedFieldIndex === 0 ? "focused" : "";
    return `
<div class="formRow ${f}">
<div class="formRow-label">Naam</div>
> ${habitNameBuffer}${focusedFieldIndex === 0 ? "" : ""}
</div>`;
}

function renderCategorie() {
    let f = focusedFieldIndex === 1 ? "focused" : "";
    let opts = STAT_CATEGORIES;
    let rows = opts.map((o, i) =>
        `[${i + 1}] ${STAT_ICONS[o] || ""} ${category === o ? "●" : "○"} ${o}`
    ).join("\n");
    return `
<div class="formRow ${f}">
<div class="formRow-label">Categorie (Stat)</div>
${rows}
</div>`;
}

function renderDagen() {
    let f = focusedFieldIndex === 2 ? "focused" : "";
    let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let nl = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
    let rows = days.map((d, i) => {
        let mark = selectedDays.includes(d) ? "●" : "○";
        return `[${i + 1}] ${mark} ${nl[i]}`;
    }).join("\n");
    return `
<div class="formRow ${f}">
<div class="formRow-label">Dagen</div>
${rows}
</div>`;
}

function renderDuur() {
    let f = focusedFieldIndex === 3 ? "focused" : "";
    let opts = [
        { key: "1", val: 7, label: "1 week" },
        { key: "2", val: 14, label: "2 weken" },
        { key: "3", val: 35, label: "5 weken" },
        { key: "4", val: 30, label: "1 maand" },
        { key: "0", val: 9999, label: "Onbeperkt" },
    ];
    let rows = opts.map(o =>
        `[${o.key}] ${duration === o.val ? "●" : "○"} ${o.label}`
    ).join("\n");
    return `
<div class="formRow ${f}">
<div class="formRow-label">Duur</div>
${rows}
</div>`;
}

/* =====================
   SAVE HABIT
===================== */

function saveHabit() {
    if (!habitNameBuffer.trim()) return;

    habits.push({
        name: habitNameBuffer.trim(),
        category,
        frequency: [...selectedDays],
        duration,
        startDate: new Date(),
        completions: {}
    });

    resetForm();

    // Stay in category field (not typing mode)
    focusedFieldIndex = 1;
    focusPanel = "form";

    renderHabitsUI();
}

function saveEdit() {
    if (!habitNameBuffer.trim() || editHabitIndex === null) return;

    let h = habits[editHabitIndex];
    h.name = habitNameBuffer.trim();
    h.category = category;
    h.frequency = [...selectedDays];
    h.duration = duration;

    // Reset edit state but stay in category
    modus = "create";
    editHabitIndex = null;
    habitNameBuffer = "";
    selectedDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    duration = 7;
    category = "Intelligence";

    focusedFieldIndex = 1; // never jump into name typing field
    focusPanel = "form";

    renderHabitsUI();
}


function deleteHabit() {
    if (editHabitIndex === null) return;

    habits.splice(editHabitIndex, 1);

    // Reset form
    modus = "create";
    editHabitIndex = null;
    resetForm();
    focusedFieldIndex = 1; // category
    focusPanel = "form";
    if (selectedHabitIndex >= habits.length)
        selectedHabitIndex = Math.max(0, habits.length - 1);

    renderHabitsUI();
}


/* =====================
   HABIT LIST
===================== */

function renderHabitList() {
    let panel = document.getElementById("listPanel");

    panel.className =
        "box panel" + (focusPanel === "list" ? " focused" : "");

    panel.innerHTML =
        `<span class="panel-title">Habits (${habits.length})</span>`;

    if (habits.length === 0) {
        panel.innerHTML +=
            `<div style="opacity:0.6;font-size:11px;">Nog geen habits.<br>Maak er één in het formulier.</div>`;
        return;
    }

    habits.forEach((h, i) => {
        let div = document.createElement("div");
        div.className = "habitItem" + (i === selectedHabitIndex ? " habitSelected" : "");
        let done = Object.values(h.completions).filter(Boolean).length;
        div.innerText = h.name;
        panel.appendChild(div);
    });
}

/* =====================
   MAIN RENDER
===================== */

function renderHabitsUI() {
    renderForm();
    renderHabitList();
    renderCalendars();
    renderStats();
    renderHotkeys();
}
