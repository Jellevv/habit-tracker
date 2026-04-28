let currentWeekIndex = 0;
let focusedDayIndex = 0;
const CALENDAR_WINDOW = 5;
const NL_DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];


function renderCalendars() {

    let panel =
        document.getElementById("calendarPanel");

    panel.className =
        "box panel" +
        (focusPanel === "calendar"
            ? " focused"
            : "");



    panel.innerHTML =
        `<span class="panel-title">Kalender</span>`;

    if (habits.length === 0) {

        panel.innerHTML +=
            `<div style="opacity:0.6;font-size:11px;">
            Selecteer of maak een habit.
            </div>`;

        return;
    }



    if (focusPanel !== "calendar") {

        habits.forEach(h =>
            renderMiniWeek(h));

        return;
    }



    renderFullHabitCalendar();
}

function renderFlexCalendar(habit, panel) {

    let times =
        habit.timesPerWeek ?? 3;

    let weeks =
        habit.duration === 9999
            ? 52
            : Math.ceil(habit.duration / 7);



    let done =
        Object.values(habit.completions)
            .filter(Boolean).length;

    let meta = document.createElement("div");
    meta.className = "calendarMeta";

    meta.innerText =
        `${habit.name} · ${done} voltooid · week ${currentWeekIndex + 1} / ${weeks}`;

    panel.appendChild(meta);



    let headerRow = document.createElement("div");
    headerRow.className = "weekRow";

    for (let s = 0; s < times; s++) {
        let cell = document.createElement("div");
        cell.className = "dayCell dayHeader";
        cell.innerText = s + 1;
        headerRow.appendChild(cell);
    }

    panel.appendChild(headerRow);



    let half     = Math.floor(CALENDAR_WINDOW / 2);
    let startWeek = Math.max(0, currentWeekIndex - half);
    let endWeek   = Math.min(weeks - 1, startWeek + CALENDAR_WINDOW - 1);
    startWeek     = Math.max(0, endWeek - CALENDAR_WINDOW + 1); // re-clamp



    if (startWeek > 0) {
        let hint = document.createElement("div");
        hint.className = "scrollHint";
        hint.innerText = `↑ ${startWeek} weken eerder`;
        panel.appendChild(hint);
    }



    for (let w = startWeek; w <= endWeek; w++) {

        let weekRow =
            document.createElement("div");

        weekRow.className = "weekRow";

        for (let s = 0; s < times; s++) {

            let key  = `w${w}s${s}`;
            let done = habit.completions[key];

            let div = document.createElement("div");
            div.className = "dayCell";

            if (done)
                div.classList.add("dayDone");

            if (w === currentWeekIndex && s === focusedDayIndex)
                div.classList.add("dayFocused");

            div.dataset.week = w;
            div.dataset.slot = s;

            weekRow.appendChild(div);
        }

        panel.appendChild(weekRow);
    }



    if (endWeek < weeks - 1) {
        let hint = document.createElement("div");
        hint.className = "scrollHint";
        hint.innerText = `↓ ${weeks - 1 - endWeek} weken later`;
        panel.appendChild(hint);
    }
}



function renderMiniWeek(habit) {
    let panel = document.getElementById("calendarPanel");

    if (habit.frequencyMode === "flex") {

        renderMiniFlex(habit, panel);

        return;
    }

    let weekDates = getWeekDates(habit.startDate, currentWeekIndex);

    let wrapper = document.createElement("div");
    wrapper.className = "miniHabit";

    let title = document.createElement("div");
    title.className = "miniHabit-name";
    title.innerHTML =
        `${habit.name}<span class="miniHabit-cat">${habit.category}</span>`;
    wrapper.appendChild(title);

    let row = document.createElement("div");
    row.className = "weekRow";

    weekDates.forEach((date) => {
        let dayName = getDayName(date);
        let key = toKey(date);
        let done = habit.completions[key];
        let isAllowed = habit.frequency.includes(dayName);

        let div = document.createElement("div");
        div.className = "dayCell";
        if (!isAllowed) div.classList.add("dayDisabled");
        if (done) div.classList.add("dayDone");

        let nlIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(dayName);
        let nlMap = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

        div.innerHTML =
            `<span class="miniDay">${nlMap[nlIdx]}</span>${date.getDate()}`;
        row.appendChild(div);
    });

    wrapper.appendChild(row);
    panel.appendChild(wrapper);
}

