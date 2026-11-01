# NutriTrack - Vanilla Calorie & Macro Tracker

NutriTrack is a lightweight, responsive, and fully client-side calorie and macronutrient tracking web application built entirely with vanilla **HTML5**, **CSS3**, and **JavaScript**.

No backend, no database setup, no frameworks (no Tailwind), and no CSS variables—everything runs straight in the browser using `localStorage` for offline persistence.

---

## ✨ Features

- **Daily Calorie Dashboard**:
  - Real-time SVG circular progress ring and progress bars.
  - Automatic status indicators (`On Track`, `Near Limit`, `Exceeded Target`).
  - Budget calculations (Consumed vs. Remaining).

- **Macronutrient Tracking**:
  - Track **Protein**, **Carbohydrates**, and **Fat** in grams and energy percentages (4 kcal/g for carbs & protein, 9 kcal/g for fat).
  - Target vs. consumed progress bars for each macro.

- **Meal-by-Meal Logging**:
  - Organized meal categories: **Breakfast**, **Lunch**, **Dinner**, and **Snacks**.
  - Add, edit, and delete food entries with serving sizes, calories, and macros.

- **⚡ Quick Add Presets**:
  - Instant one-click presets for common everyday foods (Boiled Egg, Chicken Breast, Banana, Oatmeal, Apple, etc.).

- **💧 Hydration Tracker**:
  - Interactive 250ml glass buttons and quick +/- controls with a daily target tracker.

- **📅 Date Navigator**:
  - Navigate effortlessly between previous and future days with individual per-day persistence.

- **📊 7-Day History Chart**:
  - Native HTML5 Canvas bar chart comparing 7-day intake against your calorie target.

- **⚙️ Settings & Data Backup**:
  - Customize daily calorie, macro, and water goals.
  - One-click **Export JSON** backup and **Import JSON** restore.
  - Reset / Clear data options.

---

## 🚀 Getting Started

No build tools, package managers, or local servers required!

1. Clone or download the repository:
   ```bash
   git clone https://github.com/marokelvin3/AI-Bootcamp_ADE.git
   ```
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 🛠️ Tech Stack

- **HTML5**: Semantic tags, modals, SVGs, and Canvas.
- **CSS3**: Pure vanilla CSS (clean card layout, Flexbox, Grid, zero custom variables/frameworks).
- **JavaScript (ES6+)**: Vanilla modular architecture, Canvas rendering, and `localStorage` API.

---

## 📄 License

MIT License. Free to use, modify, and distribute.

