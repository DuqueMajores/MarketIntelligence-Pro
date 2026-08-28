import { TrendsConnector, MarketplaceConnector } from './connectors.js';

// Application State
const state = {
  activeTab: 'ranking',
  trends: [],
  filteredTrends: [],
  visibleCount: 6,
  loading: false,
  error: null,
  compareList: [],
  selectedProduct: null,
  activeModalTab: 'score', // 'score' | 'price' | 'ads'
  regionalProducts: [],
  regionalLoading: false,
  regionalQuery: '',
  regionalState: 'SP',
  regionalCity: 'São Paulo',
  regionalRadius: 10,
  regionalCategory: 'all',
  lastUpdated: new Date().toLocaleTimeString('pt-BR'),
  countdown: 300,
  autoUpdateInterval: 5,
};

// Global Chart References to destroy before rebuilding
let modalChartInstance = null;
let compareChartInstance = null;

// Initializer
export async function init() {
  setupEventListeners();
  startCountdown();
  await refreshTrends();
}

// Set up UI Event Handlers
function setupEventListeners() {
  // Tab Switching
  document.querySelectorAll('[data-tab]').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      const targetTab = e.currentTarget.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Main Filters
  const searchInput = document.getElementById('searchQuery');
  const catFilter = document.getElementById('categoryFilter');
  const locFilter = document.getElementById('locationFilter');
  const marketFilter = document.getElementById('marketplaceFilter');

  const triggerFilterUpdate = async () => {
    state.visibleCount = 6;
    await refreshTrends();
  };

  if (searchInput) searchInput.addEventListener('input', debounce(triggerFilterUpdate, 500));
  if (catFilter) catFilter.addEventListener('change', triggerFilterUpdate);
  if (locFilter) locFilter.addEventListener('change', triggerFilterUpdate);
  if (marketFilter) marketFilter.addEventListener('change', triggerFilterUpdate);

  // Manual Refresh
  const refreshBtn = document.getElementById('manualRefreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await refreshTrends();
    });
  }

  // Load More Button
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      state.visibleCount += 6;
      renderRanking();
    });
  }

  // Regional Form Submission
  const regionalForm = document.getElementById('regionalForm');
  if (regionalForm) {
    regionalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await runRegionalAnalysis();
    });
  }

  // Modal Sub-tabs
  document.querySelectorAll('[data-modal-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.activeModalTab = e.currentTarget.getAttribute('data-modal-tab');
      document.querySelectorAll('[data-modal-tab]').forEach(b => {
        b.classList.remove('border-blue-600', 'text-blue-600');
        b.classList.add('border-transparent', 'text-slate-500');
      });
      e.currentTarget.classList.add('border-blue-600', 'text-blue-600');
      e.currentTarget.classList.remove('border-transparent', 'text-slate-500');
      updateModalChart();
    });
  });

  // Modal Close buttons
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalBackdrop = document.getElementById('detailModal');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeDetailModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeDetailModal();
    });
  }

  // Toggle comparison buttons in modal
  const modalCompareBtn = document.getElementById('modalCompareBtn');
  if (modalCompareBtn) {
    modalCompareBtn.addEventListener('click', () => {
      if (state.selectedProduct) {
        toggleCompare(state.selectedProduct);
        updateModalCompareButtonState();
      }
    });
  }
}

