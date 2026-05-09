let habits = [];

let selectedHabitIndex = 0;

let focusPanel = "form";

let formMode = "normal";

let promptStep = 0;

let formFields =
    ["naam", "categorie", "dagen", "duur"];

let habitNameBuffer = "";

let selectedDays =
    ["Mon", "Tue", "Wed", "Thu", "Fri"];

let duration = 7;

let category = "Intelligentie";

let modus = "create";

let editHabitIndex = null;

let categoryCursor = 0;

let dayCursor = 0;

let durationCursor = 0;

let dayMode = "fixed";
let timesPerWeek = 3;
let timesPerWeekCursor = 2;





function resetForm() {

    habitNameBuffer = "";

    selectedDays =
        ["Mon", "Tue", "Wed", "Thu", "Fri"];

    duration = 7;

    category = "Intelligentie";

    dayMode = "fixed";

    timesPerWeek = 3;

    timesPerWeekCursor = 2;

    promptStep = 0;

    formMode = "normal";

    categoryCursor = 0;
    dayCursor = 0;
    durationCursor = 0;
}





function renderForm() {

    let panel = document.getElementById("formPanel");

    panel.className =
        "box panel" +
        (focusPanel === "form"
            ? " focused"
            : "");

    let title = "Modus: Maak Habit";

    if (modus === "edit") {
        title =
            `Modus: Wijzig Habit: ${habits[editHabitIndex]?.name}`;
    }

    else if (modus === "delete") {
        title =
            `Modus: Verwijder Habit: ${habits[editHabitIndex]?.name}`;
    }

    let html =
        `<span class="panel-title">${title}</span>`;



    if (modus === "delete") {

        html += `
        <div style="opacity:0.8;margin-top:10px;">
        [ENTER] → bevestig verwijderen<br>
        [ESC] → annuleer
        </div>`;

        panel.innerHTML = html;
        return;
    }



    if (formMode === "normal") {

        html += `
        <div class="prompt-session">

            <div class="prompt-idle">
                <span class="prompt-symbol">&gt;</span>
                <span class="prompt-idle-text">
                    Druk [i] om een habit aan te maken
                </span>
            </div>

        </div>`;

        panel.innerHTML = html;
        return;
    }



    html += `<div class="prompt-session">`;



    if (promptStep > 0) {

        html += renderAnsweredLine(
            "Hoe moet je habit heten?",
            habitNameBuffer
        );

    }

    else {

        html += renderPromptQuestion(
            "Hoe moet je habit heten?"
        );

        html += renderPromptInput(
            habitNameBuffer
        );
    }




    if (promptStep > 1) {

        html += renderAnsweredLine(
            "Welke stat categorie?",
            category
        );

    }

    else if (promptStep === 1) {

        html += renderPromptQuestion(
            "Welke stat categorie?"
        );

        html += renderCategoryOptions();
    }

    else {

        html += renderFutureLine(
            "Welke stat categorie?"
        );
    }




    let dayQuestion = dayMode === "flex" ? "Hoe vaak?" : "Welke dagen?";

    if (promptStep > 2) {

        let nl =
        {
            Mon: "Ma", Tue: "Di", Wed: "Wo",
            Thu: "Do", Fri: "Vr",
            Sat: "Za", Sun: "Zo"
        };

        let dayStr =
            dayMode === "flex"
                ? `${timesPerWeek}× per week`
                : selectedDays.map(d => nl[d]).join(", ");

        html += renderAnsweredLine(
            dayQuestion,
            dayStr
        );

    }

    else if (promptStep === 2) {

        html += renderPromptQuestion(
            dayQuestion
        );

        html += renderDayOptions();
    }

    else {

        html += renderFutureLine(
            dayQuestion
        );
    }




    if (promptStep > 3) {

        html += renderAnsweredLine(
            "Hoe lang?",
            getDurationLabel(duration)
        );

    }

    else if (promptStep === 3) {

        html += renderPromptQuestion(
            "Hoe lang?"
        );

        html += renderDurationOptions();
    }

    else {

        html += renderFutureLine(
            "Hoe lang?"
        );
    }




    if (promptStep === 4) {

        html += `
        <div class="prompt-confirm">

            <span class="prompt-symbol">→</span>

            <span class="prompt-action">

                [ENTER]
                ${modus === "edit"
                ? "opslaan wijzigingen"
                : "opslaan"}

                · [ESC] annuleer

            </span>

        </div>`;
    }

    else {

        html += renderFutureLine(
            "Bevestigen"
        );
    }

    html += `</div>`;

    panel.innerHTML = html;
}





function renderAnsweredLine(question, answer) {
    return `
<div class="prompt-answered">
<span class="prompt-symbol">✓</span>
<span class="prompt-q">${question}</span>
<span class="prompt-a">${answer}</span>
</div>`;
}

function renderPromptQuestion(question) {
    return `
<div class="prompt-current">
<span class="prompt-symbol">&gt;</span>
<span class="prompt-q-active">${question}</span>
</div>`;
}

function renderPromptInput(value) {
    return `
<div class="prompt-input-line">
<span class="prompt-symbol">$</span>
<span class="prompt-typed">${value}</span><span class="prompt-cursor">█</span>
</div>`;
}

