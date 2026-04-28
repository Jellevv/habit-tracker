# Habit Tracker TUI

## Beschrijving
Dit is een interactieve **habit tracker** met een **Text-based User Interface (TUI)** in de browser.  
Gebouwd met **vanilla JavaScript**, geschikt als demo voor school.

---

## Layout
De interface is verdeeld in de volgende panelen:

1. **Formulier** (Linksboven): Een interactieve command-line achtige prompt voor het aanmaken, bewerken en verwijderen van habits.
2. **Habit Lijst** (Linksonder): Een lijst met al je gemaakte habits.
3. **Kalender** (Midden): Toont mini-weergaven van alle habits, of een gedetailleerde kalender van de geselecteerde habit als je focus hierop ligt.
4. **Stats & Skill Tree** (Rechts): Toont je huidige levels en XP per categorie. Kan gewisseld worden naar een **Skill Tree** met de `S` toets.
5. **Hotkey Legend** (Onderaan): Toont dynamisch welke toetsen je kunt gebruiken afhankelijk van het actieve paneel.

---

## Functionaliteit

### 1. Formulier (Aanmaken & Bewerken)
Het formulier werkt als een stap-voor-stap terminal prompt. Druk in normale modus op `I` om te starten.
- **Stap 0 (Naam)**: Typ de naam in en druk op ENTER.
- **Stap 1 (Categorie)**: Gebruik `J`/`K` om een stat categorie (Intelligence, Physical, Charisma, Spirit) te auto-selecteren en druk op ENTER.
- **Stap 2 (Frequentie)**: Druk op **TAB** om te wisselen tussen de twee modi:
  - **Flex Mode**: Kies hoe vaak per week je de habit wilt doen (auto-select via `J`/`K`, bevestig met ENTER).
  - **Fixed Mode**: Kies specifieke dagen in de week (`J`/`K` om te navigeren, **SPATIE** om een dag aan/uit te vinken, ENTER om te bevestigen).
- **Stap 3 (Duur)**: Gebruik `J`/`K` om de duur van de habit te kiezen (auto-select) en druk op ENTER.
- **Stap 4 (Bevestigen)**: Druk op ENTER om op te slaan.

*Op elk moment kun je op `ESC` drukken om een stap terug te gaan of het aanmaken te annuleren.*

### 2. Habit Lijst
- **Navigatie**: Gebruik `J`/`K` of ↑/↓ om door de lijst te scrollen.
- **Bewerken**: Druk op `E` om de geselecteerde habit te wijzigen.
- **Verwijderen**: Druk op `D` om de geselecteerde habit te verwijderen (bevestig in het formulier paneel).

### 3. Kalender
Wanneer dit paneel **geen** focus heeft, zie je compacte mini-kalenders van alle habits. Zodra je het paneel focus geeft (via `H`/`L`):
- Toont een gedetailleerde, scrollbare kalender voor de geselecteerde habit.
- **Navigatie**: 
  - `H`/`L` of ←/→ om door dagen in de week te navigeren.
  - `J`/`K` of ↑/↓ om door de weken heen te springen.
- **Afvinken**: Druk op **SPATIE** om een dag als voltooid (of niet voltooid) te markeren.

### 4. Stats & Skill Tree
**Stats Panel:**
- Elke voltooide habit geeft 10 XP aan de desbetreffende categorie.
- Je "Overall Level" stijgt op basis van je totale XP. Voor elk nieuw overall level verdien je **1 Skill Point (SP)**.

**Skill Tree Panel (Druk op `S`):**
- Met SP kun je passieve en actieve bonussen kopen.
- Navigeer met de pijltjestoetsen of `H/J/K/L`.
- Druk op **ENTER** om een skill te kopen of te upgraden.
- **Draft Systeem**: Zolang je in de Skill Tree zit, zijn je aankopen "drafts". Heb je een fout gemaakt? Druk nogmaals op ENTER op dezelfde skill om je aankoop te annuleren en je SP terug te krijgen.
- Je aankopen worden pas permanent opgeslagen en geactiveerd zodra je de Skill Tree verlaat door op `S` of `ESC` te drukken!

---

## Sneltoetsen (Globale Navigatie)

- **H / L**: Wissel van focus tussen de verschillende panelen (Form → List → Calendar → Stats).
- **ESC**: Ga uit bewerkmodus of sluit de Skill Tree.
- **S**: Open / sluit de Skill Tree (werkt op elk moment zolang je geen habit-naam aan het typen bent).

*Kijk altijd naar de balk onderaan het scherm voor contextuele sneltoetsen afhankelijk van waar je je bevindt!*
