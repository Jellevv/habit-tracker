const assert = require("assert");

let habits = [];
const XP_PER_COMPLETION = 10;
const STAT_CATEGORIES = ["Intelligence", "Physical", "Charisma", "Spirit"];

// from skills.js
let SKILLS_DATA = {
    cols: ["Intelligence", "Physical", "Charisma", "Spirit", "Global"],
    Intelligence: { active: { id: "a", charges: 10, cost: 2 } }
};
let purchasedCount = {};
let activeChargesMemory = { Intelligence: 0, Physical: 0, Charisma: 0, Spirit: 0 };
let activeChargesUsed = { Intelligence: 0, Physical: 0, Charisma: 0, Spirit: 0 };

// from calendar.js
function toggleDay(habit, doneBefore) {
    let key = "day";
    let isCurrentlyDone = doneBefore;
    habit.completions[key] = !isCurrentlyDone;

    if (!isCurrentlyDone) {
        if (typeof activeChargesMemory !== 'undefined' && activeChargesMemory[habit.category] > 0) {
            activeChargesMemory[habit.category]--;
            activeChargesUsed[habit.category]++;
        }
    } else {
        if (typeof activeChargesUsed !== 'undefined' && activeChargesUsed[habit.category] > 0) {
            activeChargesUsed[habit.category]--;
            activeChargesMemory[habit.category]++;
        }
    }
}

// SIMULATION:
// User creates habit
let h = { category: "Intelligence", completions: {} };
habits.push(h);

// User buys booster
activeChargesMemory["Intelligence"] += 10;
purchasedCount["a"] = 1;

console.log("Before checking off:", activeChargesMemory["Intelligence"]);
toggleDay(h, undefined);
console.log("After checking off:", activeChargesMemory["Intelligence"]);
toggleDay(h, true);
console.log("After unchecking:", activeChargesMemory["Intelligence"]);