function renderCategoryOptions() {

    let opts = STAT_CATEGORIES;

    let rows = opts.map((o, i) => {

        let selected = category === o;
        let cursor = i === categoryCursor;
        let color = STAT_COLORS[o];

        return `
        <div class="prompt-option
            ${cursor ? " prompt-option-cursor" : ""}
            ${selected ? " prompt-option-selected" : ""}"
            style="${selected ? "color:" + color : ""}">

            ${cursor ? ">" : " "}

            ${selected ? "●" : "○"}

            ${o}

        </div>`;

    }).join("");

    rows += `
    <div class="prompt-hint">
        j/k of ↑↓ → bewegen · enter → bevestigen
    </div>`;

    return `<div class="prompt-options">${rows}</div>`;
}


function renderDayOptions() {



    if (dayMode === "flex") {

        let rows = [1, 2, 3, 4, 5, 6, 7].map((n, i) => {

            let selected = timesPerWeek === n;
            let cursor   = i === timesPerWeekCursor;

            return `
            <div class="prompt-option
                ${cursor  ? " prompt-option-cursor"   : ""}
                ${selected ? " prompt-option-selected" : ""}">

                ${cursor ? ">" : " "}

                ${selected ? "●" : "○"}

                ${n}× per week

            </div>`;

        }).join("");

        rows += `
        <div class="prompt-hint">
            j/k of ↑↓ → bewegen · TAB → vaste dagen · enter → bevestigen
        </div>`;

        return `<div class="prompt-options">${rows}</div>`;
    }



    let days =
        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    let nl =
        ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

    let rows = days.map((d, i) => {

        let selected =
            selectedDays.includes(d);

        let cursor =
            i === dayCursor;

        return `
        <div class="prompt-option
            ${cursor ? " prompt-option-cursor" : ""}
            ${selected ? " prompt-option-selected" : ""}">

            ${cursor ? ">" : " "}

            ${selected ? "●" : "○"}

            ${nl[i]}

        </div>`;

    }).join("");

    rows += `
    <div class="prompt-hint">

        j/k of ↑↓ → bewegen · spatie → togglen · TAB → # keer/week · enter → bevestigen

    </div>`;

    return `<div class="prompt-options">${rows}</div>`;
}


function renderDurationOptions() {

    let opts = [
        { val: 7, label: "1 week" },
        { val: 14, label: "2 weken" },
        { val: 35, label: "5 weken" },
        { val: 30, label: "1 maand" },
        { val: 9999, label: "Onbeperkt" }
    ];

    let rows = opts.map((o, i) => {

        let selected =
            duration === o.val;

        let cursor =
            i === durationCursor;

        return `
        <div class="prompt-option
            ${cursor ? " prompt-option-cursor" : ""}
            ${selected ? " prompt-option-selected" : ""}">

            ${cursor ? ">" : " "}

            ${selected ? "●" : "○"}

            ${o.label}

        </div>`;

    }).join("");

    rows += `
    <div class="prompt-hint">
        j/k of ↑↓ → bewegen · enter → bevestigen
    </div>`;

    return `<div class="prompt-options">${rows}</div>`;
}


function getDurationLabel(val) {
    let map = { 7: "1 week", 14: "2 weken", 35: "5 weken", 30: "1 maand", 9999: "Onbeperkt" };
    return map[val] || val;
}

function renderFutureLine(question) {

    return `
<div class="prompt-future">

<span class="prompt-symbol">○</span>

<span class="prompt-q-future">
${question}
</span>

</div>`;
}




function saveHabit() {

    if (!habitNameBuffer.trim()) return;

    habits.push({

        name: habitNameBuffer.trim(),

        category,

        frequencyMode: dayMode,

        frequency:
            dayMode === "fixed"
                ? [...selectedDays]
                : [],

        timesPerWeek:
            dayMode === "flex"
                ? Math.min(7, Math.max(1, timesPerWeek))
                : null,

        duration,

        startDate: new Date(),

        completions: {}

    });

    resetForm();

    renderHabitsUI();
}


function saveEdit() {
    if (!habitNameBuffer.trim() || editHabitIndex === null) return;

    let h = habits[editHabitIndex];
    h.name = habitNameBuffer.trim();
    h.category = category;
    h.frequencyMode = dayMode;
    h.frequency = dayMode === "fixed" ? [...selectedDays] : [];
    h.timesPerWeek = dayMode === "flex" ? Math.min(7, Math.max(1, timesPerWeek)) : null;
    h.duration = duration;

    modus = "create";
    editHabitIndex = null;
    resetForm();
    focusPanel = "form";

    renderHabitsUI();
}


function deleteHabit() {
    if (editHabitIndex === null) return;

    habits.splice(editHabitIndex, 1);

    modus = "create";
    editHabitIndex = null;
    resetForm();
    focusPanel = "form";
    formMode = "normal";
    if (selectedHabitIndex >= habits.length)
        selectedHabitIndex = Math.max(0, habits.length - 1);

    renderHabitsUI();
}




function renderHabitList() {
    let panel = document.getElementById("listPanel");

    panel.className =
        "box panel" + (focusPanel === "list" ? " focused" : "");

    panel.innerHTML =
        `<span class="panel-title">Gewoontes (${habits.length})</span>`;

    if (habits.length === 0) {
        panel.innerHTML +=
            `<div style="opacity:0.6;font-size:11px;">Nog geen gewoontes.<br>Maak er één in het formulier.</div>`;
        return;
    }

    habits.forEach((h, i) => {
        let div = document.createElement("div");
        div.className = "habitItem" + (i === selectedHabitIndex ? " habitSelected" : "");
        div.innerText = h.name;
        panel.appendChild(div);
    });
}



function renderHabitsUI() {
    renderForm();
    renderHabitList();
    renderCalendars();
    renderStats();
    renderHotkeys();
    saveToLocalStorage();
}
