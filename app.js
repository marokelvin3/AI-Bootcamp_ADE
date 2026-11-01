/**
 * NutriTrack - Pure Vanilla JavaScript Calorie Tracker
 * Persistent client-side storage with localStorage.
 */

(function () {
  'use strict';

  // --- STORAGE KEYS ---
  const SETTINGS_KEY = 'nutritrack_user_settings';
  const DATA_KEY = 'nutritrack_days_data';

  // --- DEFAULT SETTINGS ---
  const DEFAULT_SETTINGS = {
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 200,
    fatGoal: 65,
    waterGoal: 2000
  };

  // --- QUICK PRESETS ---
  const PRESET_FOODS = [
    { name: 'Boiled Egg', portion: '1 large', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, meal: 'breakfast' },
    { name: 'Banana', portion: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, meal: 'snack' },
    { name: 'Oatmeal & Milk', portion: '1 bowl', calories: 220, protein: 8, carbs: 38, fat: 4, meal: 'breakfast' },
    { name: 'Grilled Chicken Breast', portion: '150g', calories: 245, protein: 46, carbs: 0, fat: 5, meal: 'lunch' },
    { name: 'White Rice (Cooked)', portion: '1 cup (150g)', calories: 195, protein: 4, carbs: 43, fat: 0.5, meal: 'lunch' },
    { name: 'Mixed Greek Salad', portion: '1 bowl', calories: 180, protein: 5, carbs: 11, fat: 13, meal: 'dinner' },
    { name: 'Protein Shake (Whey)', portion: '1 scoop', calories: 130, protein: 25, carbs: 3, fat: 1.5, meal: 'snack' },
    { name: 'Medium Apple', portion: '1 fruit', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, meal: 'snack' },
    { name: 'Salmon Fillet', portion: '150g', calories: 310, protein: 34, carbs: 0, fat: 18, meal: 'dinner' },
    { name: 'Black Coffee / Tea', portion: '1 mug', calories: 5, protein: 0.3, carbs: 0.5, fat: 0, meal: 'breakfast' }
  ];

  // --- APPLICATION STATE ---
  let currentDate = getTodayDateString();
  let settings = loadSettings();
  let daysData = loadDaysData();

  // If brand new user, populate initial starter data for today so they see a working UI immediately
  initStarterDataIfEmpty();

  // --- DOM ELEMENTS ---
  const activeDatePicker = document.getElementById('active-date-picker');
  const dateLabel = document.getElementById('date-label');
  const prevDayBtn = document.getElementById('prev-day-btn');
  const nextDayBtn = document.getElementById('next-day-btn');
  const todayBtn = document.getElementById('today-btn');
  const quickAddBtn = document.getElementById('quick-add-btn');
  const openSettingsBtn = document.getElementById('open-settings-btn');

  // Calorie summary elements
  const calorieStatusPill = document.getElementById('calorie-status-pill');
  const calorieProgressRing = document.getElementById('calorie-progress-ring');
  const caloriesRemainingNumber = document.getElementById('calories-remaining-number');
  const caloriesRemainingLabel = document.getElementById('calories-remaining-label');
  const statGoalVal = document.getElementById('stat-goal-val');
  const statConsumedVal = document.getElementById('stat-consumed-val');
  const statRemainingVal = document.getElementById('stat-remaining-val');
  const barPctLabel = document.getElementById('bar-pct-label');
  const barConsumedLabel = document.getElementById('bar-consumed-label');
  const calorieProgressBar = document.getElementById('calorie-progress-bar');

  // Macro elements
  const macroProteinConsumed = document.getElementById('macro-protein-consumed');
  const macroProteinTarget = document.getElementById('macro-protein-target');
  const macroProteinBar = document.getElementById('macro-protein-bar');
  const macroProteinCal = document.getElementById('macro-protein-cal');
  const macroProteinPct = document.getElementById('macro-protein-pct');

  const macroCarbsConsumed = document.getElementById('macro-carbs-consumed');
  const macroCarbsTarget = document.getElementById('macro-carbs-target');
  const macroCarbsBar = document.getElementById('macro-carbs-bar');
  const macroCarbsCal = document.getElementById('macro-carbs-cal');
  const macroCarbsPct = document.getElementById('macro-carbs-pct');

  const macroFatConsumed = document.getElementById('macro-fat-consumed');
  const macroFatTarget = document.getElementById('macro-fat-target');
  const macroFatBar = document.getElementById('macro-fat-bar');
  const macroFatCal = document.getElementById('macro-fat-cal');
  const macroFatPct = document.getElementById('macro-fat-pct');

  // Water elements
  const waterStatLabel = document.getElementById('water-stat-label');
  const waterGlassesContainer = document.getElementById('water-glasses-container');
  const waterCurrentAmount = document.getElementById('water-current-amount');
  const waterMinusBtn = document.getElementById('water-minus-btn');
  const waterPlusBtn = document.getElementById('water-plus-btn');
  const waterProgressBar = document.getElementById('water-progress-bar');

  // Quick Presets
  const quickPresetsContainer = document.getElementById('quick-presets-container');

  // Meal item containers & sums
  const mealCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealContainers = {
    breakfast: document.getElementById('breakfast-items-list'),
    lunch: document.getElementById('lunch-items-list'),
    dinner: document.getElementById('dinner-items-list'),
    snack: document.getElementById('snack-items-list')
  };
  const mealSumLabels = {
    breakfast: document.getElementById('breakfast-calories-sum'),
    lunch: document.getElementById('lunch-calories-sum'),
    dinner: document.getElementById('dinner-calories-sum'),
    snack: document.getElementById('snack-calories-sum')
  };

  // Modals
  const foodModal = document.getElementById('food-modal');
  const foodForm = document.getElementById('food-form');
  const foodModalTitle = document.getElementById('food-modal-title');
  const closeFoodModalBtn = document.getElementById('close-food-modal');
  const cancelFoodModalBtn = document.getElementById('cancel-food-modal');

  const foodEditId = document.getElementById('food-edit-id');
  const foodMealSelect = document.getElementById('food-meal-select');
  const foodNameInput = document.getElementById('food-name-input');
  const foodPortionInput = document.getElementById('food-portion-input');
  const foodCaloriesInput = document.getElementById('food-calories-input');
  const foodProteinInput = document.getElementById('food-protein-input');
  const foodCarbsInput = document.getElementById('food-carbs-input');
  const foodFatInput = document.getElementById('food-fat-input');

  const settingsModal = document.getElementById('settings-modal');
  const settingsForm = document.getElementById('settings-form');
  const closeSettingsModalBtn = document.getElementById('close-settings-modal');
  const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
  const settingCalorieGoal = document.getElementById('setting-calorie-goal');
  const settingProteinGoal = document.getElementById('setting-protein-goal');
  const settingCarbsGoal = document.getElementById('setting-carbs-goal');
  const settingFatGoal = document.getElementById('setting-fat-goal');
  const settingWaterGoal = document.getElementById('setting-water-goal');
  const exportDataBtn = document.getElementById('export-data-btn');
  const importDataFile = document.getElementById('import-data-file');
  const clearAllDataBtn = document.getElementById('clear-all-data-btn');

  // Chart
  const weeklyChartCanvas = document.getElementById('weekly-chart');

  // Toast
  const toastElement = document.getElementById('toast');
  let toastTimer = null;

  // --- INITIALIZATION ---
  function init() {
    activeDatePicker.value = currentDate;
    setupEventListeners();
    renderQuickPresets();
    updateUI();
  }

  // --- STORAGE HELPERS ---
  function loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  function saveSettings(newSettings) {
    settings = newSettings;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }

  function loadDaysData() {
    try {
      const stored = localStorage.getItem(DATA_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load days data from localStorage', e);
    }
    return {};
  }

  function saveDaysData() {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(daysData));
    } catch (e) {
      console.error('Failed to save days data to localStorage', e);
    }
  }

  function getDayRecord(dateStr) {
    if (!daysData[dateStr]) {
      daysData[dateStr] = {
        water: 0,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        }
      };
    }
    // Ensure all meal buckets exist
    mealCategories.forEach(function (cat) {
      if (!daysData[dateStr].meals[cat]) {
        daysData[dateStr].meals[cat] = [];
      }
    });
    if (typeof daysData[dateStr].water !== 'number') {
      daysData[dateStr].water = 0;
    }
    return daysData[dateStr];
  }

  function initStarterDataIfEmpty() {
    // If no data exists at all in storage, provide sample meals for today
    if (Object.keys(daysData).length === 0) {
      const today = getTodayDateString();
      daysData[today] = {
        water: 750,
        meals: {
          breakfast: [
            { id: 'starter_1', name: 'Oatmeal & Berries', portion: '1 bowl', calories: 260, protein: 7, carbs: 46, fat: 4 },
            { id: 'starter_2', name: 'Boiled Egg', portion: '1 large', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 }
          ],
          lunch: [
            { id: 'starter_3', name: 'Grilled Chicken Breast', portion: '150g', calories: 245, protein: 46, carbs: 0, fat: 5 },
            { id: 'starter_4', name: 'Brown Rice', portion: '1 cup', calories: 215, protein: 5, carbs: 45, fat: 1.8 }
          ],
          dinner: [],
          snack: [
            { id: 'starter_5', name: 'Green Apple', portion: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 }
          ]
        }
      };
      saveDaysData();
    }
  }

  // --- DATE HELPERS ---
  function getTodayDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDateDisplay(dateStr) {
    const today = getTodayDateString();
    if (dateStr === today) {
      return 'Today';
    }

    // Check yesterday
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((d.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';

    // Format readable "Fri, Oct 31"
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  }

  function navigateDate(deltaDays) {
    const parts = currentDate.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + deltaDays);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    currentDate = `${y}-${m}-${day}`;
    activeDatePicker.value = currentDate;
    updateUI();
  }

  // --- UI RENDERING ---
  function updateUI() {
    const dayRecord = getDayRecord(currentDate);

    // Update Date Controls
    dateLabel.textContent = formatDateDisplay(currentDate);
    const isToday = currentDate === getTodayDateString();
    todayBtn.style.display = isToday ? 'none' : 'inline-flex';

    // Compute meal totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    mealCategories.forEach(function (cat) {
      const items = dayRecord.meals[cat] || [];
      let catCalories = 0;
      items.forEach(function (item) {
        catCalories += Number(item.calories) || 0;
        totalProtein += Number(item.protein) || 0;
        totalCarbs += Number(item.carbs) || 0;
        totalFat += Number(item.fat) || 0;
      });
      totalCalories += catCalories;
      mealSumLabels[cat].textContent = `${catCalories.toLocaleString()} kcal`;
      renderMealItems(cat, items);
    });

    // Render Calorie Summary
    renderCalorieSummary(totalCalories);

    // Render Macros Summary
    renderMacrosSummary(totalProtein, totalCarbs, totalFat);

    // Render Water Tracker
    renderWater(dayRecord.water || 0);

    // Render 7-day Canvas Chart
    renderWeeklyChart();
  }

  function renderCalorieSummary(consumed) {
    const goal = settings.calorieGoal;
    const remaining = goal - consumed;
    const pct = Math.round((consumed / goal) * 100);

    statGoalVal.textContent = `${goal.toLocaleString()} kcal`;
    statConsumedVal.textContent = `${consumed.toLocaleString()} kcal`;
    statRemainingVal.textContent = `${Math.abs(remaining).toLocaleString()} kcal`;

    barPctLabel.textContent = `${pct}% of daily budget`;
    barConsumedLabel.textContent = `${consumed.toLocaleString()} / ${goal.toLocaleString()} kcal`;

    // Linear progress bar
    const clampedPct = Math.min(100, Math.max(0, pct));
    calorieProgressBar.style.width = clampedPct + '%';

    // SVG Ring Progress (Circumference = 2 * PI * 58 ≈ 364.42)
    const circumference = 364.4;
    const progressOffset = Math.max(0, circumference - (Math.min(consumed, goal) / goal) * circumference);
    calorieProgressRing.style.strokeDashoffset = progressOffset;

    // Center display & status colors
    if (remaining >= 0) {
      caloriesRemainingNumber.textContent = remaining.toLocaleString();
      caloriesRemainingLabel.textContent = 'kcal left';
      caloriesRemainingNumber.style.color = '#0f172a';

      if (pct >= 90) {
        calorieStatusPill.className = 'pill pill-warning';
        calorieStatusPill.textContent = 'Near Limit';
        calorieProgressRing.style.stroke = '#f59e0b';
        calorieProgressBar.style.backgroundColor = '#f59e0b';
      } else {
        calorieStatusPill.className = 'pill pill-success';
        calorieStatusPill.textContent = 'On Track';
        calorieProgressRing.style.stroke = '#10b981';
        calorieProgressBar.style.backgroundColor = '#10b981';
      }
    } else {
      const overBy = Math.abs(remaining);
      caloriesRemainingNumber.textContent = `+${overBy.toLocaleString()}`;
      caloriesRemainingLabel.textContent = 'kcal over budget';
      caloriesRemainingNumber.style.color = '#ef4444';

      calorieStatusPill.className = 'pill pill-danger';
      calorieStatusPill.textContent = 'Exceeded Target';
      calorieProgressRing.style.stroke = '#ef4444';
      calorieProgressBar.style.backgroundColor = '#ef4444';
    }
  }

  function renderMacrosSummary(p, c, f) {
    const pRounded = Math.round(p * 10) / 10;
    const cRounded = Math.round(c * 10) / 10;
    const fRounded = Math.round(f * 10) / 10;

    macroProteinConsumed.textContent = `${pRounded}g`;
    macroProteinTarget.textContent = `${settings.proteinGoal}g`;
    const pPct = Math.min(100, Math.round((p / (settings.proteinGoal || 1)) * 100));
    macroProteinBar.style.width = `${pPct}%`;
    const pCal = Math.round(p * 4);
    macroProteinCal.textContent = `${pCal} kcal`;

    macroCarbsConsumed.textContent = `${cRounded}g`;
    macroCarbsTarget.textContent = `${settings.carbsGoal}g`;
    const cPct = Math.min(100, Math.round((c / (settings.carbsGoal || 1)) * 100));
    macroCarbsBar.style.width = `${cPct}%`;
    const cCal = Math.round(c * 4);
    macroCarbsCal.textContent = `${cCal} kcal`;

    macroFatConsumed.textContent = `${fRounded}g`;
    macroFatTarget.textContent = `${settings.fatGoal}g`;
    const fPct = Math.min(100, Math.round((f / (settings.fatGoal || 1)) * 100));
    macroFatBar.style.width = `${fPct}%`;
    const fCal = Math.round(f * 9);
    macroFatCal.textContent = `${fCal} kcal`;

    // Calculate Macro Energy Split %
    const totalMacroCal = pCal + cCal + fCal;
    if (totalMacroCal > 0) {
      macroProteinPct.textContent = `(${Math.round((pCal / totalMacroCal) * 100)}%)`;
      macroCarbsPct.textContent = `(${Math.round((cCal / totalMacroCal) * 100)}%)`;
      macroFatPct.textContent = `(${Math.round((fCal / totalMacroCal) * 100)}%)`;
    } else {
      macroProteinPct.textContent = '(0%)';
      macroCarbsPct.textContent = '(0%)';
      macroFatPct.textContent = '(0%)';
    }
  }

  function renderWater(currentWater) {
    const goal = settings.waterGoal || 2000;
    waterStatLabel.textContent = `${currentWater.toLocaleString()} / ${goal.toLocaleString()} ml`;
    waterCurrentAmount.textContent = `${currentWater.toLocaleString()} ml`;

    const pct = Math.min(100, Math.round((currentWater / goal) * 100));
    waterProgressBar.style.width = `${pct}%`;

    // 8 interactive glasses grid (each represents 250ml)
    const glassCount = Math.max(8, Math.ceil(goal / 250));
    waterGlassesContainer.innerHTML = '';

    for (let i = 1; i <= glassCount; i++) {
      const glassCap = i * 250;
      const isActive = currentWater >= glassCap;
      const glassBtn = document.createElement('button');
      glassBtn.type = 'button';
      glassBtn.className = 'water-glass-btn' + (isActive ? ' active' : '');
      glassBtn.title = `${glassCap} ml`;
      glassBtn.innerHTML = `
        <span class="water-glass-icon">${isActive ? '💧' : '🥛'}</span>
        <span class="water-glass-label">${glassCap}ml</span>
      `;

      glassBtn.addEventListener('click', function () {
        setWaterAmount(glassCap);
      });
      waterGlassesContainer.appendChild(glassBtn);
    }
  }

  function setWaterAmount(newAmount) {
    const dayRecord = getDayRecord(currentDate);
    dayRecord.water = Math.max(0, newAmount);
    saveDaysData();
    updateUI();
  }

  function renderMealItems(mealCategory, items) {
    const container = mealContainers[mealCategory];
    container.innerHTML = '';

    if (!items || items.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-meal-state';
      emptyDiv.textContent = `No items logged for ${mealCategory} yet.`;
      container.appendChild(emptyDiv);
      return;
    }

    items.forEach(function (item) {
      const row = document.createElement('div');
      row.className = 'meal-item-row';

      const left = document.createElement('div');
      left.className = 'item-left';

      const title = document.createElement('div');
      title.className = 'item-title';
      title.textContent = item.name;

      const details = document.createElement('div');
      details.className = 'item-details';

      if (item.portion) {
        const portionSpan = document.createElement('span');
        portionSpan.textContent = item.portion;
        details.appendChild(portionSpan);
      }

      if (Number(item.protein) > 0) {
        const pTag = document.createElement('span');
        pTag.className = 'item-macro-tag';
        pTag.style.color = '#8b5cf6';
        pTag.textContent = `P: ${item.protein}g`;
        details.appendChild(pTag);
      }

      if (Number(item.carbs) > 0) {
        const cTag = document.createElement('span');
        cTag.className = 'item-macro-tag';
        cTag.style.color = '#f59e0b';
        cTag.textContent = `C: ${item.carbs}g`;
        details.appendChild(cTag);
      }

      if (Number(item.fat) > 0) {
        const fTag = document.createElement('span');
        fTag.className = 'item-macro-tag';
        fTag.style.color = '#ec4899';
        fTag.textContent = `F: ${item.fat}g`;
        details.appendChild(fTag);
      }

      left.appendChild(title);
      left.appendChild(details);

      const right = document.createElement('div');
      right.className = 'item-right';

      const calBadge = document.createElement('div');
      calBadge.className = 'item-calories-badge';
      calBadge.innerHTML = `${Number(item.calories).toLocaleString()} <small>kcal</small>`;

      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-item-action';
      editBtn.title = 'Edit item';
      editBtn.innerHTML = '✏️';
      editBtn.addEventListener('click', function () {
        openEditFoodModal(mealCategory, item);
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-item-action btn-item-delete';
      delBtn.title = 'Delete item';
      delBtn.innerHTML = '🗑️';
      delBtn.addEventListener('click', function () {
        deleteFoodItem(mealCategory, item.id);
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      right.appendChild(calBadge);
      right.appendChild(actions);

      row.appendChild(left);
      row.appendChild(right);
      container.appendChild(row);
    });
  }

  function renderQuickPresets() {
    quickPresetsContainer.innerHTML = '';
    PRESET_FOODS.forEach(function (preset) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.innerHTML = `
        <span>${preset.name}</span>
        <span class="chip-cal">${preset.calories} kcal</span>
      `;
      chip.addEventListener('click', function () {
        openAddFoodModalWithPreset(preset);
      });
      quickPresetsContainer.appendChild(chip);
    });
  }

  // --- 7-DAY HISTORY CHART (HTML5 CANVAS) ---
  function renderWeeklyChart() {
    if (!weeklyChartCanvas) return;
    const ctx = weeklyChartCanvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp drawing
    const dpr = window.devicePixelRatio || 1;
    const rect = weeklyChartCanvas.getBoundingClientRect();
    const width = rect.width || 750;
    const height = 220;

    weeklyChartCanvas.width = width * dpr;
    weeklyChartCanvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Build 7 consecutive days array ending at currentDate
    const pastDays = [];
    const parts = currentDate.split('-');
    const baseDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

    for (let i = 6; i >= 0; i--) {
      const tempDate = new Date(baseDate);
      tempDate.setDate(baseDate.getDate() - i);
      const y = tempDate.getFullYear();
      const m = String(tempDate.getMonth() + 1).padStart(2, '0');
      const d = String(tempDate.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${d}`;

      // Sum calories for this date
      let cals = 0;
      if (daysData[dateKey] && daysData[dateKey].meals) {
        mealCategories.forEach(function (cat) {
          const list = daysData[dateKey].meals[cat] || [];
          list.forEach(function (item) {
            cals += Number(item.calories) || 0;
          });
        });
      }

      const dayLabel = tempDate.toLocaleDateString(undefined, { weekday: 'short' });
      const dateNum = tempDate.getDate();
      pastDays.push({
        dateStr: dateKey,
        label: `${dayLabel} ${dateNum}`,
        calories: cals,
        isCurrent: dateKey === currentDate
      });
    }

    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const targetCal = settings.calorieGoal || 2000;
    const maxDayCal = Math.max.apply(Math, pastDays.map(function (d) { return d.calories; }));
    const maxVal = Math.max(targetCal * 1.25, maxDayCal * 1.15, 2500);

    // Draw horizontal grid lines & labels
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    const gridSteps = 4;
    for (let s = 0; s <= gridSteps; s++) {
      const val = Math.round((maxVal / gridSteps) * s);
      const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      ctx.fillText(val.toString(), paddingLeft - 8, y + 4);
    }

    // Draw target line (dashed red)
    const targetY = paddingTop + chartHeight - (targetCal / maxVal) * chartHeight;
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(paddingLeft, targetY);
    ctx.lineTo(width - paddingRight, targetY);
    ctx.stroke();
    ctx.restore();

    // Target label
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Target: ${targetCal}`, width - paddingRight, targetY - 4);

    // Draw vertical bars
    const barCount = pastDays.length;
    const slotWidth = chartWidth / barCount;
    const barWidth = Math.min(38, slotWidth * 0.55);

    pastDays.forEach(function (day, index) {
      const xCenter = paddingLeft + (index * slotWidth) + (slotWidth / 2);
      const barHeight = (day.calories / maxVal) * chartHeight;
      const barX = xCenter - (barWidth / 2);
      const barY = paddingTop + chartHeight - barHeight;

      // Color choice: emerald green normally; red if exceeded; slightly muted if 0
      let barColor = '#10b981';
      if (day.calories > targetCal) {
        barColor = '#ef4444';
      } else if (day.calories === 0) {
        barColor = '#e2e8f0';
      }

      // Bar body with rounded top
      ctx.fillStyle = barColor;
      drawRoundedBar(ctx, barX, barY, barWidth, barHeight, 5);

      // Value label on top of bar
      if (day.calories > 0) {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(day.calories.toString(), xCenter, Math.max(paddingTop + 12, barY - 6));
      }

      // Day label below axis
      ctx.fillStyle = day.isCurrent ? '#10b981' : '#64748b';
      ctx.font = day.isCurrent ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day.label, xCenter, height - paddingBottom + 18);

      if (day.isCurrent) {
        // Underline current active day
        ctx.fillStyle = '#10b981';
        ctx.fillRect(xCenter - 14, height - paddingBottom + 22, 28, 2);
      }
    });
  }

  function drawRoundedBar(ctx, x, y, width, height, radius) {
    if (height < 2) return;
    const r = Math.min(radius, height / 2, width / 2);
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
  }

  // --- ACTIONS & MODALS ---
  function openAddFoodModal(mealCategory) {
    foodForm.reset();
    foodEditId.value = '';
    foodModalTitle.textContent = 'Log Food Entry';
    if (mealCategory) {
      foodMealSelect.value = mealCategory;
    } else {
      foodMealSelect.value = guessCurrentMeal();
    }
    foodModal.style.display = 'flex';
    foodNameInput.focus();
  }

  function openAddFoodModalWithPreset(preset) {
    foodForm.reset();
    foodEditId.value = '';
    foodModalTitle.textContent = `Log ${preset.name}`;
    foodMealSelect.value = preset.meal || guessCurrentMeal();
    foodNameInput.value = preset.name;
    foodPortionInput.value = preset.portion || '';
    foodCaloriesInput.value = preset.calories;
    foodProteinInput.value = preset.protein !== undefined ? preset.protein : '';
    foodCarbsInput.value = preset.carbs !== undefined ? preset.carbs : '';
    foodFatInput.value = preset.fat !== undefined ? preset.fat : '';

    foodModal.style.display = 'flex';
    foodCaloriesInput.focus();
  }

  function openEditFoodModal(mealCategory, item) {
    foodForm.reset();
    foodEditId.value = item.id;
    foodModalTitle.textContent = 'Edit Food Entry';
    foodMealSelect.value = mealCategory;
    foodNameInput.value = item.name;
    foodPortionInput.value = item.portion || '';
    foodCaloriesInput.value = item.calories;
    foodProteinInput.value = item.protein !== undefined ? item.protein : '';
    foodCarbsInput.value = item.carbs !== undefined ? item.carbs : '';
    foodFatInput.value = item.fat !== undefined ? item.fat : '';

    foodModal.style.display = 'flex';
    foodNameInput.focus();
  }

  function closeFoodModal() {
    foodModal.style.display = 'none';
  }

  function saveFoodEntry(e) {
    e.preventDefault();
    const name = foodNameInput.value.trim();
    const calories = Number(foodCaloriesInput.value);
    const category = foodMealSelect.value;
    const portion = foodPortionInput.value.trim();
    const protein = foodProteinInput.value ? Number(foodProteinInput.value) : 0;
    const carbs = foodCarbsInput.value ? Number(foodCarbsInput.value) : 0;
    const fat = foodFatInput.value ? Number(foodFatInput.value) : 0;
    const editId = foodEditId.value;

    if (!name || isNaN(calories) || calories < 0) {
      showToast('Please provide a valid food name and calories.');
      return;
    }

    const dayRecord = getDayRecord(currentDate);

    if (editId) {
      // Find item in existing meals and replace or move
      let found = false;
      mealCategories.forEach(function (cat) {
        const index = dayRecord.meals[cat].findIndex(function (i) { return i.id === editId; });
        if (index > -1) {
          if (cat === category) {
            // Updated in same category
            dayRecord.meals[cat][index] = {
              id: editId,
              name: name,
              portion: portion,
              calories: calories,
              protein: protein,
              carbs: carbs,
              fat: fat
            };
          } else {
            // Category changed
            dayRecord.meals[cat].splice(index, 1);
            dayRecord.meals[category].push({
              id: editId,
              name: name,
              portion: portion,
              calories: calories,
              protein: protein,
              carbs: carbs,
              fat: fat
            });
          }
          found = true;
        }
      });
      if (!found) {
        // Fallback
        dayRecord.meals[category].push({
          id: editId,
          name: name,
          portion: portion,
          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat
        });
      }
      showToast(`Updated "${name}"`);
    } else {
      // New item
      const newItem = {
        id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: name,
        portion: portion,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat
      };
      dayRecord.meals[category].push(newItem);
      showToast(`Added "${name}" (${calories} kcal)`);
    }

    saveDaysData();
    closeFoodModal();
    updateUI();
  }

  function deleteFoodItem(mealCategory, itemId) {
    const dayRecord = getDayRecord(currentDate);
    const list = dayRecord.meals[mealCategory];
    const index = list.findIndex(function (i) { return i.id === itemId; });
    if (index > -1) {
      const removed = list.splice(index, 1)[0];
      saveDaysData();
      updateUI();
      showToast(`Removed "${removed.name}"`);
    }
  }

  function guessCurrentMeal() {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 21) return 'dinner';
    return 'snack';
  }

  // --- SETTINGS MODAL ---
  function openSettings() {
    settingCalorieGoal.value = settings.calorieGoal;
    settingProteinGoal.value = settings.proteinGoal;
    settingCarbsGoal.value = settings.carbsGoal;
    settingFatGoal.value = settings.fatGoal;
    settingWaterGoal.value = settings.waterGoal;
    settingsModal.style.display = 'flex';
  }

  function closeSettings() {
    settingsModal.style.display = 'none';
  }

  function saveSettingsHandler(e) {
    e.preventDefault();
    const newSettings = {
      calorieGoal: Number(settingCalorieGoal.value) || 2000,
      proteinGoal: Number(settingProteinGoal.value) || 150,
      carbsGoal: Number(settingCarbsGoal.value) || 200,
      fatGoal: Number(settingFatGoal.value) || 65,
      waterGoal: Number(settingWaterGoal.value) || 2000
    };
    saveSettings(newSettings);
    closeSettings();
    updateUI();
    showToast('Settings saved successfully!');
  }

  function exportData() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: settings,
      daysData: daysData
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritrack_backup_${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.settings) {
          saveSettings(Object.assign({}, DEFAULT_SETTINGS, parsed.settings));
        }
        if (parsed.daysData && typeof parsed.daysData === 'object') {
          daysData = parsed.daysData;
          saveDaysData();
        }
        closeSettings();
        updateUI();
        showToast('Data imported successfully!');
      } catch (err) {
        alert('Invalid JSON file format. Import failed.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function clearAllData() {
    if (confirm('Are you sure you want to delete all logged meals and reset your tracker? This cannot be undone.')) {
      daysData = {};
      saveDaysData();
      closeSettings();
      updateUI();
      showToast('All log data has been wiped.');
    }
  }

  // --- TOAST NOTIFICATION ---
  function showToast(message) {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastElement.textContent = message;
    toastElement.style.display = 'block';
    toastTimer = setTimeout(function () {
      toastElement.style.display = 'none';
      toastTimer = null;
    }, 2800);
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Date buttons
    prevDayBtn.addEventListener('click', function () { navigateDate(-1); });
    nextDayBtn.addEventListener('click', function () { navigateDate(1); });
    todayBtn.addEventListener('click', function () {
      currentDate = getTodayDateString();
      activeDatePicker.value = currentDate;
      updateUI();
    });

    activeDatePicker.addEventListener('change', function () {
      if (activeDatePicker.value) {
        currentDate = activeDatePicker.value;
        updateUI();
      }
    });

    // Header buttons
    quickAddBtn.addEventListener('click', function () {
      openAddFoodModal(guessCurrentMeal());
    });
    openSettingsBtn.addEventListener('click', openSettings);

    // Meal card "+ Add Food" buttons
    document.querySelectorAll('.add-meal-item-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const meal = btn.getAttribute('data-meal');
        openAddFoodModal(meal);
      });
    });

    // Water quick buttons
    waterMinusBtn.addEventListener('click', function () {
      const dayRecord = getDayRecord(currentDate);
      setWaterAmount(Math.max(0, (dayRecord.water || 0) - 250));
    });
    waterPlusBtn.addEventListener('click', function () {
      const dayRecord = getDayRecord(currentDate);
      setWaterAmount((dayRecord.water || 0) + 250);
    });

    // Food Modal
    closeFoodModalBtn.addEventListener('click', closeFoodModal);
    cancelFoodModalBtn.addEventListener('click', closeFoodModal);
    foodForm.addEventListener('submit', saveFoodEntry);
    foodModal.addEventListener('click', function (e) {
      if (e.target === foodModal) closeFoodModal();
    });

    // Settings Modal
    closeSettingsModalBtn.addEventListener('click', closeSettings);
    cancelSettingsBtn.addEventListener('click', closeSettings);
    settingsForm.addEventListener('submit', saveSettingsHandler);
    exportDataBtn.addEventListener('click', exportData);
    importDataFile.addEventListener('change', importData);
    clearAllDataBtn.addEventListener('click', clearAllData);
    settingsModal.addEventListener('click', function (e) {
      if (e.target === settingsModal) closeSettings();
    });

    // Keyboard escape to close modals
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeFoodModal();
        closeSettings();
      }
    });

    // Resize listener for Canvas responsiveness
    window.addEventListener('resize', function () {
      renderWeeklyChart();
    });
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();