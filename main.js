const state = {
  month: 1,
  cash: 100000,
  income: 25000,
  gpu: {
    owned: 8,
    capacity: 8
  },
  employees: [],
  candidatePool: [],
  models: [],
  competitors: [],
  evaluationLog: [],
  monthlyLog: []
};

const departments = ["基础模型", "产品应用", "推理效率", "安全对齐"];
const strategies = {
  "高质量指令微调": 12,
  "对齐优先": 9,
  "长上下文": 8,
  "多模态增强": 10
};
const architectures = {
  "Transformer": 10,
  "Mixture-of-Experts": 13,
  "RNN 混合": 7,
  "稀疏注意力": 11
};

const competitorNames = [
  "凌霄智能",
  "星火模型实验室",
  "深蓝对齐研究所",
  "极光认知",
  "博思未来"
];

const modelsNamePool = [
  "Nebula",
  "Aurora",
  "Helios",
  "Atlas",
  "Mirage",
  "Swan",
  "Nova",
  "Quasar"
];

const employeeNamePool = [
  "林泽",
  "程曦",
  "王语",
  "刘野",
  "杨若",
  "李舟",
  "张温",
  "苏澜",
  "郁白",
  "沈季",
  "魏璃",
  "姜初",
  "卢意",
  "陆峻",
  "贺栎",
  "秦沐",
  "丁睿"
];

function init() {
  state.candidatePool = generateCandidates(6);
  state.competitors = generateCompetitors();
  renderAll();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);

function bindEvents() {
  document.getElementById("refresh-candidates").addEventListener("click", () => {
    if (!spend(5000, "刷新人才市场")) return;
    state.candidatePool = generateCandidates(6);
    renderCandidates();
  });

  document.getElementById("training-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("model-name").value.trim();
    if (!name) return;
    const benchmark = document.getElementById("model-benchmark").value;
    const strategy = document.getElementById("model-strategy").value;
    const arch = document.getElementById("model-arch").value;
    const duration = Math.max(1, Number(document.getElementById("model-duration").value));

    const cost = duration * 12000 + strategies[strategy] * 1000 + architectures[arch] * 1500;
    if (!spend(cost, `安排 ${name} 模型训练`)) return;

    const neededGpu = Math.min(duration * 2, 12);
    if (state.gpu.owned < neededGpu) {
      pushMonthlyLog(`⚠️ GPU 不足，${name} 训练速度下降。`);
    }

    state.models.push({
      id: crypto.randomUUID(),
      name,
      benchmark,
      strategy,
      arch,
      remaining: duration,
      progress: 0,
      quality: 0,
      publicScore: null,
      privateScore: null,
      status: "训练中"
    });

    document.getElementById("training-form").reset();
    document.getElementById("model-duration").value = 3;
    renderModels();
  });

  document.getElementById("buy-gpu").addEventListener("click", () => {
    if (!spend(50000, "采购 GPU")) return;
    state.gpu.owned += 8;
    state.gpu.capacity = Math.max(state.gpu.capacity, state.gpu.owned);
    pushMonthlyLog("✅ 成功采购 8 张 GPU，训练吞吐提升。");
    renderStats();
  });

  document.getElementById("upgrade-cluster").addEventListener("click", () => {
    if (!spend(35000, "扩展算力上限")) return;
    state.gpu.capacity += 16;
    pushMonthlyLog("✅ 算力机房扩容完成，未来可容纳更多 GPU。");
    renderStats();
  });

  document.getElementById("public-eval").addEventListener("click", () => runEvaluation(false));
  document.getElementById("private-eval").addEventListener("click", () => runEvaluation(true));
  document.getElementById("next-month").addEventListener("click", nextMonth);
}

function renderAll() {
  renderStats();
  renderCandidates();
  renderEmployees();
  renderModels();
  renderCompetitors();
  renderLogs();
}

function renderStats() {
  document.getElementById("stat-month").textContent = `第 ${state.month} 月`;
  document.getElementById("stat-cash").textContent = `现金：¥${formatNumber(state.cash)}`;
  document.getElementById("stat-income").textContent = `月收入：¥${formatNumber(state.income)}`;
  document.getElementById("stat-gpu").textContent = `GPU：${state.gpu.owned} / ${state.gpu.capacity} 张`;
}