// Switch View Tabs
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update Tab Headers Styling
  document.querySelectorAll('[data-tab]').forEach(btn => {
    const isSelected = btn.getAttribute('data-tab') === tabId;
    if (isSelected) {
      btn.classList.add('border-blue-600', 'text-blue-600', 'bg-white');
      btn.classList.remove('border-transparent', 'text-slate-500', 'hover:text-slate-700');
    } else {
      btn.classList.remove('border-blue-600', 'text-blue-600', 'bg-white');
      btn.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-700');
    }
  });

  // Toggle View Panels
  document.querySelectorAll('[data-view-panel]').forEach(panel => {
    const isTarget = panel.getAttribute('data-view-panel') === tabId;
    if (isTarget) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  // Perform view specific renders
  if (tabId === 'ranking') renderRanking();
  if (tabId === 'regional') renderRegional();
  if (tabId === 'reports') renderReports();
  if (tabId === 'compare') renderCompare();
  if (tabId === 'transparency') renderTransparency();
}

// Refresh Trends Core Data
async function refreshTrends() {
  state.loading = true;
  state.error = null;
  showLoadingIndicator(true);

  try {
    const query = document.getElementById('searchQuery')?.value || '';
    const cat = document.getElementById('categoryFilter')?.value || 'all';
    const loc = document.getElementById('locationFilter')?.value || 'Brasil';
    const market = document.getElementById('marketplaceFilter')?.value || 'all';

    const unifiedData = await TrendsConnector.getUnifiedTrends(
      query,
      cat === 'all' ? '' : cat,
      loc,
      market
    );

    state.trends = unifiedData;
    state.lastUpdated = new Date().toLocaleTimeString('pt-BR');
    state.countdown = state.autoUpdateInterval * 60;
    
    // Update KPI stats
    updateDashboardStats();
    renderRanking();
  } catch (err) {
    console.error(err);
    state.error = 'Algumas fontes de dados demoraram para responder. Carregando dados inteligentes do cache integrado local.';
    showErrorMessage(state.error);
  } finally {
    state.loading = false;
    showLoadingIndicator(false);
  }
}

// Run Regional Facebook Analysis
async function runRegionalAnalysis() {
  state.regionalLoading = true;
  document.getElementById('regionalSpinner').classList.remove('hidden');
  document.getElementById('regionalResultsTable').classList.add('opacity-40');

  try {
    const query = document.getElementById('regionalSearchQuery').value;
    const stateVal = document.getElementById('regionalState').value;
    const cityVal = document.getElementById('regionalCity').value;
    const radiusVal = parseInt(document.getElementById('regionalRadius').value);
    const categoryVal = document.getElementById('regionalCategory').value;

    const data = await MarketplaceConnector.getTrendingProducts(query, categoryVal, {
      country: 'Brasil',
      state: stateVal,
      city: cityVal,
      radius: radiusVal,
      category: categoryVal
    });

    state.regionalProducts = data;
    renderRegionalTable();
  } catch (err) {
    console.error(err);
  } finally {
    state.regionalLoading = false;
    document.getElementById('regionalSpinner').classList.add('hidden');
    document.getElementById('regionalResultsTable').classList.remove('opacity-40');
  }
}

// Render Main Product Ranking Table
function renderRanking() {
  const tableBody = document.getElementById('rankingTableBody');
  const loadMoreContainer = document.getElementById('loadMoreContainer');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  const sliceData = state.trends.slice(0, state.visibleCount);

  if (sliceData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-12 text-slate-400">
          Nenhum produto correspondente aos filtros foi encontrado. Tente redefinir sua pesquisa.
        </td>
      </tr>
    `;
    if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
    return;
  }

  sliceData.forEach((product, idx) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-slate-700 text-sm';
    
    const varClass = product.interestVariation >= 0 ? 'text-emerald-600' : 'text-rose-600';
    const varSign = product.interestVariation >= 0 ? '+' : '';

    const badgeClasses = {
      mercadolivre: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      shopee: 'bg-orange-50 text-orange-800 border-orange-200',
      amazon: 'bg-slate-100 text-slate-800 border-slate-200',
      facebook: 'bg-blue-50 text-blue-800 border-blue-200'
    };

    const friendlyPlatform = {
      mercadolivre: 'Mercado Livre',
      shopee: 'Shopee',
      amazon: 'Amazon',
      facebook: 'FB Marketplace'
    };

    const isAdded = state.compareList.some(item => item.id === product.id);
    const compareBtnText = isAdded ? 'Remover' : 'Comparar';
    const compareBtnClass = isAdded ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100';

    row.innerHTML = `
      <td class="py-3 px-4 font-medium text-slate-900">#${idx + 1}</td>
      <td class="py-3 px-4">
        <div class="font-semibold text-slate-900 max-w-xs truncate">${product.name}</div>
        <div class="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
          <span class="px-1.5 py-0.5 rounded-full border text-[10px] ${badgeClasses[product.marketplace]}">${friendlyPlatform[product.marketplace]}</span>
          <span>•</span>
          <span>${product.category}</span>
        </div>
      </td>
      <td class="py-3 px-4 font-semibold text-slate-800">
        R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-1">
          <div class="w-12 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div class="bg-blue-600 h-full" style="width: ${product.trendScore}%"></div>
          </div>
          <span class="font-bold text-slate-900">${product.trendScore}</span>
        </div>
      </td>
      <td class="py-3 px-4 font-semibold ${varClass}">${varSign}${product.interestVariation}%</td>
      <td class="py-3 px-4 text-slate-500 font-medium">${product.indicatorsCount.toLocaleString('pt-BR')} anúncios</td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-2">
          <button data-analyse-id="${product.id}" class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">Analisar</button>
          <button data-compare-id="${product.id}" class="px-2.5 py-1.5 text-xs rounded font-semibold transition ${compareBtnClass}">${compareBtnText}</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Bind Buttons Action in Main List
  tableBody.querySelectorAll('[data-analyse-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = e.currentTarget.getAttribute('data-analyse-id');
      const prod = state.trends.find(t => t.id === prodId);
      if (prod) openDetailModal(prod);
    });
  });

  tableBody.querySelectorAll('[data-compare-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = e.currentTarget.getAttribute('data-compare-id');
      const prod = state.trends.find(t => t.id === prodId);
      if (prod) {
        toggleCompare(prod);
        renderRanking();
      }
    });
  });

  // Toggle Visibility of Load More
  if (loadMoreContainer) {
    if (state.trends.length > state.visibleCount) {
      loadMoreContainer.classList.remove('hidden');
    } else {
      loadMoreContainer.classList.add('hidden');
    }
  }
}

