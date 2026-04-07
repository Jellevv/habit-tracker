# Habit Tracker TUI

## Beschrijving
Dit is een interactieve **habit tracker** met een **Text-based User Interface (TUI)** in de browser.  
Gebouwd met **WebTUI** en **vanilla JavaScript**, geschikt als demo voor school.  

---

## Layout
De interface is verdeeld in drie kolommen:

1. **Formulier** – links: maken/bewerken van habits  
2. **Habit Lijst** – midden: alle habits selecteren, bewerken of verwijderen  
3. **Kalender** – rechts: kalenderweergave van de geselecteerde habit  

Onderaan staat een **hotkey bar** die alle beschikbare sneltoetsen toont.

---

## Functionaliteit

### Formulier (kolom 1)
- **Nieuwe habit aanmaken**: Naam, Categorie, Dagen, Duur  
- **Edit-mode**: Habit selecteren in kolom 2 → `E` → formulier verandert in bewerkmodus  
- **Delete-mode**: Habit selecteren in kolom 2 → `D` → bevestigingsbericht  
- **Navigatie**
  - TAB → cyclus: **Categorie → Dagen → Duur → Categorie**
  - ESC → springt naar **Naam veld** (typen toegestaan)  
- **Opslaan**
  - ENTER → slaat nieuwe of bewerkte habit op  
  - Na opslaan → focus blijft op **Categorie** (niet in typmodus)  
- **Annuleren**
  - ESC → annuleert edit/delete modus, terug naar create modus
## LET OP: Naam field is enkel bereibaar met ESC (anders kon je niet navigeren met HJKL want dan typ je)

### Habit Lijst (kolom 2)
- **Selectie**: J/K of ↑↓ → navigeer door lijst  
- **Edit**: E → bewerk geselecteerde habit  
- **Delete**: D → verwijder geselecteerde habit  
- **Focus**: geselecteerde habit wordt gemarkeerd  

### Kalender (kolom 3)
- **Weergave**: windowed full calendar van geselecteerde habit  
- **Navigatie**:
  - ← → of H/L → beweeg over toegestane dagen  
  - SPACE → toggle dag voltooid/niet voltooid  
- **Scroll hints**: geeft aan hoeveel weken eerder/later beschikbaar zijn  

---

## Sneltoetsen

| Panel      | Toetsen               | Actie                                      |
|-----------|----------------------|-------------------------------------------|
| Form      | TAB                  | Volgend veld (Categorie → Dagen → Duur)  |
|           | ENTER                | Opslaan van nieuwe/bewerkte habit        |
|           | ESC                  | Ga naar Naam veld / annuleer edit/delete |
|           | 1-3                  | Selecteer categorie                        |
|           | 1-7                  | Selecteer dagen                             |
|           | 0-4                  | Selecteer duur                              |
| List      | J/K of ↑↓             | Selecteer habit                            |
|           | E                    | Bewerk geselecteerde habit                 |
|           | D                    | Verwijder geselecteerde habit              |
| Calendar  | ← → of H/L            | Navigeer door dagen                        |
|           | SPACE                | Toggle voltooid/niet voltooid              |
| All       | H/L                  | Wissel tussen kolommen                      |
|           | ESC                  | Annuleer edit/delete of ga naar Naam veld  |

---

## Extra Functionaliteit
- **Automatische focus bij eerste load**: start in **Categorieveld**, niet in Naam veld  
- **Naam veld alleen via ESC**: voorkomt onbedoeld typen bij load  
- **Mode-aware**: Edit/Delete modus wordt automatisch herkend  
- **Visueel TUI-design**: focus-ringen, scroll hints, kleuren voor voltooid/niet voltooid  
- **Tab-cyclus**: blijft binnen formulier, nooit naar andere kolommen  

---


