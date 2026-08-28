import React, { useState, FormEvent } from 'react';
import { Search, MapPin, Sliders, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import { ProductTrend, FacebookMarketplaceRegionFilter } from '../types';

interface FacebookRegionalModuleProps {
  onSelectProduct: (product: ProductTrend) => void;
}

export default function FacebookRegionalModule({ onSelectProduct }: FacebookRegionalModuleProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductTrend[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estados dos filtros regionais
  const [searchQuery, setSearchQuery] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [state, setState] = useState('SP');
  const [city, setCity] = useState('São Paulo');
  const [radius, setRadius] = useState(15);
  const [category, setCategory] = useState('Geral');

  const handleAnalyze = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/marketplace/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchQuery,
          country,
          state,
          city,
          radius,
          category
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao processar análise regional.');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro de conexão com o servidor de inteligência local.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Título e Subtítulo */}
      <div className="border-b border-[#E2E8F0] pb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Análise de Ocorrência Regional — Facebook Marketplace
        </h2>
        <p className="text-xs text-slate-500">
          Pesquise e analise produtos públicos anunciados em regiões geográficas específicas. Estima densidades de anúncios e ocorrências num raio selecionado.
        </p>
      </div>

      {/* Formulário de Configuração Regional */}
      <form onSubmit={handleAnalyze} className="bg-white border border-[#E2E8F0] rounded-lg p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* Palavra-chave */}
          <div className="space-y-1 md:col-span-2 lg:col-span-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Produto/Termo</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: iPhone, Bicicleta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* País / Estado */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estado (UF)</label>
            <input
              type="text"
              placeholder="Ex: SP, RJ, MG..."
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-blue-500"
              maxLength={2}
              required
            />
          </div>

          {/* Cidade */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cidade</label>
            <input
              type="text"
              placeholder="Ex: São Paulo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Raio */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Raio de Consulta</label>
              <span className="text-[10px] font-bold text-blue-600">{radius} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-md appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-blue-500 text-slate-700"
            >
              <option value="Geral">Todas as Categorias</option>
              <option value="Celulares">Celulares & Eletrônicos</option>
              <option value="Esportes e Lazer">Esportes & Lazer</option>
              <option value="Eletrodomésticos">Eletrodomésticos</option>
              <option value="Móveis">Móveis & Casa</option>
              <option value="Games e Consoles">Games & Consoles</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analisando Região...' : 'Mapear Atividade Local'}
          </button>
        </div>
      </form>

      {/* Resultados da Análise Regional */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-150 rounded-md flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {products.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Produtos mais recorrentes encontrados em **{city}, {state}**</span>
            <span className="font-semibold text-slate-700">{products.length} itens indexados</span>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <th className="p-3">Produto Relevante</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Preço Estimado</th>
                    <th className="p-3">Densidade de Anúncios</th>
                    <th className="p-3 text-center">Índice Tendência</th>
                    <th className="p-3 text-right pr-4">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.location}</div>
                      </td>
                      <td className="p-3 text-slate-500 text-xs">{p.category}</td>
                      <td className="p-3 font-mono text-xs font-bold text-slate-900">
                        {p.price ? `R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não Informado'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{p.indicatorsCount}</span>
                          <span className="text-[10px] text-slate-400">anúncios encontrados</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          p.trendLevel === 'Alta' ? 'bg-green-100 text-green-700' :
                          p.trendLevel === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {p.trendLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-4">
                        <button
                          onClick={() => onSelectProduct(p)}
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
        </div>
      ) : (
        !loading && (
          <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg p-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="w-8 h-8 text-blue-500/80" />
            <span className="font-semibold text-slate-700">Nenhuma análise regional executada para os parâmetros especificados.</span>
            <span>Configure a cidade/raio acima e clique em **Mapear Atividade Local**.</span>
          </div>
        )
      )}
    </div>
  );
}
