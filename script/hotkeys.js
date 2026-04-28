document.addEventListener("keydown", function (e) {
    let key = e.key.toLowerCase();

    /* =====================
       S — toggle skills panel
       Blocked only when typing a habit name (insert mode, step 0)
    ===================== */

    if (
        key === "s" &&
        !(focusPanel === "form" && formMode === "insert" && promptStep === 0)
    ) {
        showSkillsPanel = !showSkillsPanel;
        if (showSkillsPanel) focusPanel = "stats";
        renderHabitsUI();
        return;
    }

    /* =====================
       SKILLS PANEL NAVIGATION
       (when stats panel is focused and skills tree is open)
    ===================== */

    if (focusPanel === "stats" && showSkillsPanel) {

        if (key === "arrowdown" || key === "j") {
            focusedSkillCol = (focusedSkillCol + 1) % 5;
            renderHabitsUI();
            return;
        }

        if (key === "arrowup" || key === "k") {
            focusedSkillCol = (focusedSkillCol + 4) % 5; // -1 mod 5
            renderHabitsUI();
            return;
        }

        if (key === "arrowright" || key === "arrowleft") {
            // Only stat categories (0-3) have an active node; Global (4) is passive only
            if (focusedSkillCol < 4) {
                focusedSkillRow = focusedSkillRow === 0 ? 1 : 0;
            } else {
                focusedSkillRow = 0;
            }
            renderHabitsUI();
            return;
        }

        if (key === "enter" || key === " ") {
            e.preventDefault();
            attemptBuyFocusedSkill();
            return;
        }
    }

    /* =====================
       H / L — panel switch (vim-style)
       Blocked when typing in insert mode at name step
    ===================== */

    if (
        (key === "h" || key === "l") &&
        !(focusPanel === "form" && formMode === "insert" && promptStep === 0)
    ) {
        // In insert mode on non-name steps, h/l should not switch panels
        if (focusPanel === "form" && formMode === "insert") {
            // fall through to form handler below
        } else {
            let panels = ["form", "list", "calendar", "stats"];
            let idx = panels.indexOf(focusPanel);

            if (key === "h") idx--;
            if (key === "l") idx++;

            if (idx < 0) idx = panels.length - 1;
            if (idx >= panels.length) idx = 0;

            focusPanel = panels[idx];

            if (focusPanel === "calendar") {
                jumpToFirstOpenDay();
            }

            renderHabitsUI();
            return;
        }
    }

    /* =====================
       ESCAPE — back / cancel
    ===================== */

    if (key === "escape") {
        // Close skills panel if open
        if (showSkillsPanel) {
            showSkillsPanel = false;
            renderHabitsUI();
            return;
        }

        // If in insert mode, step back or cancel
        if (focusPanel === "form" && formMode === "insert") {
            if (promptStep > 0) {
                promptStep--;
                renderHabitsUI();
                return;
            }
            // At step 0 — cancel entirely
            modus = "create";
            editHabitIndex = null;
            resetForm();
            focusPanel = "form";
            renderHabitsUI();
            return;
        }

        // Default — focus form, normal mode
        focusPanel = "form";
        formMode = "normal";
        promptStep = 0;
        renderHabitsUI();
        return;
    }


    /* =====================
       FORM panel
    ===================== */

    if (focusPanel === "form") {
        // Normal mode — press i to enter insert mode
        if (formMode === "normal") {
            if (key === "i") {
                formMode = "insert";
                promptStep = 0;
                renderHabitsUI();
            }
            return;
        }

        // Insert mode — delegate to prompt handler
        handlePromptInput(e, key);
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

        // D — delete selected habit
        if (key === "d" && habits.length > 0) {
            modus = "delete";
            editHabitIndex = selectedHabitIndex;
            focusPanel = "form";
            formMode = "insert"; // enter insert mode for delete confirmation
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
            dayMode = h.frequencyMode || "fixed";
            selectedDays = [...(h.frequency || [])];
            timesPerWeek = h.timesPerWeek || 3;
            timesPerWeekCursor = Math.max(0, timesPerWeek - 1);
            duration = h.duration;

            focusPanel = "form";
            formMode = "insert";
            promptStep = 0; // start from name
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

        /* FLEX MODE NAVIGATION */

        if (habit.frequencyMode === "flex") {

            let times   = habit.timesPerWeek ?? 3;
            let maxWeeks = habit.duration === 9999
                ? 52
                : Math.ceil(habit.duration / 7);

            if (key === "arrowright" || key === "l") {
                if (focusedDayIndex < times - 1)
                    focusedDayIndex++;
                renderHabitsUI();
                return;
            }

            if (key === "arrowleft" || key === "h") {
                if (focusedDayIndex > 0)
                    focusedDayIndex--;
                renderHabitsUI();
                return;
            }

            if (key === "arrowdown" || key === "j") {
                if (currentWeekIndex < maxWeeks - 1) {
                    currentWeekIndex++;
                    focusedDayIndex = Math.min(focusedDayIndex, times - 1);
                }
                renderHabitsUI();
                return;
            }

            if (key === "arrowup" || key === "k") {
                if (currentWeekIndex > 0) {
                    currentWeekIndex--;
                    focusedDayIndex = Math.min(focusedDayIndex, times - 1);
                }
                renderHabitsUI();
                return;
            }

            if (key === " ") {
                e.preventDefault();
                toggleFocusedDay();
                return;
            }

            return;
        }

        /* FIXED MODE */

        let totalDays =
            habit.duration === 9999 ? 365 : habit.duration;

        let startDate =
            new Date(habit.startDate);

        // Build list of allowed day indices
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
            return;
        }

        if (key === "arrowleft" || key === "h") {
            let idx = allowedDays.indexOf(focusedDayIndex);
            if (idx > 0)
                focusedDayIndex = allowedDays[idx - 1];
            renderHabitsUI();
            return;
        }

        if (key === "arrowdown" || key === "j" || key === "]") {
            let idx = allowedDays.indexOf(focusedDayIndex);
            let jumpSpan = habit.frequency.length || 1;
            if (idx + jumpSpan < allowedDays.length) {
                focusedDayIndex = allowedDays[idx + jumpSpan];
            } else {
                focusedDayIndex = allowedDays[allowedDays.length - 1];
            }
            renderHabitsUI();
            return;
        }

        if (key === "arrowup" || key === "k" || key === "[") {
            let idx = allowedDays.indexOf(focusedDayIndex);
            let jumpSpan = habit.frequency.length || 1;
            if (idx - jumpSpan >= 0) {
                focusedDayIndex = allowedDays[idx - jumpSpan];
            } else {
                focusedDayIndex = allowedDays[0];
            }
            renderHabitsUI();
            return;
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
   PROMPT INPUT HANDLING
===================== */

function handlePromptInput(e, key) {

    /* DELETE MODE — only enter/esc */
    if (modus === "delete") {
        if (key === "enter") {
            deleteHabit();
        }
        return;
    }

    /* STEP 0: NAME — free typing */
    if (promptStep === 0) {
        if (key === "enter") {
            if (habitNameBuffer.trim()) {
                promptStep = 1;
                renderHabitsUI();
            }
            return;
        }

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

    /* STEP 1: CATEGORY */
    if (promptStep === 1) {

        let max = STAT_CATEGORIES.length - 1;

        if (key === "j") {
            categoryCursor = Math.min(max, categoryCursor + 1);
            renderHabitsUI();
            return;
        }

        if (key === "k") {
            categoryCursor = Math.max(0, categoryCursor - 1);
            renderHabitsUI();
            return;
        }

        if (key === " ") {
            category = STAT_CATEGORIES[categoryCursor];
            renderHabitsUI();
            return;
        }

        if (key === "enter") {
            promptStep = 2;
            renderHabitsUI();
            return;
        }
    }


    /* STEP 2: DAYS OR TIMES */
    if (promptStep === 2) {

        let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        /* TAB → switch fixed/flex mode */
        if (key === "tab") {
            e.preventDefault();
            dayMode = dayMode === "fixed" ? "flex" : "fixed";
            renderHabitsUI();
            return;
        }

        /* FIXED DAYS MODE */

        if (dayMode === "fixed") {

            if (key === "j") {
                dayCursor = Math.min(6, dayCursor + 1);
                renderHabitsUI();
                return;
            }

            if (key === "k") {
                dayCursor = Math.max(0, dayCursor - 1);
                renderHabitsUI();
                return;
            }

            if (key === " ") {
                let d = days[dayCursor];
                if (selectedDays.includes(d))
                    selectedDays = selectedDays.filter(x => x !== d);
                else
                    selectedDays.push(d);
                renderHabitsUI();
                return;
            }
        }

        /* FLEX MODE */

        if (dayMode === "flex") {

            if (key === "j") {
                timesPerWeekCursor = Math.min(6, timesPerWeekCursor + 1);
                renderHabitsUI();
                return;
            }

            if (key === "k") {
                timesPerWeekCursor = Math.max(0, timesPerWeekCursor - 1);
                renderHabitsUI();
                return;
            }

            if (key === " ") {
                timesPerWeek = timesPerWeekCursor + 1;
                renderHabitsUI();
                return;
            }
        }

        /* ENTER → next step */
        if (key === "enter") {
            promptStep = 3;
            renderHabitsUI();
            return;
        }
    }


    /* STEP 3: DURATION */
    if (promptStep === 3) {

        let opts = [7, 14, 35, 30, 9999];

        if (key === "j") {
            durationCursor = Math.min(4, durationCursor + 1);
            renderHabitsUI();
            return;
        }

        if (key === "k") {
            durationCursor = Math.max(0, durationCursor - 1);
            renderHabitsUI();
            return;
        }

        if (key === " ") {
            duration = opts[durationCursor];
            renderHabitsUI();
            return;
        }

        if (key === "enter") {
            promptStep = 4;
            renderHabitsUI();
            return;
        }
    }


    /* STEP 4: CONFIRM — enter to save */
    if (promptStep === 4) {
        if (key === "enter") {
            if (modus === "create") {
                saveHabit();
            } else if (modus === "edit") {
                saveEdit();
            }
        }
        return;
    }
}
