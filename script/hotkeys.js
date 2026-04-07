document.addEventListener("keydown", function (e) {
    let key = e.key.toLowerCase();

    /* =====================
       TAB — cycle panels
    ===================== */

    if (key === "tab") {
        e.preventDefault();

        if (focusPanel === "form") {
            // Cycle fields (skip name field)
            focusedFieldIndex++;
            if (focusedFieldIndex > 3) focusedFieldIndex = 1; // loop category → duration
            renderHabitsUI();
        }
        return;
    }


    /* =====================
       H / L — panel switch (vim-style)
       Blocked when typing in name field
    ===================== */

    if (
        (key === "h" || key === "l") &&
        !(focusPanel === "form" && focusedFieldIndex === 0)
    ) {
        let panels = ["form", "list", "calendar"];
        let idx = panels.indexOf(focusPanel);

        if (key === "h") idx--;
        if (key === "l") idx++;

        if (idx < 0) idx = panels.length - 1;
        if (idx >= panels.length) idx = 0;

        focusPanel = panels[idx];

        if (focusPanel === "form") {
            /* Skip to category so we don't land in the typing field */
            focusedFieldIndex = 1;
        }

        if (focusPanel === "calendar") {
            jumpToFirstOpenDay();
        }

        renderHabitsUI();
        return;
    }

    /* =====================
       ESCAPE — back to form
    ===================== */

    if (key === "escape") {
        if (modus === "edit" || modus === "delete") {
            // Cancel edit/delete
            modus = "create";
            editHabitIndex = null;

            habitNameBuffer = "";
            selectedDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
            duration = 7;
            category = "Health";

            focusedFieldIndex = 1; // skip name field
            focusPanel = "form";
            renderHabitsUI();
            return;
        }

        // Default ESC behavior — go to name field
        modus = "create";
        editHabitIndex = null;
        focusPanel = "form";
        focusedFieldIndex = 0; // typing field
        renderHabitsUI();
        return;
    }



    /* =====================
       FORM
    ===================== */

    if (focusPanel === "form") {
        handleFormInput(e, key);
        return;
    }

    /* =====================
       LIST — J/K or ↑↓
    ===================== */

    if (focusPanel === "list") {
        if ((key === "j" || key === "arrowdown") &&
            selectedHabitIndex < habits.length - 1) {
            selectedHabitIndex++;
            renderHabitsUI();
        }

        if ((key === "k" || key === "arrowup") &&
            selectedHabitIndex > 0) {
            selectedHabitIndex--;
            renderHabitsUI();
        }

        /* D — delete selected habit */
        if (key === "d" && habits.length > 0) {
            modus = "delete";
            editHabitIndex = selectedHabitIndex;
            focusPanel = "form"; // switch to form panel to confirm
            renderHabitsUI();
            return;
        }

        // E — edit habit
        if (key === "e" && habits.length > 0) {
            modus = "edit";
            editHabitIndex = selectedHabitIndex;

            // Load habit data into form buffers
            let h = habits[editHabitIndex];
            habitNameBuffer = h.name;
            category = h.category;
            selectedDays = [...h.frequency];
            duration = h.duration;

            focusPanel = "form";
            focusedFieldIndex = 1; // skip name field unless ESC pressed
            renderHabitsUI();
            return;
        }
    }

    /* =====================
       CALENDAR — arrow navigation + space toggle
    ===================== */

    if (focusPanel === "calendar") {
        let habit = habits[selectedHabitIndex];
        if (!habit) return;

        let totalDays = habit.duration === 9999 ? 365 : habit.duration;
        let startDate = new Date(habit.startDate);

        /* Build list of allowed day indices */
        let allowedDays = [];
        for (let i = 0; i < totalDays; i++) {
            let d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            if (habit.frequency.includes(getDayName(d)))
                allowedDays.push(i);
        }

        if (key === "arrowright" || key === "l") {
            let idx = allowedDays.indexOf(focusedDayIndex);
            if (idx < allowedDays.length - 1)
                focusedDayIndex = allowedDays[idx + 1];
            renderHabitsUI();
        }

        if (key === "arrowleft" || key === "h") {
            // h is blocked above for panel-switch when in calendar
            // (only reaches here if we're already in calendar)
            let idx = allowedDays.indexOf(focusedDayIndex);
            if (idx > 0)
                focusedDayIndex = allowedDays[idx - 1];
            renderHabitsUI();
        }

        if (key === " ") {
            e.preventDefault();
            toggleFocusedDay();
        }
    }
});

/* =====================
   Jump to first incomplete allowed day
===================== */

function jumpToFirstOpenDay() {
    let habit = habits[selectedHabitIndex];
    if (!habit) return;

    let totalDays = habit.duration === 9999 ? 365 : habit.duration;
    let startDate = new Date(habit.startDate);

    focusedDayIndex = 0;

    for (let i = 0; i < totalDays; i++) {
        let date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        let key = date.toISOString().split("T")[0];

        if (
            !habit.completions[key] &&
            habit.frequency.includes(getDayName(date))
        ) {
            focusedDayIndex = i;
            break;
        }
    }
}

/* =====================
   FORM INPUT HANDLING
===================== */

function handleFormInput(e, key) {

    /* NAAM */
    if (focusedFieldIndex === 0) {
        if (key === "backspace") {
            habitNameBuffer = habitNameBuffer.slice(0, -1);
            renderHabitsUI();
            return;
        }
        if (key.length === 1) {
            habitNameBuffer += e.key;
            renderHabitsUI();
            return;
        }
    }

    /* CATEGORIE */
    if (focusedFieldIndex === 1) {
        if (key === "1") category = "Health";
        if (key === "2") category = "Activity";
        if (key === "3") category = "Knowledge";
        renderHabitsUI();
    }

    /* DAGEN */
    if (focusedFieldIndex === 2) {
        let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        let i = parseInt(key) - 1;

        if (i >= 0 && i < 7) {
            let d = days[i];
            if (selectedDays.includes(d))
                selectedDays = selectedDays.filter(x => x !== d);
            else
                selectedDays.push(d);
            renderHabitsUI();
        }
    }

    /* DUUR */
    if (focusedFieldIndex === 3) {
        if (key === "1") duration = 7;
        if (key === "2") duration = 14;
        if (key === "3") duration = 35;
        if (key === "4") duration = 30;
        if (key === "0") duration = 9999;
        renderHabitsUI();
    }

    /* ENTER — save */
    if (key === "enter") {
        if (modus === "create") {
            saveHabit();
        } else if (modus === "edit") {
            saveEdit();
        } else if (modus === "delete") {
            deleteHabit();
        }
    }
}