function renderCandidates() {
  const container = document.getElementById("candidate-list");
  container.innerHTML = "";
  state.candidatePool.forEach((candidate) => {
    const card = document.createElement("div");
    card.className = "card";
    const deptTags = candidate.strengths.map((dept) => `<span class="tag">${dept}</span>`).join(" ");
    card.innerHTML = `
      <strong>${candidate.name}</strong>
      <div>${deptTags}</div>
      <div>期望薪资：¥${formatNumber(candidate.expectedSalary)}</div>
      <div>潜力：${candidate.potential.toFixed(1)} / 10</div>
      <div class="salary-input">
        <input type="number" min="5000" step="1000" value="${candidate.offer || candidate.expectedSalary}" data-id="${candidate.id}" />
        <button class="primary" data-id="${candidate.id}">雇佣</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => {
      const salaryInput = card.querySelector("input");
      const offerSalary = Number(salaryInput.value);
      hireCandidate(candidate.id, offerSalary);
    });
    container.appendChild(card);
  });
}

function renderEmployees() {
  const container = document.getElementById("employee-list");
  container.innerHTML = "";
  if (state.employees.length === 0) {
    container.innerHTML = "<p>暂无员工，快去人才市场招募吧！</p>";
    return;
  }

  state.employees.forEach((employee) => {
    const card = document.createElement("div");
    card.className = "card";
    const moraleTag = `<span class="tag ${employee.morale > 65 ? "success" : employee.morale < 40 ? "warning" : ""}">士气 ${employee.morale.toFixed(0)}</span>`;
    const performance = employee.performance.toFixed(1);
    card.innerHTML = `
      <strong>${employee.name}</strong>
      <div>${moraleTag}</div>
      <div>部门：
        <select data-action="department" data-id="${employee.id}">
          ${departments.map((dept) => `<option value="${dept}" ${dept === employee.department ? "selected" : ""}>${dept}</option>`).join("")}
        </select>
      </div>
      <div>当前工资：¥${formatNumber(employee.salary)}</div>
      <div class="salary-input">
        <input type="number" min="5000" step="1000" value="${employee.salary}" data-action="salary" data-id="${employee.id}" />
        <button class="secondary" data-action="adjust" data-id="${employee.id}">调整工资</button>
      </div>
      <div>绩效贡献：${performance}</div>
      <button class="secondary" data-action="fire" data-id="${employee.id}">裁员</button>
    `;

    card.querySelectorAll("select, input, button").forEach((element) => {
      element.addEventListener("change", handleEmployeeAction);
      element.addEventListener("click", handleEmployeeAction);
    });

    container.appendChild(card);
  });
}

function renderModels() {
  const container = document.getElementById("model-list");
  container.innerHTML = "";
  if (state.models.length === 0) {
    container.innerHTML = "<p>暂无训练中的模型。安排一个新的训练任务吧！</p>";
    return;
  }

  state.models.forEach((model) => {
    const card = document.createElement("div");
    card.className = "card";
    const progress = ((model.progress / Math.max(model.progress + model.remaining, 1)) * 100).toFixed(0);
    const infoLines = [
      `<strong>${model.name}</strong>`,
      `<div><span class="tag">${model.benchmark}</span><span class="tag">${model.strategy}</span></div>`,
      `<div>架构：${model.arch}</div>`,
      `<div>状态：${model.status}</div>`,
      `<div>进度：${progress}%</div>`
    ];

    if (model.publicScore !== null) {
      infoLines.push(`<div>公开集：${model.publicScore.toFixed(1)}</div>`);
    }
    if (model.privateScore !== null) {
      infoLines.push(`<div>私有集：${model.privateScore.toFixed(1)}</div>`);
    }

    if (model.status === "待发布") {
      infoLines.push(`<div class="actions">
        <button class="primary" data-action="launch" data-id="${model.id}">立即发布</button>
        <button class="secondary" data-action="continue" data-id="${model.id}">继续训练</button>
        <button class="secondary" data-action="scrap" data-id="${model.id}">重新开始</button>
      </div>`);
    }

    card.innerHTML = infoLines.join("");

    card.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", handleModelAction);
    });

    container.appendChild(card);
  });
}

function renderCompetitors() {
  const container = document.getElementById("competitor-list");
  container.innerHTML = "";
  state.competitors.forEach((competitor) => {
    const card = document.createElement("div");
    card.className = "card";
    const scoreLines = Object.entries(competitor.privateScores)
      .map(([bench, score]) => `<div>${bench}：${score.toFixed(1)}</div>`)
      .join("");

    card.innerHTML = `
      <strong>${competitor.name}</strong>
      <div>市场热度：${competitor.hype.toFixed(0)}</div>
      ${scoreLines}
    `;

    container.appendChild(card);
  });
}

function renderLogs() {
  const evaluationContainer = document.getElementById("evaluation-log");
  const monthlyContainer = document.getElementById("monthly-log");

  evaluationContainer.innerHTML = state.evaluationLog
    .slice(-20)
    .map((entry) => `<p>${entry}</p>`)
    .join("");

  monthlyContainer.innerHTML = state.monthlyLog
    .slice(-30)
    .map((entry) => `<p>${entry}</p>`)
    .join("");
}

function hireCandidate(id, salary) {
  const candidate = state.candidatePool.find((c) => c.id === id);
  if (!candidate) return;
  const offer = Math.max(5000, salary);
  if (!spend(offer, `签约 ${candidate.name}`)) return;

  state.employees.push({
    id: candidate.id,
    name: candidate.name,
    salary: offer,
    expected: candidate.expectedSalary,
    morale: 70 + Math.random() * 20,
    performance: candidate.potential * (0.6 + Math.random() * 0.8),
    department: candidate.strengths[0],
    loyalty: 60 + Math.random() * 30
  });

  state.candidatePool = state.candidatePool.filter((c) => c.id !== id);
  pushMonthlyLog(`🤝 ${candidate.name} 加入公司，擅长 ${candidate.strengths.join("、")}。`);
  renderCandidates();
  renderEmployees();
}

function handleEmployeeAction(event) {
  const { action, id } = event.target.dataset;
  if (!action || !id) return;
  const employee = state.employees.find((emp) => emp.id === id);
  if (!employee) return;

  if (action === "department" && event.target.tagName === "SELECT") {
    employee.department = event.target.value;
    pushMonthlyLog(`📊 ${employee.name} 调整至 ${employee.department}。`);
  }

  if (action === "adjust" && event.target.tagName === "BUTTON") {
    const card = event.target.closest(".card");
    const input = card.querySelector("input[data-action='salary']");
    const newSalary = Math.max(5000, Number(input.value));
    const difference = newSalary - employee.salary;
    if (difference > 0 && !spend(difference, `${employee.name} 薪资调薪补差`)) {
      input.value = employee.salary;
      return;
    }
    employee.salary = newSalary;
    employee.morale = Math.min(100, employee.morale + (newSalary >= employee.expected ? 10 : -8));
    pushMonthlyLog(`💰 ${employee.name} 的工资调整为 ¥${formatNumber(newSalary)}。`);
    renderEmployees();
  }

  if (action === "fire" && event.target.tagName === "BUTTON") {
    state.employees = state.employees.filter((emp) => emp.id !== id);
    pushMonthlyLog(`📉 你裁掉了 ${employee.name}，节省开支但可能影响士气。`);
    renderEmployees();
  }
}

function handleModelAction(event) {
  const { action, id } = event.target.dataset;
  const model = state.models.find((m) => m.id === id);
  if (!model) return;

  if (action === "launch") {
    const payout = evaluateLaunch(model);
    state.income += payout.monthlyBoost;
    state.cash += payout.launchBonus;
    model.status = "已发布";
    pushMonthlyLog(`🚀 ${model.name} 发布，月收入提升 ¥${formatNumber(payout.monthlyBoost)}。`);
  } else if (action === "continue") {
    model.status = "训练中";
    model.remaining = Math.max(1, Math.round((model.privateScore ? 1 : 2) + Math.random() * 2));
    pushMonthlyLog(`🔁 ${model.name} 再训练 ${model.remaining} 个月以冲击更高分。`);
  } else if (action === "scrap") {
    state.models = state.models.filter((m) => m.id !== id);
    pushMonthlyLog(`🧪 ${model.name} 重置，准备重新设计策略。`);
  }
  renderModels();
  renderStats();
}

function runEvaluation(isPrivate) {
  const cost = isPrivate ? 20000 : 8000;
  if (!spend(cost, isPrivate ? "私有集评测" : "公开集评测")) return;

  const readyModels = state.models.filter((model) => model.status === "训练中" || model.status === "待发布");
  if (readyModels.length === 0) {
    pushEvaluationLog("目前没有可评估的模型。");
    return;
  }

  readyModels.forEach((model) => {
    const base = 60 + model.quality;
    const deptBonus = calculateDepartmentBoost(model);
    const randomness = Math.random() * 8 - 2;
    const gpuBonus = state.gpu.owned >= 16 ? 3 : 0;
    const score = Math.max(40, base + deptBonus + randomness + gpuBonus);

    if (isPrivate) {
      model.privateScore = score;
      model.status = "待发布";
      pushEvaluationLog(`🔒 私有集结果 | ${model.name}: ${score.toFixed(1)}`);
    } else {
      model.publicScore = score - Math.random() * 3;
      pushEvaluationLog(`🌐 公开基准 | ${model.name}: ${model.publicScore.toFixed(1)}`);
    }
  });

  renderModels();
  renderCompetitors();
  renderLogs();
}

function nextMonth() {
  state.month += 1;
  const salaryCost = state.employees.reduce((sum, emp) => sum + emp.salary, 0);
  const gpuMaintenance = state.gpu.owned * 400;
  const fixedCost = 15000;
  const totalCost = salaryCost + gpuMaintenance + fixedCost;

  state.cash += state.income - totalCost;
  pushMonthlyLog(`📆 第 ${state.month} 月财报：收入 ¥${formatNumber(state.income)}，支出 ¥${formatNumber(totalCost)}。`);

  state.employees.forEach((employee) => {
    const gap = employee.salary - employee.expected;
    employee.morale += gap >= 0 ? 3 : gap / 1000;
    employee.morale = Math.max(0, Math.min(100, employee.morale));

    const attritionChance = employee.morale < 30 ? 0.35 : employee.morale < 50 ? 0.15 : 0.05;
    if (Math.random() < attritionChance && employee.salary < employee.expected) {
      pushMonthlyLog(`🚪 ${employee.name} 因薪资不满跳槽到竞争对手！`);
      state.employees = state.employees.filter((emp) => emp.id !== employee.id);
    } else {
      employee.performance *= 0.95 + Math.random() * 0.1;
    }
  });

  state.models.forEach((model) => {
    if (model.status !== "训练中") return;
    const speed = Math.min(1.2, state.gpu.owned / Math.max(8, state.models.length * 6));
    const performanceFactor = averagePerformanceFor(model);
    const qualityGain = 4 * speed + performanceFactor + (Math.random() * 2 - 0.5);
    model.quality += qualityGain;
    model.progress += 1;
    model.remaining = Math.max(0, model.remaining - 1);
    if (model.remaining === 0) {
      model.status = "待发布";
      pushMonthlyLog(`🎯 ${model.name} 完成训练，等待评测或发布。`);
    }
  });

  state.candidatePool = generateCandidates(4 + Math.floor(Math.random() * 3));
  updateCompetitors();
  adjustIncomeByLeadership();
  runRandomEvent();
  renderAll();
}

function evaluateLaunch(model) {
  const base = model.privateScore || model.publicScore || 60;
  const competitorAverage = averageCompetitorScore(model.benchmark);
  const isSota = base > competitorAverage + 2;
  const monthlyBoost = Math.round(isSota ? 40000 + Math.random() * 30000 : 15000 + Math.random() * 15000);
  const launchBonus = Math.round(isSota ? 60000 + Math.random() * 50000 : 20000 + Math.random() * 20000);
  if (isSota) {
    pushEvaluationLog(`🏆 ${model.name} 在 ${model.benchmark} 达到行业领先！`);
  } else {
    pushEvaluationLog(`📢 ${model.name} 上市并取得不错的口碑。`);
  }
  return { monthlyBoost, launchBonus };
}

function calculateDepartmentBoost(model) {
  const contributions = state.employees.reduce(
    (acc, employee) => {
      const weight = employee.department === "基础模型" ? 1.1 : employee.department === "安全对齐" ? 0.8 : 1;
      const synergy = model.strategy.includes("对齐") && employee.department === "安全对齐" ? 1.2 : 1;
      const value = employee.performance * weight * synergy;
      return acc + value;
    },
    0
  );
  return Math.min(12, contributions / Math.max(1, state.employees.length * 1.5));
}

function averagePerformanceFor(model) {
  const relatedDepartments = departments.filter((dept) => {
    if (model.strategy.includes("对齐")) return dept === "安全对齐" || dept === "基础模型";
    if (model.strategy.includes("多模态")) return dept === "产品应用";
    if (model.strategy.includes("长")) return dept === "推理效率" || dept === "基础模型";
    return true;
  });
  const relatedEmployees = state.employees.filter((emp) => relatedDepartments.includes(emp.department));
  if (relatedEmployees.length === 0) return 0;
  return relatedEmployees.reduce((sum, emp) => sum + emp.performance, 0) / (relatedEmployees.length * 5);
}

function adjustIncomeByLeadership() {
  const publishedModels = state.models.filter((model) => model.status === "已发布");
  const totalScore = publishedModels.reduce((sum, model) => sum + (model.privateScore || model.publicScore || 60), 0);
  if (publishedModels.length === 0) return;
  const averageScore = totalScore / publishedModels.length;
  const targetIncome = 25000 + averageScore * 1000;
  const delta = targetIncome - state.income;
  state.income += delta * 0.3;
}

function runRandomEvent() {
  const roll = Math.random();
  if (roll < 0.2) {
    const bonus = 15000 + Math.random() * 15000;
    state.cash += bonus;
    pushMonthlyLog(`💡 获得创新补贴，现金增加 ¥${formatNumber(bonus)}。`);
  } else if (roll > 0.85) {
    const penalty = 20000 + Math.random() * 20000;
    state.cash -= penalty;
    pushMonthlyLog(`⚠️ 数据隐私合规整改罚款 ¥${formatNumber(penalty)}。`);
  }
}

function updateCompetitors() {
  state.competitors.forEach((competitor) => {
    const drift = (Math.random() * 4 - 1.5);
    competitor.hype = Math.max(20, Math.min(100, competitor.hype + drift));
    Object.keys(competitor.privateScores).forEach((bench) => {
      competitor.privateScores[bench] = Math.max(
        55,
        Math.min(95, competitor.privateScores[bench] + Math.random() * 3 - 1)
      );
    });
  });
}

function averageCompetitorScore(benchmark) {
  const scores = state.competitors.map((c) => c.privateScores[benchmark] || 70);
  const total = scores.reduce((sum, s) => sum + s, 0);
  return total / scores.length;
}

function pushEvaluationLog(message) {
  const timestamp = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  state.evaluationLog.push(`[${timestamp}] ${message}`);
  renderLogs();
}

function pushMonthlyLog(message) {
  state.monthlyLog.push(message);
  renderLogs();
}

function spend(amount, reason) {
  if (state.cash < amount) {
    pushMonthlyLog(`❌ 现金不足，无法执行：${reason}`);
    return false;
  }
  state.cash -= amount;
  renderStats();
  return true;
}

function generateCandidates(count) {
  return Array.from({ length: count }).map(() => {
    const name = randomPick(employeeNamePool);
    const expectedSalary = 15000 + Math.round(Math.random() * 25000);
    const potential = 5 + Math.random() * 5;
    const strengths = shuffleArray([...departments]).slice(0, 2);
    return {
      id: crypto.randomUUID(),
      name,
      expectedSalary,
      potential,
      strengths
    };
  });
}

function generateCompetitors() {
  return competitorNames.map((name) => ({
    name,
    hype: 60 + Math.random() * 20,
    privateScores: {
      MMLU: 72 + Math.random() * 8,
      CMMLU: 70 + Math.random() * 10,
      "C-Eval": 74 + Math.random() * 8,
      "AGI-Safety": 68 + Math.random() * 9
    }
  }));
}

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatNumber(num) {
  return Math.round(num).toLocaleString("zh-CN");
}
