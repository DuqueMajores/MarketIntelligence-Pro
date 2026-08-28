import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Award, 
  Activity, 
  RefreshCw, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  SlidersHorizontal, 
  Filter, 
  Database, 
  BookOpen, 
  BarChart3, 
  Sparkles,
  ChevronRight,
  X,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { ProductTrend, FilterParams } from './types';
import StatusPage from './components/StatusPage';
import MarketReportsModule from './components/MarketReportsModule';
import FacebookRegionalModule from './components/FacebookRegionalModule';
import ProductDetailModal from './components/ProductDetailModal';
import ProductCompare from './components/ProductCompare';

export default function App() {
  // Estado de Navegação / Abas Ativas
  const [activeTab, setActiveTab] = useState<'dashboard' | 'regional' | 'reports' | 'compare' | 'sources'>('dashboard');

  // Dados de Tendências do Backend
  const [trends, setTrends] = useState<ProductTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Configuração de Atualização Automática
  const [autoUpdateInterval, setAutoUpdateInterval] = useState<number>(15); // em minutos, 0 para desativado
  const [countdown, setCountdown] = useState<number>(15 * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Estados dos Filtros Globais (Barra Superior)
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('Brasil');
  const [marketplaceFilter, setMarketplaceFilter] = useState<'all' | 'facebook' | 'amazon' | 'mercadolivre' | 'shopee'>('all');

  // Estados dos Filtros Laterais/Dashboard
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [trendLevelFilter, setTrendLevelFilter] = useState<'all' | 'Alta' | 'Média' | 'Baixa'>('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Paginação Progressiva
  const [visibleCount, setVisibleCount] = useState(8);

  // Modal de Detalhes
  const [selectedProduct, setSelectedProduct] = useState<ProductTrend | null>(null);

  // Lista de Comparação
  const [compareList, setCompareList] = useState<ProductTrend[]>([]);

  // Funções de busca de dados
  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('searchQuery', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (marketplaceFilter !== 'all') params.append('marketplace', marketplaceFilter);

      const res = await fetch(`/api/trends?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Falha ao conectar-se às fontes de tendências. Verifique sua conexão.');
      }
      const data: ProductTrend[] = await res.json();
      setTrends(data);
      setLastUpdated(new Date());
      setCountdown(autoUpdateInterval * 60);
    } catch (err: any) {
      console.error(err);
      setError('Algumas fontes podem estar temporariamente indisponíveis devido a limites de requisição públicos. O dashboard continua operacional com dados em cache local.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, locationFilter, marketplaceFilter, autoUpdateInterval]);

  // Hook para inicializar os dados
  useEffect(() => {
    fetchTrends();
  }, [categoryFilter, marketplaceFilter]); // Busca quando muda categoria ou marketplace selecionado na aba

  // Lógica do Timer de Atualização Automática
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (autoUpdateInterval > 0) {
      setCountdown(autoUpdateInterval * 60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchTrends();
            return autoUpdateInterval * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoUpdateInterval, fetchTrends]);

  // Formatar tempo restante
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Filtragem dos itens recebidos do backend no lado do cliente (para faixas de preço e nível de tendência)
  const filteredTrends = trends.filter((item) => {
    // Filtro de Preço
    if (minPrice !== '' && item.price !== null && item.price < Number(minPrice)) return false;
    if (maxPrice !== '' && item.price !== null && item.price > Number(maxPrice)) return false;
    
    // Filtro de Nível de Tendência
    if (trendLevelFilter !== 'all' && item.trendLevel !== trendLevelFilter) return false;

    return true;
  });

  // Operações de Comparação
  const handleAddToCompare = (product: ProductTrend) => {
    if (compareList.length >= 4) {
      alert('Você pode comparar no máximo 4 produtos simultaneamente para manter a clareza visual dos gráficos.');
      return;
    }
    if (!compareList.some((p) => p.id === product.id)) {
      setCompareList([...compareList, product]);
    }
  };

  const handleRemoveFromCompare = (id: string) => {
    setCompareList(compareList.filter((p) => p.id !== id));
  };

  // Cálculos de Estatísticas do Topo baseados nos dados atuais filtrados
  const getTopStats = () => {
    if (trends.length === 0) return null;

    // 1. Produto Nº 1 em Tendência
    const topTrend = [...trends].sort((a, b) => b.trendScore - a.trendScore)[0];

    // 2. Categoria em Alta (frequência)
    const catCounts: Record<string, number> = {};
    trends.forEach((t) => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Geral';

    // 3. Maior Crescimento de Interesse
    const maxGrowth = [...trends].sort((a, b) => b.interestVariation - a.interestVariation)[0];

    // 4. Mais Anunciado / Encontrado
    const mostAdvertised = [...trends].sort((a, b) => b.indicatorsCount - a.indicatorsCount)[0];

    // 5. Maior Presença nos canais
    const highestPresence = [...trends].sort((a, b) => b.presenceCount - a.presenceCount)[0];

    return {
      topTrend,
      topCategory,
      maxGrowth,
      mostAdvertised,
      highestPresence
    };
  };

  const stats = getTopStats();

  // Lista de Categorias Únicas para o Filtro Lateral
  const categories = ['all', 'Eletrônicos', 'Casa e Decoração', 'Beleza e Cuidado Pessoal', 'Moda e Acessórios', 'Celulares', 'Games', 'Esportes', 'Cozinha'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* 1. BARRA SUPERIOR E BARRA DE PESQUISA GLOBAL */}
      <header className="bg-white border-b border-[#E2E8F0] shadow-sm sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Logo / Nome do App */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-sm tracking-tighter">TNDX</div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">MarketIntelligence <span className="text-blue-600 font-medium">Pro</span></h1>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mt-0.5">Inteligência de Mercado</span>
              </div>
            </div>

            {/* BARRA DE PESQUISA GLOBAL */}
            <div className="flex-1 max-w-2xl flex flex-wrap sm:flex-nowrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquise um produto ou categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTrends()}
                  className="w-full pl-10 pr-4 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Seletor de Localização */}
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-xs px-2.5 py-1.5 focus:outline-none text-slate-700 font-medium"
              >
                <option value="Brasil">Brasil (Nacional)</option>
                <option value="São Paulo">São Paulo, SP</option>
                <option value="Rio de Janeiro">Rio de Janeiro, RJ</option>
                <option value="Minas Gerais">Belo Horizonte, MG</option>
                <option value="Paraná">Curitiba, PR</option>
              </select>

              {/* Seletor de Marketplace Principal */}
              <select
                value={marketplaceFilter}
                onChange={(e) => setMarketplaceFilter(e.target.value as any)}
                className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-xs px-2.5 py-1.5 focus:outline-none text-slate-700 font-medium"
              >
                <option value="all">Todos os Canais</option>
                <option value="mercadolivre">Mercado Livre</option>
                <option value="amazon">Amazon</option>
                <option value="shopee">Shopee</option>
                <option value="facebook">FB Marketplace</option>
              </select>

              {/* Botão Atualizar Agora */}
              <button
                onClick={fetchTrends}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-700 whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Atualizar dados agora"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {/* Controle de Auto-update */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={autoUpdateInterval}
                onChange={(e) => setAutoUpdateInterval(Number(e.target.value))}
                className="text-[11px] font-semibold text-slate-600 bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-1 rounded-md focus:outline-none"
              >
                <option value={0}>Sem auto-atualização</option>
                <option value={5}>Auto-update: 5m</option>
                <option value={15}>Auto-update: 15m</option>
                <option value={30}>Auto-update: 30m</option>
                <option value={60}>Auto-update: 60m</option>
              </select>

              {autoUpdateInterval > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono" title="Contagem regressiva para próxima consulta automática">
                  {formatCountdown()}
                </span>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 2. MENU PRINCIPAL (TABS) */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-1 py-1.5 overflow-x-auto scrollbar-none" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'dashboard' 
                  ? 'border-blue-600 text-blue-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Ranking & Tendências
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'regional' 
                  ? 'border-blue-600 text-blue-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Análise Regional FB
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'reports' 
                  ? 'border-blue-600 text-blue-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Estudos & Artigos
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                activeTab === 'compare' 
                  ? 'border-blue-600 text-blue-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Comparador
              {compareList.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {compareList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === 'sources' 
                  ? 'border-blue-600 text-blue-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Fontes & Transparência
            </button>
          </nav>
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL (DASHBOARD OU SUB-ABAS) */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        
        {/* Banner de erro ou rate limit mitigado */}
        {error && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 items-start shadow-2xs">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-semibold">Indisponibilidade Parcial de APIs / Limites de Consulta</span>
              <p className="text-amber-800 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* VIEW 1: PAINEL DE TENDÊNCIAS (DASHBOARD CENTRAL) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* CARDS RESUMIDOS (TOP STATS) */}
            {stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Card 1: Produto Nº 1 */}
                <div className="bg-white p-3 border border-[#E2E8F0] rounded-lg shadow-sm hover:border-slate-350 transition-colors flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Produto Nº 1 em Tendência</span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1" title={stats.topTrend.name}>
                      {stats.topTrend.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline justify-between mt-3 border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-450 font-medium">Score</span>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      {stats.topTrend.trendScore} pts
                    </span>
                  </div>
                </div>

                {/* Card 2: Categoria em Alta */}
                <div className="bg-white p-3 border border-[#E2E8F0] rounded-lg shadow-sm hover:border-slate-350 transition-colors flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Categoria em Alta</span>
                    <h3 className="text-xs font-bold text-slate-900 truncate mt-1">
                      {stats.topCategory}
                    </h3>
                  </div>
                  <div className="flex items-baseline justify-between mt-3 border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-450 font-medium">Densidade</span>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Alta Atividade
                    </span>
                  </div>
                </div>

                {/* Card 3: Maior Crescimento */}
                <div className="bg-white p-3 border border-[#E2E8F0] rounded-lg shadow-sm hover:border-slate-350 transition-colors flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Maior Crescimento</span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1" title={stats.maxGrowth.name}>
                      {stats.maxGrowth.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline justify-between mt-3 border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-450 font-medium">Impulso</span>
                    <span className="text-xs font-bold text-green-600 flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{stats.maxGrowth.interestVariation}%
                    </span>
                  </div>
                </div>

                {/* Card 4: Mais Anunciado */}
                <div className="bg-white p-3 border border-[#E2E8F0] rounded-lg shadow-sm hover:border-slate-350 transition-colors flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mais Anunciado</span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1" title={stats.mostAdvertised.name}>
                      {stats.mostAdvertised.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline justify-between mt-3 border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-450 font-medium">Anúncios</span>
                    <span className="text-xs font-bold text-slate-700">
                      {stats.mostAdvertised.indicatorsCount.toLocaleString('pt-BR')} itens
                    </span>
                  </div>
                </div>

                {/* Card 5: Presença Multicanal */}
                <div className="bg-white p-3 border border-[#E2E8F0] rounded-lg shadow-sm hover:border-slate-350 transition-colors flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Presença Cross-Market</span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1" title={stats.highestPresence.name}>
                      {stats.highestPresence.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline justify-between mt-3 border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-455 font-medium">Canais</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {stats.highestPresence.presenceCount}/4 marketplaces
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-24 bg-slate-50 border border-[#E2E8F0] rounded-lg animate-pulse"></div>
            )}

            {/* SEÇÃO PRINCIPAL COM FILTROS DE PESQUISA & TABELA DE TENDÊNCIAS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* COLUNA ESQUERDA - FILTROS LATERAIS */}
              <div className="lg:col-span-1 space-y-5">
                
                {/* Header Filtros */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-slate-500" />
                    Parâmetros de Filtro
                  </h2>
                </div>

                {/* Filtro por Categoria */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Categoria</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-blue-500 text-slate-700"
                  >
                    <option value="all">Todas as Categorias</option>
                    {categories.filter(c => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Faixa de Preço */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preço (R$)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                    />
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Filtro de Nível de Tendência */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nível de Tendência</label>
                  <div className="flex flex-wrap gap-1">
                    {(['all', 'Alta', 'Média', 'Baixa'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setTrendLevelFilter(level)}
                        className={`px-2 py-1.5 rounded-md text-xs font-semibold cursor-pointer border transition-all ${
                          trendLevelFilter === level
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-[#E2E8F0] hover:border-slate-300'
                        }`}
                      >
                        {level === 'all' ? 'Todos' : level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nota do Sistema */}
                <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg p-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    Sem Banco de Dados
                  </span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Todas as estimativas são processadas na sessão e consultadas ao vivo. Nenhuma informação é persistida.
                  </p>
                </div>

              </div>

              {/* COLUNA DIREITA - TABELA DE TENDÊNCIAS & RANKING */}
              <div className="lg:col-span-3 space-y-5">
                
                {/* Sub-Header Tabela */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Análise Unificada de Tendências ({filteredTrends.length} itens encontrados)
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Última verificação sob demanda: {lastUpdated.toLocaleTimeString('pt-BR')}
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-2 py-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="h-10 bg-slate-50 border border-[#E2E8F0] rounded-md animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredTrends.length > 0 ? (
                  <div className="space-y-4">
                    
                    {/* Lista / Tabela Minimalista */}
                    <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <th className="p-2.5 text-center w-12">Rank</th>
                              <th className="p-2.5">Produto</th>
                              <th className="p-2.5">Categoria</th>
                              <th className="p-2.5">Preço Médio</th>
                              <th className="p-2.5">Impulso Busca</th>
                              <th className="p-2.5 text-center">Nível / Score</th>
                              <th className="p-2.5 text-right pr-4">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredTrends.slice(0, visibleCount).map((item, index) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-2.5 text-center font-mono text-xs text-slate-500">
                                  {String(index + 1).padStart(2, '0')}
                                </td>
                                <td className="p-2.5">
                                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                    {item.name}
                                    {item.isEstimated && (
                                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded" title="Dado estimado via algoritmo alternativo">
                                        EST.
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                      {item.marketplace === 'mercadolivre' ? 'Mercado Livre' : item.marketplace}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                    <span className="text-[9px] text-slate-400">{item.location}</span>
                                  </div>
                                </td>
                                <td className="p-2.5 text-slate-500 font-medium text-xs">{item.category}</td>
                                <td className="p-2.5 font-mono text-xs text-slate-900 font-bold">
                                  {item.price ? `R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não Disponível'}
                                </td>
                                <td className="p-2.5 font-mono text-xs">
                                  <div className="flex items-center gap-1 text-green-600 font-bold">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>+{item.interestVariation}%</span>
                                  </div>
                                </td>
                                <td className="p-2.5 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                    item.trendLevel === 'Alta' ? 'bg-green-100 text-green-700' :
                                    item.trendLevel === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {item.trendLevel.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-2.5 text-right pr-4">
                                  <button
                                    onClick={() => setSelectedProduct(item)}
                                    className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md cursor-pointer transition-colors"
                                  >
                                    Analisar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Ver Mais / Carregamento Progressivo */}
                    {filteredTrends.length > visibleCount && (
                      <div className="flex justify-center pt-1">
                        <button
                          onClick={() => setVisibleCount(prev => prev + 6)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-[#E2E8F0] rounded-md cursor-pointer transition-colors"
                        >
                          Carregar Mais Resultados
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg p-10 text-center text-slate-400 text-xs">
                    Nenhum produto em alta localizado com os critérios de refinamento selecionados.
                  </div>
                )}

                {/* SEÇÃO OPORTUNIDADES & PRODUTOS EM ALTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  
                  {/* Produtos em Alta (Maior crescimento relativo) */}
                  <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Produtos em Alta (Crescimento Rápido)
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {[...trends]
                        .sort((a, b) => b.interestVariation - a.interestVariation)
                        .slice(0, 3)
                        .map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 block truncate max-w-[180px]">{item.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.marketplace} • {item.category}</span>
                            </div>
                            <span className="text-xs font-bold text-green-600 flex items-center shrink-0">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              +{item.interestVariation}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Oportunidades (Presentes simultaneamente em múltiplos marketplaces) */}
                  <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Oportunidades (Multicanais Ativos)
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {[...trends]
                        .filter(t => t.presenceCount > 1)
                        .slice(0, 3)
                        .map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 block truncate max-w-[180px]">{item.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Presente em {item.presenceCount} canais</span>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded shrink-0">
                              {item.trendScore} pts
                            </span>
                          </div>
                        ))}
                      {[...trends].filter(t => t.presenceCount > 1).length === 0 && (
                        <div className="py-6 text-center text-slate-400 text-xs">
                          Nenhuma duplicidade multicanal encontrada nesta amostragem.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: ANÁLISE REGIONAL DO FACEBOOK MARKETPLACE */}
        {activeTab === 'regional' && (
          <FacebookRegionalModule onSelectProduct={(p) => setSelectedProduct(p)} />
        )}

        {/* VIEW 3: ARTIGOS & RELATÓRIOS DO E-COMMERCE */}
        {activeTab === 'reports' && (
          <MarketReportsModule />
        )}

        {/* VIEW 4: COMPARADOR DE PRODUTOS */}
        {activeTab === 'compare' && (
          <ProductCompare 
            compareList={compareList} 
            onRemove={handleRemoveFromCompare} 
            onClearAll={() => setCompareList([])} 
          />
        )}

        {/* VIEW 5: FONTES & TRANSPARÊNCIA */}
        {activeTab === 'sources' && (
          <StatusPage onRefresh={fetchTrends} isUpdating={loading} />
        )}

      </main>

      {/* 4. RODAPÉ INSTITUCIONAL */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 block">MarketIntelligence Pro — Inteligência de Mercado</span>
            <p>Monitoramento sob demanda e cruzamento de tendências regionais e de e-commerce.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('sources')} className="hover:text-blue-600 transition-colors">Conectores Públicos</button>
            <span>•</span>
            <button onClick={() => setActiveTab('sources')} className="hover:text-blue-600 transition-colors">Fórmula do Índice</button>
            <span>•</span>
            <span className="text-slate-400">Dados de Amostragem Demonstrativa</span>
          </div>
        </div>
      </footer>

      {/* 5. MODAL DE DETALHES DE PRODUTO */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCompare={handleAddToCompare}
          compareList={compareList}
        />
      )}

    </div>
  );
}
