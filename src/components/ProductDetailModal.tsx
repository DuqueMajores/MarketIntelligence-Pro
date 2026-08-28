import { X, TrendingUp, DollarSign, Award, MapPin, Eye, ShoppingCart, HelpCircle, Layers, Link } from 'lucide-react';
import { ProductTrend } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ProductDetailModalProps {
  product: ProductTrend;
  onClose: () => void;
  onAddToCompare: (product: ProductTrend) => void;
  compareList: ProductTrend[];
}

export default function ProductDetailModal({ product, onClose, onAddToCompare, compareList }: ProductDetailModalProps) {
  const isAlreadyInCompare = compareList.some((p) => p.id === product.id);

  // Mapeamento visual de canais de marketplace
  const marketplaceNames: Record<string, string> = {
    mercadolivre: 'Mercado Livre',
    amazon: 'Amazon',
    shopee: 'Shopee',
    facebook: 'Facebook Marketplace'
  };

  const getMarketplaceBadge = (mp: string) => {
    switch (mp) {
      case 'mercadolivre':
        return <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase">Mercado Livre</span>;
      case 'amazon':
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase">Amazon</span>;
      case 'shopee':
        return <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase">Shopee</span>;
      case 'facebook':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase">Facebook</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-zinc-150 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Análise Detalhada de Tendência</span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
              <span className="text-xs font-medium text-zinc-500">{product.sourceName}</span>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 leading-tight">{product.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Grid de Metas / Indicadores Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Índice de Tendência */}
            <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-zinc-100 text-zinc-800 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Índice Tendência</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-semibold text-zinc-900">{product.trendScore}</span>
                  <span className={`text-xs font-semibold ${
                    product.trendLevel === 'Alta' ? 'text-red-600' :
                    product.trendLevel === 'Média' ? 'text-amber-600' : 'text-zinc-500'
                  }`}>{product.trendLevel}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Preço Médio */}
            <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-zinc-100 text-zinc-800 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Preço Médio</span>
                <div className="text-xl font-semibold text-zinc-900">
                  {product.price ? `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/D'}
                </div>
              </div>
            </div>

            {/* Card 3: Crescimento Relativo */}
            <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-zinc-100 text-zinc-800 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Crescimento</span>
                <div className="text-xl font-semibold text-emerald-600">
                  {product.interestVariation >= 0 ? '+' : ''}{product.interestVariation}%
                </div>
              </div>
            </div>

            {/* Card 4: Atividade Meta Ads */}
            <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-zinc-100 text-zinc-800 rounded-lg">
                <Eye className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Publicidade (Meta Ads)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-semibold text-zinc-900">{product.adVolume || 0}</span>
                  <span className="text-[10px] text-zinc-400">anúncios ativos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Histórico */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              Histórico de Variação do Índice
            </h3>
            <div className="bg-white border border-zinc-150 rounded-xl p-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={product.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#18181b' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#18181b" strokeWidth={2} dot={{ fill: '#18181b', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparativo de Canais de Venda e Preços */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ocorrências e Distribuição */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Canais e Presença</h4>
              <div className="border border-zinc-150 rounded-xl divide-y divide-zinc-100 overflow-hidden bg-zinc-50/20">
                <div className="p-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Marketplaces Identificados:</span>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {product.presenceList.map((mp, idx) => (
                      <span key={idx}>{getMarketplaceBadge(mp)}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Regiões com maior atividade:</span>
                  <div className="flex items-center gap-1 text-zinc-800 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{product.regions?.join(', ') || 'Nacional'}</span>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Anúncios / Resultados encontrados:</span>
                  <span className="font-semibold text-zinc-900">{product.indicatorsCount.toLocaleString('pt-BR')} anúncios</span>
                </div>
                <div className="p-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Anunciantes ativos estimados:</span>
                  <span className="font-semibold text-zinc-900">{product.advertisersCount} contas</span>
                </div>
              </div>
            </div>

            {/* Palavras-chave e Similares */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Keywords & Produtos Similares</h4>
              <div className="border border-zinc-150 rounded-xl p-4 space-y-4 bg-zinc-50/20">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Palavras-chave relacionadas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.relatedKeywords?.map((kw, idx) => (
                      <span key={idx} className="bg-white border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Modelos ou similares relacionados</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.similarProducts?.map((sim, idx) => (
                      <span key={idx} className="bg-white border border-zinc-200 text-zinc-800 px-2.5 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1">
                        <Layers className="w-3 h-3 text-zinc-400" />
                        {sim}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Oportunidade Comercial e Conclusão Objetiva */}
          <div className="bg-zinc-50/50 border border-zinc-150 rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              Oportunidade Comercial & Conclusão
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {product.opportunityConclusion}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 pt-1 border-t border-zinc-200">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>O Índice de Tendência é uma estimativa calculada sob demanda baseada unicamente nos dados públicos acessados no momento.</span>
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="p-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-zinc-50">
          <span className="text-[11px] text-zinc-400">Última verificação sob demanda: {product.lastUpdated}</span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => onAddToCompare(product)}
              disabled={isAlreadyInCompare}
              className="flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-semibold border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-zinc-300 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
            >
              {isAlreadyInCompare ? 'Adicionado ao Comparador' : 'Adicionar ao Comparador'}
            </button>
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
