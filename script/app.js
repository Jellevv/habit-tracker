function renderLayout() {
    let app = document.getElementById("app");

    app.innerHTML = `
<div class="layout">
    <div id="formPanel"></div>
    <div id="listPanel"></div>
    <div id="calendarPanel"></div>
    <div id="statsPanel" class="box panel"></div>
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
            `Naam: typen (ESC om te bewerken)${sep}Cat:1-4${sep}Dagen:1-7${sep}Duur:0-4${sep}` +
            common,

        list:
            `LIJST${sep}` +
            `J/K of ↑↓→selecteer${sep}` +
            `E→bewerk${sep}` +
            `D→verwijder${sep}` +
            common,

        calendar:
            `KALENDER${sep}` +
            `←→ / h l→dag navigeren${sep}` +
            `↑↓ / j k→week overslaan${sep}` +
            `SPATIE→afchecken${sep}` +
            common,
            
        stats:
            typeof showSkillsPanel !== 'undefined' && showSkillsPanel ?
            `SKILLS${sep}` +
            `↑↓→navigeer categorie${sep}` +
            `←→→kies active/passive${sep}` +
            `ENTER→unlock${sep}` +
            `S→terug naar stats${sep}` +
            common
            :
            `STATS${sep}` +
            `S→open skills panel${sep}` +
            common
    };

    panel.innerText = legend[focusPanel] ?? "";
}

renderLayout();
