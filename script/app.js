function renderLayout() {
    let app = document.getElementById("app");

    app.innerHTML = `
<div class="layout">
    <div id="formPanel"></div>
    <div id="listPanel"></div>
    <div id="calendarPanel"></div>
    <div id="hotkeysPanel" class="box hotkeys"></div>
</div>`;

    renderHabitsUI();
}

/* =====================
   HOTKEY LEGEND (single line per panel)
===================== */

function renderHotkeys() {
    let panel = document.getElementById("hotkeysPanel");

    const sep = "  │  ";

    let common = `H/L→panel${sep}ESC→form`;

    let legend = {
        form:
            `FORM${sep}` +
            `TAB→volgend veld${sep}` +
            `ENTER→opslaan${sep}` +
            `Naam: typen (ESC om te bewerken)${sep}Cat:1-3${sep}Dagen:1-7${sep}Duur:0-4${sep}` +
            common,

        list:
            `LIJST${sep}` +
            `J/K of ↑↓→selecteer${sep}` +
            `E→bewerk${sep}` +
            `D→verwijder${sep}` +
            common,

        calendar:
            `KALENDER${sep}` +
            `←→→dag navigeren${sep}` +
            `SPATIE→afchecken${sep}` +
            common,
    };

    panel.innerText = legend[focusPanel] ?? "";
}

renderLayout();
