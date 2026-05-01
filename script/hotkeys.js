document.addEventListener("keydown", function (e) {
    let key = e.key.toLowerCase();



    if (
        key === "s" &&
        !(focusPanel === "form" && formMode === "insert" && promptStep === 0)
    ) {
        if (!showSkillsPanel) {
            if (typeof draftPurchasedCount !== 'undefined') {
                draftPurchasedCount = JSON.parse(JSON.stringify(purchasedCount));
                draftActiveCharges = { ...activeChargesMemory };
            }
        } else {
            if (typeof draftPurchasedCount !== 'undefined' && draftPurchasedCount !== null) {
                purchasedCount = draftPurchasedCount;
                activeChargesMemory = draftActiveCharges;
                draftPurchasedCount = null;
                draftActiveCharges = null;
            }
        }

        showSkillsPanel = !showSkillsPanel;
        if (showSkillsPanel) focusPanel = "stats";
        renderHabitsUI();
        return;
    }



    if (focusPanel === "stats" && showSkillsPanel) {

        if (key === "arrowdown" || key === "j") {
            focusedSkillCol = (focusedSkillCol + 1) % 5;
            renderHabitsUI();
            return;
        }

        if (key === "arrowup" || key === "k") {
            focusedSkillCol = (focusedSkillCol + 4) % 5;
            renderHabitsUI();
            return;
        }

        if (key === "arrowright" || key === "arrowleft") {

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



    if (
        (key === "h" || key === "l") &&
        !(focusPanel === "form" && formMode === "insert" && promptStep === 0)
    ) {
        if (focusPanel === "form" && formMode === "insert") {

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



    if (key === "escape") {

        if (showSkillsPanel) {
            if (typeof draftPurchasedCount !== 'undefined' && draftPurchasedCount !== null) {
                purchasedCount = draftPurchasedCount;
                activeChargesMemory = draftActiveCharges;
                draftPurchasedCount = null;
                draftActiveCharges = null;
            }
            showSkillsPanel = false;
            renderHabitsUI();
            return;
        }


        if (focusPanel === "form" && formMode === "insert") {
            if (promptStep > 0) {
                promptStep--;
                renderHabitsUI();
                return;
            }

            modus = "create";
            editHabitIndex = null;
            resetForm();
            focusPanel = "form";
            renderHabitsUI();
            return;
        }


        focusPanel = "form";
        formMode = "normal";
        promptStep = 0;
        renderHabitsUI();
        return;
    }




    if (focusPanel === "form") {

        if (formMode === "normal") {
            if (key === "i") {
                formMode = "insert";
                promptStep = 0;
                renderHabitsUI();
            }
            return;
        }


        handlePromptInput(e, key);
        return;
    }



    if (focusPanel === "list") {
        if ((key === "j" || key === "arrowdown") &&
            selectedHabitIndex < habits.length - 1) {

            selectedHabitIndex++;

            clampWeekToHabit();   // ⭐ FIX

            renderHabitsUI();
        }

        if ((key === "k" || key === "arrowup") &&
            selectedHabitIndex > 0) {

            selectedHabitIndex--;

            clampWeekToHabit();   // ⭐ FIX

            renderHabitsUI();
        }



        if (key === "d" && habits.length > 0) {
            modus = "delete";
            editHabitIndex = selectedHabitIndex;
            focusPanel = "form";
            formMode = "insert";
            renderHabitsUI();
            return;
        }


        if (key === "e" && habits.length > 0) {
            modus = "edit";
            editHabitIndex = selectedHabitIndex;


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
            promptStep = 0;
            renderHabitsUI();
            return;
        }
    }



    if (focusPanel === "calendar") {
        let habit = habits[selectedHabitIndex];
        if (!habit) return;



        if (habit.frequencyMode === "flex") {

            let times = habit.timesPerWeek ?? 3;
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



        let totalDays =
            habit.duration === 9999 ? 365 : habit.duration;

        let startDate =
            new Date(habit.startDate);


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



function handlePromptInput(e, key) {


    if (modus === "delete") {
        if (key === "enter") {
            deleteHabit();
        }
        return;
    }


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


    if (promptStep === 1) {

        let max = STAT_CATEGORIES.length - 1;

        if (key === "j" || key === "arrowdown") {
            categoryCursor = Math.min(max, categoryCursor + 1);
            category = STAT_CATEGORIES[categoryCursor];
            renderHabitsUI();
            return;
        }

        if (key === "k" || key === "arrowup") {
            categoryCursor = Math.max(0, categoryCursor - 1);
            category = STAT_CATEGORIES[categoryCursor];
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



    if (promptStep === 2) {

        let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


        if (key === "tab") {
            e.preventDefault();
            dayMode = dayMode === "fixed" ? "flex" : "fixed";
            renderHabitsUI();
            return;
        }



        if (dayMode === "fixed") {

            if (key === "j" || key === "arrowdown") {
                dayCursor = Math.min(6, dayCursor + 1);
                renderHabitsUI();
                return;
            }

            if (key === "k" || key === "arrowup") {
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



        if (dayMode === "flex") {

            if (key === "j" || key === "arrowdown") {
                timesPerWeekCursor = Math.min(6, timesPerWeekCursor + 1);
                timesPerWeek = timesPerWeekCursor + 1;
                renderHabitsUI();
                return;
            }

            if (key === "k" || key === "arrowup") {
                timesPerWeekCursor = Math.max(0, timesPerWeekCursor - 1);
                timesPerWeek = timesPerWeekCursor + 1;
                renderHabitsUI();
                return;
            }

            if (key === " ") {
                timesPerWeek = timesPerWeekCursor + 1;
                renderHabitsUI();
                return;
            }
        }


        if (key === "enter") {
            promptStep = 3;
            renderHabitsUI();
            return;
        }
    }



    if (promptStep === 3) {

        let opts = [7, 14, 35, 30, 9999];

        if (key === "j" || key === "arrowdown") {
            durationCursor = Math.min(4, durationCursor + 1);
            duration = opts[durationCursor];
            renderHabitsUI();
            return;
        }

        if (key === "k" || key === "arrowup") {
            durationCursor = Math.max(0, durationCursor - 1);
            duration = opts[durationCursor];
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
