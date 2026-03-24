// =========================
// DATA
// =========================

let days = [
"Mon",
"Tue",
"Wed",
"Thu",
"Fri",
"Sat",
"Sun"
];

let habits = [];

let xp = 0;
let streak = 0;

let skills = {

Health: {
level: 1,
xp: 0
},

Productivity: {
level: 1,
xp: 0
},

Personal: {
level: 1,
xp: 0
}

};

// =========================
// ADD HABIT
// =========================

function addHabit() {

let name =
prompt("Habit name:");

if (!name) return;

let category =
prompt(
"Category: Health / Productivity / Personal"
);

if (!skills[category]) {

alert("Invalid category!");

return;

}

let habit = {

name: name,

category: category,

days: {}

};

days.forEach(day => {

habit.days[day] = false;

});

habits.push(habit);

renderHabits();

}

// =========================
// DELETE HABIT
// =========================

function deleteHabit(index) {

habits.splice(index, 1);

renderHabits();

}

// =========================
// TOGGLE DAY
// =========================

function toggleDay(index, day) {

let habit = habits[index];

habit.days[day] =
!habit.days[day];

if (habit.days[day]) {

completeHabit(index);

}

renderHabits();

}

// =========================
// COMPLETE HABIT
// =========================

function completeHabit(index) {

streak++;

let gainedXP =
calculateXP();

xp += gainedXP;

addSkillXP(
habits[index].category,
gainedXP
);

updateStats();

renderSkills();

}

// =========================
// XP SYSTEM
// =========================

function calculateXP() {

let baseXP = 10;

if (streak >= 50) {

return baseXP * 2;

}

if (streak >= 10) {

return baseXP * 1.5;

}

return baseXP;

}

// =========================
// SKILL XP
// =========================

function addSkillXP(category, gainedXP) {

skills[category].xp += gainedXP;

if (skills[category].xp >= 100) {

skills[category].level++;

skills[category].xp = 0;

alert(
category +
" leveled up! 🚀"
);

}

}

// =========================
// RENDER HABITS
// =========================

function renderHabits() {

let list =
document.getElementById("habitList");

list.innerHTML = "";

// Header row

let header =
document.createElement("li");

let headerDays = "";

days.forEach(day => {

headerDays += `
<span class="dayBox">
${day}
</span>
`;

});

header.innerHTML = `
<strong>Habit</strong>
<br>
${headerDays}
`;

list.appendChild(header);

// Habits

habits.forEach((habit, index) => {

let li =
document.createElement("li");

let dayBoxes = "";

days.forEach(day => {

let checked =
habit.days[day] ? "X" : " ";

dayBoxes += `

<span
class="dayBox box"
onclick="toggleDay(${index}, '${day}')">

[${checked}]

</span>

`;

});

li.innerHTML = `

<span class="habitName">

${habit.name}
(${habit.category})

</span>

${dayBoxes}

<br>

<button
class="button"
onclick="deleteHabit(${index})">

Delete

</button>

`;

list.appendChild(li);

});

}

// =========================
// STATS
// =========================

function updateStats() {

document.getElementById(
"xpDisplay"
).innerText =

"XP: " + xp;

document.getElementById(
"streakDisplay"
).innerText =

"Streak: " + streak + " 🔥";

}

// =========================
// RENDER SKILLS
// =========================

function renderSkills() {

document.getElementById(
"healthSkill"
).innerText =

"Health Level: " +
skills.Health.level +
" | XP: " +
skills.Health.xp;

document.getElementById(
"productivitySkill"
).innerText =

"Productivity Level: " +
skills.Productivity.level +
" | XP: " +
skills.Productivity.xp;

document.getElementById(
"personalSkill"
).innerText =

"Personal Level: " +
skills.Personal.level +
" | XP: " +
skills.Personal.xp;

}

// =========================
// STARTUP
// =========================

renderHabits();
renderSkills();
updateStats();