// Render Regional Table Results
function renderRegional() {
  if (state.regionalProducts.length === 0) {
    // Initial loading with some sample search
    runRegionalAnalysis();
  } else {
    renderRegionalTable();
  }
}

function renderRegionalTable() {
  const tableBody = document.getElementById('regionalTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (state.regionalProducts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-10 text-slate-400">
          Nenhuma análise regional executada ou nenhum resultado correspondente.
        </td>
      </tr>
    `;
    return;
  }

  state.regionalProducts.forEach((product, idx) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-slate-700 text-sm';
    
    const varClass = product.interestVariation >= 0 ? 'text-emerald-600' : 'text-rose-600';
    const varSign = product.interestVariation >= 0 ? '+' : '';

    row.innerHTML = `
      <td class="py-3.5 px-4 font-semibold text-slate-900">${product.name}</td>
      <td class="py-3.5 px-4 text-slate-500">${product.category}</td>
      <td class="py-3.5 px-4 font-semibold text-slate-800">
        R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td class="py-3.5 px-4">
        <span class="px-2 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-800 border border-blue-100">
          ${product.indicatorsCount} anúncios ativos
        </span>
      </td>
      <td class="py-3.5 px-4">
        <button data-analyse-id="${product.id}" class="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded font-semibold hover:bg-slate-200 transition">
          Ficha Detalhada
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  tableBody.querySelectorAll('[data-analyse-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = e.currentTarget.getAttribute('data-analyse-id');
      const prod = state.regionalProducts.find(t => t.id === prodId);
      if (prod) openDetailModal(prod);
    });
  });
}

