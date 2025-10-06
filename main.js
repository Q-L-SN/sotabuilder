const state = {
  month: 1,
  cash: 100000,
  income: 25000,
  lastContractIncome: 0,
  gpu: {
    owned: 8,
    capacity: 8
  },
  employees: [],
  candidatePool: [],
  models: [],
  competitors: [],
  evaluationLog: [],
  monthlyLog: [],
  governanceLog: [],
  reputation: 55,
  compliance: 80,
  datasets: [],
  datasetOffers: [],
  contracts: [],
  contractOffers: []
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

const datasetCatalog = [
  {
    id: "dataset-dialog",
    name: "中文对话精标语料",
    description: "覆盖客服、医疗、政务等场景的高质量对话数据。",
    cost: 24000,
    upkeep: 2600,
    quality: 2.4,
    complianceShift: -3
  },
  {
    id: "dataset-tech",
    name: "高校科研语料授权",
    description: "与多所高校合作获取的技术论文与课堂笔记。",
    cost: 32000,
    upkeep: 2800,
    quality: 3.2,
    complianceShift: 4
  },
  {
    id: "dataset-code",
    name: "企业代码审校集",
    description: "来自 SaaS 客户的匿名化代码与审计记录。",
    cost: 28000,
    upkeep: 3200,
    quality: 3.6,
    complianceShift: -2
  },
  {
    id: "dataset-multi",
    name: "多模态场景采集包",
    description: "含图文对齐、语音指令与视频理解数据。",
    cost: 36000,
    upkeep: 3500,
    quality: 4.1,
    complianceShift: 3
  }
];

const contractClientPool = [
  {
    name: "银汉银行",
    industry: "金融",
    focus: "CMMLU"
  },
  {
    name: "星云搜索",
    industry: "互联网",
    focus: "MMLU"
  },
  {
    name: "衡鉴法律科技",
    industry: "法律",
    focus: "C-Eval"
  },
  {
    name: "鸿途物流",
    industry: "供应链",
    focus: "MMLU"
  },
  {
    name: "安泰医疗",
    industry: "医疗",
    focus: "AGI-Safety"
  }
];

function init() {
  state.candidatePool = generateCandidates(6);
  state.competitors = generateCompetitors();
  state.datasetOffers = generateDatasetOffers();
  state.contractOffers = generateContractOffers();
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
  document.getElementById("dataset-offers").addEventListener("click", handleDatasetAction);
  document.getElementById("contract-offers").addEventListener("click", handleContractMarketAction);
  document.getElementById("active-contracts").addEventListener("click", handleActiveContractAction);
  document.getElementById("action-ethics").addEventListener("click", runEthicsReview);
  document.getElementById("action-pr").addEventListener("click", launchPRCampaign);
}

function renderAll() {
  renderStats();
  renderCandidates();
  renderEmployees();
  renderModels();
  renderDataAssets();
  renderCompetitors();
  renderContracts();
  renderGovernance();
  renderLogs();
}

function renderStats() {
  document.getElementById("stat-month").textContent = `第 ${state.month} 月`;
  document.getElementById("stat-cash").textContent = `现金：¥${formatNumber(state.cash)}`;
  document.getElementById("stat-income").textContent = `月收入：¥${formatNumber(state.income)}`;
  document.getElementById("stat-gpu").textContent = `GPU：${state.gpu.owned} / ${state.gpu.capacity} 张`;
  document.getElementById("stat-contract-income").textContent = `合同收入：¥${formatNumber(state.lastContractIncome)}`;
  document.getElementById("stat-reputation").textContent = `声誉：${state.reputation.toFixed(0)}`;
  document.getElementById("stat-compliance").textContent = `合规：${state.compliance.toFixed(0)}`;
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

function renderDataAssets() {
  const ownedContainer = document.getElementById("dataset-owned");
  const offersContainer = document.getElementById("dataset-offers");

  ownedContainer.innerHTML = "";
  if (state.datasets.length === 0) {
    ownedContainer.innerHTML = '<div class="card"><p>暂无数据资产，考虑签约授权或合作项目。</p></div>';
  } else {
    state.datasets.forEach((dataset) => {
      const card = document.createElement("div");
      card.className = "card";
      const complianceText = dataset.complianceShift >= 0 ? `+${dataset.complianceShift}` : dataset.complianceShift;
      card.innerHTML = `
        <strong>${dataset.name}</strong>
        <div>${dataset.description}</div>
        <div>质量加成：+${dataset.quality.toFixed(1)}</div>
        <div>月度维护：¥${formatNumber(dataset.upkeep)}</div>
        <div>合规影响：${complianceText}</div>
      `;
      ownedContainer.appendChild(card);
    });
  }

  offersContainer.innerHTML = "";
  const available = state.datasetOffers.filter(
    (offer) => !state.datasets.some((dataset) => dataset.id === offer.id)
  );
  if (available.length === 0) {
    offersContainer.innerHTML = '<div class="card"><p>暂无新的数据供应商，等待下月刷新。</p></div>';
    return;
  }

  available.forEach((offer) => {
    const card = document.createElement("div");
    card.className = "card";
    const complianceText = offer.complianceShift >= 0 ? `+${offer.complianceShift}` : offer.complianceShift;
    card.innerHTML = `
      <strong>${offer.name}</strong>
      <div>${offer.description}</div>
      <div>采购价：¥${formatNumber(offer.cost)}</div>
      <div>月维护：¥${formatNumber(offer.upkeep)}</div>
      <div>质量加成：+${offer.quality.toFixed(1)}</div>
      <div>合规影响：${complianceText}</div>
      <button class="secondary" data-action="buy-dataset" data-id="${offer.id}">签约采购</button>
    `;
    offersContainer.appendChild(card);
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

function renderContracts() {
  const offersContainer = document.getElementById("contract-offers");
  const activeContainer = document.getElementById("active-contracts");

  offersContainer.innerHTML = "";
  const available = state.contractOffers.filter(
    (offer) => !state.contracts.some((contract) => contract.client === offer.client && contract.status === "进行中")
  );
  if (available.length === 0) {
    offersContainer.innerHTML = '<div class="card"><p>暂无新的客户邀约，专注交付现有项目。</p></div>';
  } else {
    available.forEach((offer) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <strong>${offer.client}</strong>
        <div><span class="tag">${offer.industry}</span><span class="tag">${offer.benchmark}</span></div>
        <div>目标评分 ≥ ${offer.requirement.toFixed(1)}</div>
        <div>月服务费：¥${formatNumber(offer.monthlyFee)}</div>
        <div>声誉要求：${offer.reputationRequired.toFixed(0)} · 合规 ≥ ${offer.complianceRequired.toFixed(0)}</div>
        <div>售前成本：¥${formatNumber(offer.pitchCost)}</div>
        <button class="primary" data-action="sign-contract" data-id="${offer.id}">提交方案</button>
      `;
      offersContainer.appendChild(card);
    });
  }

  activeContainer.innerHTML = "";
  if (state.contracts.length === 0) {
    activeContainer.innerHTML = '<div class="card"><p>暂无合同记录。</p></div>';
    return;
  }

  state.contracts.forEach((contract) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${contract.client}</strong>
      <div><span class="tag">${contract.industry}</span><span class="tag">${contract.benchmark}</span></div>
      <div>月服务费：¥${formatNumber(contract.monthlyFee)}</div>
      <div>目标：≥ ${contract.requirement.toFixed(1)} ｜ 合规 ≥ ${contract.complianceRequired.toFixed(0)}</div>
      <div>履约进度：${Math.min(contract.progress, contract.term)} / ${contract.term} 月</div>
      <div>状态：${contract.status}</div>
      <div>失约次数：${contract.failures}</div>
    `;

    if (contract.status === "进行中") {
      const terminate = document.createElement("button");
      terminate.className = "secondary";
      terminate.dataset.action = "terminate";
      terminate.dataset.id = contract.id;
      terminate.textContent = "提前终止";
      card.appendChild(terminate);
    }

    activeContainer.appendChild(card);
  });
}

function renderGovernance() {
  const container = document.getElementById("governance-log");
  if (!container) return;
  if (state.governanceLog.length === 0) {
    container.innerHTML = "<p>暂无治理动态，保持与监管的定期沟通。</p>";
    return;
  }
  container.innerHTML = state.governanceLog
    .slice(-20)
    .map((entry) => `<p>${entry}</p>`)
    .join("");
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

function handleDatasetAction(event) {
  const { action, id } = event.target.dataset;
  if (action === "buy-dataset" && id) {
    purchaseDataset(id);
  }
}

function handleContractMarketAction(event) {
  const { action, id } = event.target.dataset;
  if (action === "sign-contract" && id) {
    signContract(id);
  }
}

function handleActiveContractAction(event) {
  const { action, id } = event.target.dataset;
  if (!action || !id) return;
  if (action === "terminate") {
    terminateContract(id);
  }
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
    const dataBonus = datasetQualityBonus();
    const score = Math.max(40, base + deptBonus + randomness + gpuBonus + dataBonus);

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

function purchaseDataset(id) {
  const dataset = datasetCatalog.find((item) => item.id === id);
  if (!dataset || state.datasets.some((item) => item.id === id)) return;
  if (!spend(dataset.cost, `采购数据资产 ${dataset.name}`)) return;

  state.datasets.push({ ...dataset });
  state.compliance = clamp(state.compliance + dataset.complianceShift);
  const direction = dataset.complianceShift >= 0 ? "提升" : "下降";
  const delta = Math.abs(dataset.complianceShift).toFixed(0);
  pushMonthlyLog(`📚 签约 ${dataset.name}，训练数据质量提升。`);
  if (dataset.complianceShift !== 0) {
    pushGovernanceLog(`⚖️ ${dataset.name} 使合规${direction} ${delta}。`);
  }

  state.datasetOffers = state.datasetOffers.filter((offer) => offer.id !== id);
  renderDataAssets();
  renderStats();
  renderGovernance();
}

function signContract(id) {
  const offer = state.contractOffers.find((item) => item.id === id);
  if (!offer) return;
  if (state.reputation < offer.reputationRequired) {
    pushMonthlyLog(`❌ 声誉不足，${offer.client} 暂缓合作。`);
    return;
  }
  if (state.compliance < offer.complianceRequired) {
    pushMonthlyLog(`❌ 合规评分未达 ${offer.complianceRequired.toFixed(0)}，${offer.client} 要求补齐治理。`);
    pushGovernanceLog(`🚫 ${offer.client} 要求更高合规标准。`);
    return;
  }
  if (!spend(offer.pitchCost, `${offer.client} 售前解决方案投入`)) return;

  state.contracts.push({
    ...offer,
    status: "进行中",
    progress: 0,
    failures: 0
  });
  state.contractOffers = state.contractOffers.filter((item) => item.id !== id);
  state.reputation = clamp(state.reputation + offer.reputationGain);
  pushMonthlyLog(`🤝 与 ${offer.client} (${offer.industry}) 签订交付合同，月服务费 ¥${formatNumber(offer.monthlyFee)}。`);
  pushGovernanceLog(`📑 ${offer.client} 合同要求 ${offer.benchmark} ≥ ${offer.requirement.toFixed(1)}。`);
  renderContracts();
  renderStats();
  renderGovernance();
}

function terminateContract(id) {
  const contract = state.contracts.find((item) => item.id === id);
  if (!contract || contract.status !== "进行中") return;
  const penalty = Math.round(contract.monthlyFee * 0.8);
  if (!spend(penalty, `${contract.client} 合同违约赔付`)) return;
  contract.status = "已终止";
  state.reputation = clamp(state.reputation - 6);
  pushMonthlyLog(`⚠️ 提前终止与 ${contract.client} 的合同，支付违约金 ¥${formatNumber(penalty)}。`);
  pushGovernanceLog(`🟥 ${contract.client} 合同终止，声誉受损。`);
  renderContracts();
  renderStats();
  renderGovernance();
}

function runEthicsReview() {
  const cost = 12000;
  if (!spend(cost, "负责任 AI 审查")) return;
  const complianceGain = 6 + Math.random() * 4;
  const reputationGain = 2 + Math.random() * 2;
  state.compliance = clamp(state.compliance + complianceGain);
  state.reputation = clamp(state.reputation + reputationGain);
  pushGovernanceLog(`🛡️ 完成负责任 AI 审查，合规 +${complianceGain.toFixed(1)}，声誉 +${reputationGain.toFixed(1)}。`);
  renderStats();
  renderGovernance();
}

function launchPRCampaign() {
  const cost = 18000;
  if (!spend(cost, "发布可信度白皮书")) return;
  const reputationGain = 6 + Math.random() * 5;
  const complianceGain = 1 + Math.random() * 2;
  state.reputation = clamp(state.reputation + reputationGain);
  state.compliance = clamp(state.compliance + complianceGain);
  pushGovernanceLog(`📣 发布可信度白皮书，声誉 +${reputationGain.toFixed(1)}，合规 +${complianceGain.toFixed(1)}。`);
  pushMonthlyLog("📢 行业媒体关注公司的可信度白皮书，市场渠道拓展顺利。");
  renderStats();
  renderGovernance();
}

function processContracts() {
  let income = 0;
  state.contracts.forEach((contract) => {
    if (contract.status !== "进行中") return;
    const bestScore = bestPublishedScore(contract.benchmark);
    const meetsScore = bestScore >= contract.requirement;
    const meetsCompliance = state.compliance >= contract.complianceRequired;

    if (meetsScore && meetsCompliance) {
      income += contract.monthlyFee;
      contract.progress += 1;
      contract.failures = 0;
      state.reputation = clamp(state.reputation + contract.reputationGain / contract.term);
      if (contract.progress >= contract.term) {
        contract.status = "已完成";
        pushMonthlyLog(`🏁 ${contract.client} 合同顺利完成，等待续约机会。`);
        pushGovernanceLog(`✅ ${contract.client} 对交付满意，声誉稳固。`);
      }
    } else {
      contract.failures += 1;
      if (!meetsScore) {
        pushMonthlyLog(`⚠️ ${contract.client} 指出 ${contract.benchmark} 结果未达 ${contract.requirement.toFixed(1)}。`);
      }
      if (!meetsCompliance) {
        pushGovernanceLog(`⚠️ ${contract.client} 质疑合规流程，需提升到 ${contract.complianceRequired.toFixed(0)}。`);
        state.compliance = clamp(state.compliance - 2);
      }
      state.reputation = clamp(state.reputation - 4);
      if (contract.failures >= 2) {
        contract.status = "已终止";
        pushMonthlyLog(`❌ ${contract.client} 终止合作，需尽快改善交付能力。`);
        pushGovernanceLog(`🟥 因交付不稳定失去 ${contract.client}。`);
      }
    }
  });
  return income;
}

function bestPublishedScore(benchmark) {
  const published = state.models.filter((model) => model.status === "已发布" && model.benchmark === benchmark);
  if (published.length === 0) return 0;
  return published.reduce((max, model) => {
    const score = model.privateScore || model.publicScore || 0;
    return Math.max(max, score);
  }, 0);
}

function datasetQualityBonus() {
  return state.datasets.reduce((sum, dataset) => sum + dataset.quality, 0);
}

function nextMonth() {
  state.month += 1;
  const salaryCost = state.employees.reduce((sum, emp) => sum + emp.salary, 0);
  const gpuMaintenance = state.gpu.owned * 400;
  const fixedCost = 15000;
  const datasetUpkeep = state.datasets.reduce((sum, dataset) => sum + dataset.upkeep, 0);
  const totalCost = salaryCost + gpuMaintenance + fixedCost + datasetUpkeep;

  const contractIncome = processContracts();
  const monthlyRevenue = state.income + contractIncome;
  state.cash += monthlyRevenue - totalCost;
  state.lastContractIncome = contractIncome;
  pushMonthlyLog(
    `📆 第 ${state.month} 月财报：收入 ¥${formatNumber(monthlyRevenue)}（基础 ¥${formatNumber(state.income)} + 合同 ¥${formatNumber(contractIncome)}），支出 ¥${formatNumber(totalCost)}。`
  );

  state.compliance = clamp(state.compliance - 1.5 + state.datasets.length * 0.4);
  state.reputation = clamp(state.reputation - 0.5);

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
    const dataInfluence = datasetQualityBonus() * 0.6;
    const qualityGain = 4 * speed + performanceFactor + (Math.random() * 2 - 0.5) + dataInfluence;
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
  state.datasetOffers = generateDatasetOffers();
  state.contractOffers = generateContractOffers();
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
    state.reputation = clamp(state.reputation + 8);
  } else {
    pushEvaluationLog(`📢 ${model.name} 上市并取得不错的口碑。`);
    state.reputation = clamp(state.reputation + 3);
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
  const reputationModifier = 1 + state.reputation / 180;
  const complianceModifier = 0.9 + state.compliance / 200;
  const targetIncome = 20000 + averageScore * 800 * reputationModifier * complianceModifier;
  const delta = targetIncome - state.income;
  state.income += delta * 0.25;
}

function runRandomEvent() {
  const roll = Math.random();
  if (roll < 0.18) {
    const bonus = 15000 + Math.random() * 20000;
    state.cash += bonus;
    state.reputation = clamp(state.reputation + 2.5);
    pushMonthlyLog(`💡 获得政府创新补贴，现金增加 ¥${formatNumber(bonus)}，声誉提升。`);
  } else if (roll < 0.32 && state.datasets.length > 0) {
    const penalty = 12000 + Math.random() * 12000;
    state.cash -= penalty;
    state.compliance = clamp(state.compliance - 4);
    pushMonthlyLog(`⚠️ 数据授权补签成本 ¥${formatNumber(penalty)}。`);
    pushGovernanceLog("🧾 监管要求补充数据授权证明，合规评分下降。");
  } else if (roll > 0.9) {
    const penalty = 20000 + Math.random() * 25000;
    state.cash -= penalty;
    state.compliance = clamp(state.compliance - 6);
    pushMonthlyLog(`🛑 接受监管抽检并整改，支出 ¥${formatNumber(penalty)}。`);
    pushGovernanceLog("🛡️ 完成监管抽检整改，需持续关注敏感数据管理。");
  } else if (roll > 0.7) {
    const gain = 3 + Math.random() * 3;
    state.compliance = clamp(state.compliance + gain);
    pushGovernanceLog(`📘 通过行业标准认证，合规 +${gain.toFixed(1)}。`);
  }
}

function generateDatasetOffers() {
  const available = datasetCatalog.filter(
    (dataset) => !state.datasets.some((owned) => owned.id === dataset.id)
  );
  if (available.length === 0) return [];
  const count = Math.min(available.length, 3);
  return shuffleArray([...available])
    .slice(0, count)
    .map((dataset) => ({ ...dataset }));
}

function generateContractOffers() {
  const shuffled = shuffleArray([...contractClientPool]);
  const count = Math.min(shuffled.length, 3);
  const offers = [];
  for (let i = 0; i < count; i += 1) {
    const client = shuffled[i];
    const benchmark = client.focus;
    const competitorAvg = averageCompetitorScore(benchmark);
    const requirement = Math.round((competitorAvg + 1 + Math.random() * 5) * 10) / 10;
    offers.push({
      id: crypto.randomUUID(),
      client: client.name,
      industry: client.industry,
      benchmark,
      requirement,
      monthlyFee: 22000 + Math.round(Math.random() * 22000),
      term: 4 + Math.floor(Math.random() * 4),
      reputationRequired: 50 + Math.random() * 25,
      complianceRequired: 65 + Math.random() * 20,
      pitchCost: 5000 + Math.round(Math.random() * 4000),
      reputationGain: 4 + Math.random() * 4
    });
  }
  return offers;
}

function pushGovernanceLog(message) {
  state.governanceLog.push(message);
  renderGovernance();
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
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
