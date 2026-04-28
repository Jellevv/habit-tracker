

let showSkillsPanel = false;
let focusedSkillCol = 0;
let focusedSkillRow = 0;

const SKILLS_DATA = {
  cols: ["Intelligence", "Physical", "Charisma", "Spirit", "Global"],
  Intelligence: {
    passive: {
      id: "int_p",
      name: "Scholar",
      cost: 1,
      desc: "+2 XP per Int. habit",
    },
    active: {
      id: "int_a",
      name: "Focus Boost",
      cost: 2,
      desc: "10x +100% Int. XP",
      charges: 10,
    },
  },
  Physical: {
    passive: {
      id: "phy_p",
      name: "Endurance",
      cost: 1,
      desc: "+2 XP per Phys. habit",
    },
    active: {
      id: "phy_a",
      name: "Adrenaline",
      cost: 2,
      desc: "10x +100% Phys. XP",
      charges: 10,
    },
  },
  Charisma: {
    passive: {
      id: "cha_p",
      name: "Charm",
      cost: 1,
      desc: "+2 XP per Cha. habit",
    },
    active: {
      id: "cha_a",
      name: "Inspire",
      cost: 2,
      desc: "10x +100% Cha. XP",
      charges: 10,
    },
  },
  Spirit: {
    passive: {
      id: "spi_p",
      name: "Zen",
      cost: 1,
      desc: "+2 XP per Spi. habit",
    },
    active: {
      id: "spi_a",
      name: "Enlighten",
      cost: 2,
      desc: "10x +100% Spi. XP",
      charges: 10,
    },
  },
  Global: {
    passive: {
      id: "glo_b",
      name: "Allrounder",
      cost: 3,
      desc: "+15% XP totaal bij LVL 5",
    },
  },
};

let purchasedCount = {};
let activeChargesUsed = {
  Intelligence: 0,
  Physical: 0,
  Charisma: 0,
  Spirit: 0,
};

let draftPurchasedCount = null;
let draftActiveCharges = null;

function getCounts() {
  return draftPurchasedCount || purchasedCount;
}
function getMemory() {
  return draftActiveCharges || activeChargesMemory;
}

function getSkillById(id) {
  for (let c of SKILLS_DATA.cols) {
    if (SKILLS_DATA[c].passive && SKILLS_DATA[c].passive.id === id)
      return SKILLS_DATA[c].passive;
    if (SKILLS_DATA[c].active && SKILLS_DATA[c].active.id === id)
      return SKILLS_DATA[c].active;
  }
  return null;
}



function getRawStatXP() {
  let xp = {};
  STAT_CATEGORIES.forEach((s) => (xp[s] = 0));
  habits.forEach((h) => {
    if (!STAT_CATEGORIES.includes(h.category)) return;
    let done = Object.values(h.completions).filter(Boolean).length;
    xp[h.category] += done * XP_PER_COMPLETION;
  });
  return xp;
}

function getTotalSP() {

  let xpMap = getRawStatXP();
  let overallXP = 0;
  STAT_CATEGORIES.forEach((s) => (overallXP += xpMap[s]));
  return Math.max(0, getLevel(overallXP) - 1);
}

function getSpentSP() {
  let spent = 0;
  let counts = getCounts();
  for (let id in counts) {
    let skill = getSkillById(id);
    if (skill) spent += counts[id] * skill.cost;
  }
  return spent;
}

function getAvailableSP() {
  return getTotalSP() - getSpentSP();
}

function getActiveCharges(cat) {
  let activeSkill = SKILLS_DATA[cat].active;
  if (!activeSkill) return 0;
  let purchaseTimes = purchasedCount[activeSkill.id] || 0;


  let usages = 0;
  habits.forEach((h) => {
    if (h.category === cat) {

    }
  });

  return 0;
}

let activeChargesMemory = {
  Intelligence: 0,
  Physical: 0,
  Charisma: 0,
  Spirit: 0,
};

function attemptBuyFocusedSkill() {
  let counts = getCounts();
  let memory = getMemory();

  let colName = SKILLS_DATA.cols[focusedSkillCol];
  let skill =
    focusedSkillRow === 0
      ? SKILLS_DATA[colName].passive
      : SKILLS_DATA[colName].active;
  if (!skill) return;

  let baseCount = purchasedCount[skill.id] || 0;
  let currentCount = counts[skill.id] || 0;

  if (currentCount > baseCount) {
    counts[skill.id]--;
    if (skill.charges) {
      memory[colName] -= skill.charges;
    }
    renderHabitsUI();
  } else {
    if (focusedSkillRow === 0 && currentCount >= 1) return;

    if (getAvailableSP() >= skill.cost) {
      counts[skill.id] = currentCount + 1;
      if (skill.charges) {
        memory[colName] += skill.charges;
      }
      renderHabitsUI();
    }
  }
}



function renderSkillsUI() {
  let totalSP = getTotalSP();
  let availSP = getAvailableSP();

  let html = `<span class="panel-title">Skill Tree</span>`;
  html += `<div class="skill-sp-header">
                <div>Beschikbare SP: <span style="color:#6adb6a;font-weight:bold">${availSP}</span></div>
                <div style="opacity:0.5;font-size:0.8rem">Totaal verdiend: ${totalSP} (1 SP per overall level)</div>
                <div style="opacity:0.5;font-size:0.8rem;margin-top:4px;">[S] Terug naar Stats  ·  [ENTER] Unlock / Buy</div>
             </div>`;

  html += `<div class="skill-trees-container">`;

  let counts = getCounts();
  let memory = getMemory();

  for (let c = 0; c < SKILLS_DATA.cols.length; c++) {
    let cat = SKILLS_DATA.cols[c];
    let color = STAT_COLORS[cat] || "#ffffff";

    html += `<div class="skill-row">`;
    html += `<div class="skill-cat-title" style="color:${color}">${cat.substring(0, 3).toUpperCase()}</div>`;


    let pNode = SKILLS_DATA[cat].passive;
    let isPUnl = counts[pNode.id] >= 1;
    let pFoc = focusedSkillCol === c && focusedSkillRow === 0 ? "focused" : "";
    let pCls = isPUnl ? "unlocked" : "locked";
    html += `<div class="skill-node ${pCls} ${pFoc}" style="border-color:${isPUnl ? color : ""}">`;
    html += `<div class="sn-name">${pNode.name}</div>`;
    html += `<div class="sn-desc">${pNode.desc} <span class="sn-cost">(${pNode.cost} SP)</span></div>`;
    html += `</div>`;


    let aNode = SKILLS_DATA[cat].active;
    if (aNode) {
      html += `<div class="skill-path ${isPUnl ? "unlocked" : ""}" style="background-color:${isPUnl ? color : ";"}"></div>`;
      let aFoc =
        focusedSkillCol === c && focusedSkillRow === 1 ? "focused" : "";
      let charges = memory[cat];
      let aCls = charges > 0 ? "active" : "locked";
      html += `<div class="skill-node ${aCls} ${aFoc}" style="border-color:${charges > 0 ? color : ""}">`;
      html += `<div class="sn-name">${aNode.name}</div>`;
      html += `<div class="sn-desc">${aNode.desc} <span class="sn-cost">(${aNode.cost} SP)</span></div>`;
      if (charges > 0) {
        html += `<div class="sn-charges">${charges} charges</div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
  }

  html += `</div>`;
  return html;
}