// Render Market Reports View
function renderReports() {
  const reportsContainer = document.getElementById('reportsContainer');
  if (!reportsContainer) return;

  const reports = TrendsConnector.getMarketReports();
  reportsContainer.innerHTML = '';

  reports.forEach(report => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between';
    
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">Relevância ${report.relevance}</span>
          <span class="text-xs text-slate-400">${report.publishDate}</span>
        </div>
        <h3 class="text-base font-bold text-slate-900 mb-2 leading-snug">${report.title}</h3>
        <p class="text-xs text-slate-500 mb-4 font-semibold flex items-center gap-1">Fonte: ${report.source}</p>
        <p class="text-sm text-slate-600 mb-5 leading-relaxed">${report.summary}</p>
        
        <div class="border-t border-slate-100 pt-4 mb-4">
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Categorias em Alta</div>
          <div class="flex flex-wrap gap-1.5 mb-4">
            ${report.topCategories.map(cat => `<span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">${cat}</span>`).join('')}
          </div>

          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Produtos Mapeados</div>
          <div class="flex flex-wrap gap-1.5">
            ${report.trendingProducts.map(prod => `<span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">${prod}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <a href="${report.url}" target="_blank" class="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1">
          Acessar Estudo Completo Externo
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    `;
    reportsContainer.appendChild(card);
  });
  lucide.createIcons();
}

// Render Comparison Module with Interactive Chart
function renderCompare() {
  const compareTableBody = document.getElementById('compareTableBody');
  const emptyCompareState = document.getElementById('emptyCompareState');
  const activeCompareState = document.getElementById('activeCompareState');
  const clearCompareBtn = document.getElementById('clearCompareBtn');

  if (!compareTableBody) return;

  if (state.compareList.length === 0) {
    emptyCompareState.classList.remove('hidden');
    activeCompareState.classList.add('hidden');
    return;
  }

  emptyCompareState.classList.add('hidden');
  activeCompareState.classList.remove('hidden');

  compareTableBody.innerHTML = '';

  state.compareList.forEach((product, idx) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-slate-700 text-sm';
    
    const friendlyPlatform = {
      mercadolivre: 'Mercado Livre',
      shopee: 'Shopee',
      amazon: 'Amazon',
      facebook: 'FB Marketplace'
    };

    row.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-900">${product.name}</td>
      <td class="py-3 px-4 font-medium text-slate-500">${friendlyPlatform[product.marketplace]}</td>
      <td class="py-3 px-4 font-bold text-slate-800">
        R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-blue-600">${product.trendScore} / 100</span>
        </div>
      </td>
      <td class="py-3 px-4 font-bold text-emerald-600">+${product.interestVariation}%</td>
      <td class="py-3 px-4 max-w-xs text-xs text-slate-500 leading-relaxed">${product.opportunityConclusion}</td>
      <td class="py-3 px-4 text-right">
        <button data-remove-compare-id="${product.id}" class="text-rose-600 hover:text-rose-700 font-semibold text-xs">
          Remover
        </button>
      </td>
    `;
    compareTableBody.appendChild(row);
  });

  // Bind remove comparisons
  compareTableBody.querySelectorAll('[data-remove-compare-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = e.currentTarget.getAttribute('data-remove-compare-id');
      const prod = state.compareList.find(t => t.id === prodId);
      if (prod) {
        toggleCompare(prod);
        renderCompare();
      }
    });
  });

  if (clearCompareBtn) {
    clearCompareBtn.onclick = () => {
      state.compareList = [];
      updateCompareTabBadge();
      renderCompare();
    };
  }

  // Draw Comparison Chart.js
  drawComparisonChart();
}

// Draw Comparative Line Chart
function drawComparisonChart() {
  const ctx = document.getElementById('compareChartCanvas');
  if (!ctx) return;

  if (compareChartInstance) {
    compareChartInstance.destroy();
  }

  const colors = [
    { border: 'rgb(37, 99, 235)', bg: 'rgba(37, 99, 235, 0.1)' },
    { border: 'rgb(22, 163, 74)', bg: 'rgba(22, 163, 74, 0.1)' },
    { border: 'rgb(217, 119, 6)', bg: 'rgba(217, 119, 6, 0.1)' },
    { border: 'rgb(220, 38, 38)', bg: 'rgba(220, 38, 38, 0.1)' }
  ];

  const chartDatasets = state.compareList.map((product, idx) => {
    const color = colors[idx % colors.length];
    return {
      label: product.name,
      data: product.history.map(h => h.score),
      borderColor: color.border,
      backgroundColor: color.bg,
      tension: 0.3,
      fill: true,
      borderWidth: 2,
      pointRadius: 4,
    };
  });

  // Use the history dates of the first product as labels
  const labels = state.compareList[0]?.history.map(h => h.date) || [];

  compareChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: chartDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { size: 11, weight: 'bold' },
            color: '#1e293b'
          }
        },
        tooltip: {
          padding: 10,
          backgroundColor: '#0f172a'
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: '#f1f5f9' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

// Render Transparency & Sources Dashboard
function renderTransparency() {
  // Static statuses are displayed nicely in UI templates. No complex JS drawing needed as lists are pre-rendered.
}

// Detailed Ficha Modal logic
function openDetailModal(product) {
  state.selectedProduct = product;
  state.activeModalTab = 'score';

  const modal = document.getElementById('detailModal');
  if (!modal) return;

  // Set visual properties in modal
  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalCategory').textContent = product.category;
  
  const badgeClasses = {
    mercadolivre: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    shopee: 'bg-orange-50 text-orange-800 border-orange-200',
    amazon: 'bg-slate-100 text-slate-800 border-slate-200',
    facebook: 'bg-blue-50 text-blue-800 border-blue-200'
  };
  const friendlyPlatform = {
    mercadolivre: 'Mercado Livre',
    shopee: 'Shopee',
    amazon: 'Amazon',
    facebook: 'FB Marketplace'
  };

  const badgeEl = document.getElementById('modalPlatformBadge');
  badgeEl.className = `px-2.5 py-0.5 rounded-full border text-xs font-bold ${badgeClasses[product.marketplace]}`;
  badgeEl.textContent = friendlyPlatform[product.marketplace];

  // Price & Stats
  document.getElementById('modalPrice').textContent = `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  const growthVar = document.getElementById('modalGrowth');
  growthVar.textContent = `${product.interestVariation >= 0 ? '+' : ''}${product.interestVariation}%`;
  growthVar.className = `text-lg font-bold ${product.interestVariation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;

  document.getElementById('modalScore').textContent = `${product.trendScore} / 100`;
  document.getElementById('modalVolume').textContent = product.indicatorsCount.toLocaleString('pt-BR');
  document.getElementById('modalAdvertisers').textContent = product.advertisersCount ? product.advertisersCount.toLocaleString('pt-BR') : 'N/A';
  
  // Custom Opportunity Text
  document.getElementById('modalOpportunityConclusion').textContent = product.opportunityConclusion;

  // Active Regions
  const regionsContainer = document.getElementById('modalRegions');
  regionsContainer.innerHTML = (product.regions || ['Brasil']).map(r => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">${r}</span>`).join('');

  // Related Keywords
  const keywordsContainer = document.getElementById('modalKeywords');
  keywordsContainer.innerHTML = (product.relatedKeywords || [product.name]).map(k => `<span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">#${k}</span>`).join('');

  // Similar products
  const similarsContainer = document.getElementById('modalSimilars');
  similarsContainer.innerHTML = (product.similarProducts || []).map(s => `<li class="text-xs text-slate-600 flex items-center gap-1.5">
    <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
    ${s}
  </li>`).join('');

  // Reset Sub-tabs styling
  document.querySelectorAll('[data-modal-tab]').forEach(btn => {
    if (btn.getAttribute('data-modal-tab') === 'score') {
      btn.classList.add('border-blue-600', 'text-blue-600');
    } else {
      btn.classList.remove('border-blue-600', 'text-blue-600');
    }
  });

  updateModalCompareButtonState();

  // Show Modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Draw initial score chart
  updateModalChart();
}

function updateModalCompareButtonState() {
  const modalCompareBtn = document.getElementById('modalCompareBtn');
  if (!modalCompareBtn || !state.selectedProduct) return;

  const isAdded = state.compareList.some(item => item.id === state.selectedProduct.id);
  if (isAdded) {
    modalCompareBtn.textContent = 'Remover do Comparador';
    modalCompareBtn.className = 'px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded text-sm transition';
  } else {
    modalCompareBtn.textContent = 'Adicionar ao Comparador';
    modalCompareBtn.className = 'px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded text-sm transition';
  }
}

function updateModalChart() {
  const ctx = document.getElementById('modalChartCanvas');
  const product = state.selectedProduct;
  if (!ctx || !product) return;

  if (modalChartInstance) {
    modalChartInstance.destroy();
  }

  const labels = product.history.map(h => h.date);
  let datasetLabel = '';
  let dataPoints = [];
  let borderColor = '';
  let bgColor = '';

  if (state.activeModalTab === 'score') {
    datasetLabel = 'Índice de Tendência';
    dataPoints = product.history.map(h => h.score);
    borderColor = 'rgb(37, 99, 235)';
    bgColor = 'rgba(37, 99, 235, 0.1)';
  } else if (state.activeModalTab === 'price') {
    datasetLabel = 'Média de Preço (R$)';
    dataPoints = product.history.map(h => h.price);
    borderColor = 'rgb(22, 163, 74)';
    bgColor = 'rgba(22, 163, 74, 0.1)';
  } else if (state.activeModalTab === 'ads') {
    datasetLabel = 'Anúncios Mapeados';
    dataPoints = product.history.map(h => h.ads);
    borderColor = 'rgb(217, 119, 6)';
    bgColor = 'rgba(217, 119, 6, 0.1)';
  }

  modalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: datasetLabel,
        data: dataPoints,
        borderColor,
        backgroundColor: bgColor,
        tension: 0.3,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          grid: { color: '#f1f5f9' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  state.selectedProduct = null;
}

// Toggle Compare List
function toggleCompare(product) {
  const idx = state.compareList.findIndex(item => item.id === product.id);
  if (idx > -1) {
    state.compareList.splice(idx, 1);
  } else {
    if (state.compareList.length >= 4) {
      alert('Você pode comparar no máximo 4 produtos simultaneamente.');
      return;
    }
    state.compareList.push(product);
  }

  updateCompareTabBadge();
}

// Update Compare Badge Count
function updateCompareTabBadge() {
  const badge = document.getElementById('compareBadge');
  if (badge) {
    if (state.compareList.length > 0) {
      badge.textContent = state.compareList.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

// Update Top level statistics cards
function updateDashboardStats() {
  // Calculated stats based on state.trends
  const totalItems = state.trends.length;
  const avgTrendScore = totalItems > 0 ? Math.round(state.trends.reduce((acc, cur) => acc + cur.trendScore, 0) / totalItems) : 0;
  const totalVolume = state.trends.reduce((acc, cur) => acc + (cur.indicatorsCount || 0), 0);

  document.getElementById('statAvgScore').textContent = `${avgTrendScore} / 100`;
  document.getElementById('statTotalVolume').textContent = totalVolume.toLocaleString('pt-BR');
  document.getElementById('statActiveCount').textContent = totalItems;
}

// Header loading indicators
function showLoadingIndicator(show) {
  const spinner = document.getElementById('globalSpinner');
  if (spinner) {
    if (show) {
      spinner.classList.remove('hidden');
    } else {
      spinner.classList.add('hidden');
    }
  }
}

function showErrorMessage(msg) {
  const errContainer = document.getElementById('errorMessageContainer');
  if (errContainer) {
    if (msg) {
      errContainer.querySelector('p').textContent = msg;
      errContainer.classList.remove('hidden');
    } else {
      errContainer.classList.add('hidden');
    }
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Auto countdown clock for updates
function startCountdown() {
  setInterval(() => {
    if (state.countdown > 0) {
      state.countdown--;
      const min = Math.floor(state.countdown / 60);
      const sec = state.countdown % 60;
      document.getElementById('lastUpdatedTime').textContent = state.lastUpdated;
      document.getElementById('countdownTimer').textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
    } else {
      refreshTrends();
    }
  }, 1000);
}
