/* =====================
   LOCAL STORAGE
   Persist habits, skills, and charges
===================== */

const STORAGE_KEY = "habitTracker_v1";

function saveToLocalStorage() {
    let data = {
        habits: habits,
        purchasedCount: purchasedCount,
        activeChargesMemory: activeChargesMemory,
        activeChargesUsed: activeChargesUsed,
        selectedHabitIndex: selectedHabitIndex
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        // silently fail if storage is full or unavailable
    }
}

function loadFromLocalStorage() {
    try {
        let raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        let data = JSON.parse(raw);

        if (Array.isArray(data.habits)) {
            // Restore Date objects (JSON serializes them as strings)
            data.habits.forEach(h => {
                if (h.startDate) h.startDate = new Date(h.startDate);
            });
            habits = data.habits;
        }

        if (data.purchasedCount) {
            purchasedCount = data.purchasedCount;
        }

        if (data.activeChargesMemory) {
            activeChargesMemory = data.activeChargesMemory;
        }

        if (data.activeChargesUsed) {
            activeChargesUsed = data.activeChargesUsed;
        }

        if (typeof data.selectedHabitIndex === "number") {
            selectedHabitIndex = Math.min(
                data.selectedHabitIndex,
                Math.max(0, habits.length - 1)
            );
        }

    } catch (e) {
        // corrupted data — start fresh
    }
}