function renderMiniFlex(habit, panel) {

    let wrapper = document.createElement("div");
    wrapper.className = "miniHabit";

    let title = document.createElement("div");
    title.className = "miniHabit-name";

    title.innerHTML =
        `${habit.name}<span class="miniHabit-cat">${habit.category}</span>`;

    wrapper.appendChild(title);

    let row = document.createElement("div");
    row.className = "weekRow";

    let times =
        habit.timesPerWeek ?? 3;

    for (let i = 0; i < times; i++) {

        let key =
            `w${currentWeekIndex}s${i}`;

        let done =
            habit.completions[key];

        let div =
            document.createElement("div");

        div.className = "dayCell";

        if (done)
            div.classList.add("dayDone");

        row.appendChild(div);
    }

    wrapper.appendChild(row);
    panel.appendChild(wrapper);
}




function renderFullHabitCalendar() {
    let panel =
        document.getElementById("calendarPanel");

    let habit =
        habits[selectedHabitIndex];

    if (!habit) return;



    if (habit.frequencyMode === "flex") {

        renderFlexCalendar(habit, panel);

        return;
    }

    let totalDays = habit.duration === 9999 ? 365 : habit.duration;
    let startDate = new Date(habit.startDate);
    let firstMonday = getMonday(startDate);
    let offset = getMondayOffset(startDate);
    let totalCells = totalDays + offset;
    let totalWeeks = Math.ceil(totalCells / 7);


    let focusedCell = focusedDayIndex + offset;
    let focusedWeek = Math.floor(focusedCell / 7);


    let half = Math.floor(CALENDAR_WINDOW / 2);
    let startWeek = Math.max(0, focusedWeek - half);
    let endWeek = Math.min(totalWeeks - 1, startWeek + CALENDAR_WINDOW - 1);
    startWeek = Math.max(0, endWeek - CALENDAR_WINDOW + 1); // re-clamp


    let progress = getProgress(habit, totalDays, startDate);
    let meta = document.createElement("div");
    meta.className = "calendarMeta";
    meta.innerText =
        `${habit.name}  ·  ${progress.done} dagen voltooid  ·  ` +
        `${formatDate(startDate)}`;
    panel.appendChild(meta);


    let headerRow = document.createElement("div");
    headerRow.className = "weekRow";
    NL_DAYS.forEach((nl) => {
        let cell = document.createElement("div");
        cell.className = "dayCell dayHeader";
        cell.innerText = nl;
        headerRow.appendChild(cell);
    });
    panel.appendChild(headerRow);


    if (startWeek > 0) {
        let hint = document.createElement("div");
        hint.className = "scrollHint";
        hint.innerText = `↑ ${startWeek} weken eerder`;
        panel.appendChild(hint);
    }


    for (let w = startWeek; w <= endWeek; w++) {
        let weekRow = document.createElement("div");
        weekRow.className = "weekRow";

        for (let d = 0; d < 7; d++) {
            let cellIndex = w * 7 + d;
            let date = new Date(firstMonday);
            date.setDate(firstMonday.getDate() + cellIndex);

            let dayName = getDayName(date);
            let key = toKey(date);
            let done = habit.completions[key];
            let isAllowed = habit.frequency.includes(dayName);
            let diffDays = Math.floor(
                (date - startDate) / (1000 * 60 * 60 * 24)
            );

            let div = document.createElement("div");
            div.className = "dayCell";
            div.innerText = date.getDate();

            if (diffDays < 0 || diffDays >= totalDays) {
                div.classList.add("dayOutside");
            } else {
                if (!isAllowed) div.classList.add("dayDisabled");
                if (done) div.classList.add("dayDone");
                if (diffDays === focusedDayIndex) div.classList.add("dayFocused");
            }

            weekRow.appendChild(div);
        }

        panel.appendChild(weekRow);
    }


    if (endWeek < totalWeeks - 1) {
        let hint = document.createElement("div");
        hint.className = "scrollHint";
        hint.innerText = `↓ ${totalWeeks - 1 - endWeek} weken later`;
        panel.appendChild(hint);
    }
}



