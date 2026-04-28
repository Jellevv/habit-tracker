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

function renderHotkeys() {
    let panel = document.getElementById("hotkeysPanel");

    const sep = "  │  ";

    let common = `H/L→panel${sep}ESC→terug`;

    let formLegend;
    if (formMode === "insert") {
        formLegend =
            `FORM [INSERT]${sep}` +
            `ENTER→volgende stap${sep}` +
            `ESC→vorige stap / annuleer${sep}` +
            common;
    } else {
        formLegend =
            `FORM [NORMAL]${sep}` +
            `I→habit aanmaken${sep}` +
            common;
    }

    let legend = {
        form: formLegend,

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
            typeof showSkillsPanel !== 'undefined' && showSkillsPanel
                ? `SKILLS${sep}` +
                  `↑↓→navigeer categorie${sep}` +
                  `←→→passive / active${sep}` +
                  `ENTER→unlock / koop${sep}` +
                  `S→terug naar stats${sep}` +
                  common
                : `STATS${sep}` +
                  `S→open skill tree${sep}` +
                  common,
    };

    panel.innerText = legend[focusPanel] ?? "";
}

renderLayout();