function toggleFocusedDay() {

    if (habits.length === 0) return;

    let habit =
        habits[selectedHabitIndex];



    if (habit.frequencyMode === "flex") {

        let key =
            `w${currentWeekIndex}s${focusedDayIndex}`;

        let isCurrentlyDone = !!habit.completions[key];
        habit.completions[key] = !isCurrentlyDone;


        if (!isCurrentlyDone) {
            if (typeof activeChargesMemory !== 'undefined' &&
                activeChargesMemory[habit.category] > 0) {
                activeChargesMemory[habit.category]--;
                activeChargesUsed[habit.category]++;
            }
        } else {
            if (typeof activeChargesUsed !== 'undefined' &&
                activeChargesUsed[habit.category] > 0) {
                activeChargesUsed[habit.category]--;
                activeChargesMemory[habit.category]++;
            }
        }

        renderHabitsUI();
        return;
    }



    let startDate =
        new Date(habit.startDate);

    let date =
        new Date(startDate);

    date.setDate(
        startDate.getDate() + focusedDayIndex
    );

    if (
        !habit.frequency.includes(
            getDayName(date)
        )
    ) return;

    let key = toKey(date);
    let isCurrentlyDone = habit.completions[key];

    habit.completions[key] = !isCurrentlyDone;


    if (!isCurrentlyDone) {
        if (typeof activeChargesMemory !== 'undefined' &&
            activeChargesMemory[habit.category] > 0) {
            activeChargesMemory[habit.category]--;
            activeChargesUsed[habit.category]++;
        }
    } else {
        if (typeof activeChargesUsed !== 'undefined' &&
            activeChargesUsed[habit.category] > 0) {
            activeChargesUsed[habit.category]--;
            activeChargesMemory[habit.category]++;
        }
    }

    renderHabitsUI();
}





function moveWeek(direction) {
    if (habits.length === 0) return;

    let habit = habits[selectedHabitIndex];
    let maxWeeks = getMaxWeeks(habit);
    let newWeek = currentWeekIndex + direction;

    if (newWeek < 0) newWeek = 0;
    if (maxWeeks !== Infinity && newWeek >= maxWeeks)
        newWeek = maxWeeks - 1;

    currentWeekIndex = newWeek;
    focusedDayIndex = 0;
    renderHabitsUI();
}



function getProgress(habit, totalDays, startDate) {
    let done = Object.values(habit.completions).filter(Boolean).length;
    let possible = 0;
    let today = new Date();
    for (let i = 0; i < totalDays; i++) {
        let d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        if (d > today) break;
        if (habit.frequency.includes(getDayName(d))) possible++;
    }
    return { done, possible };
}

function formatDate(date) {
    return date.toLocaleDateString("nl-BE", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function toKey(date) {
    return date.toISOString().split("T")[0];
}

function getMonday(date) {
    let d = new Date(date);
    let day = d.getDay();
    let diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

function getMondayOffset(date) {
    let day = date.getDay();
    return day === 0 ? 6 : day - 1;
}

function getMaxWeeks(habit) {
    if (habit.duration === 9999) return Infinity;
    return Math.ceil(habit.duration / 7);
}

function getWeekDates(start, weekOffset) {
    let startDate = getMonday(start);
    startDate.setDate(startDate.getDate() + weekOffset * 7);
    let days = [];
    for (let i = 0; i < 7; i++) {
        let d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        days.push(d);
    }
    return days;
}

function getDayName(date) {
    let names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return names[date.getDay()];
}
