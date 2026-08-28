import { X, TrendingUp, DollarSign, LayoutGrid, Award, ShoppingCart, BarChart2 } from 'lucide-react';
import { ProductTrend } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ProductCompareProps {
  compareList: ProductTrend[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function ProductCompare({ compareList, onRemove, onClearAll }: ProductCompareProps) {
  
  if (compareList.length === 0) {
    return (
      <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg p-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
        <LayoutGrid className="w-8 h-8 text-blue-500/80" />
        <span className="font-semibold text-slate-700">O comparador de produtos está vazio.</span>
        <span>Clique em **Analisar** em qualquer produto no ranking e selecione **Adicionar ao Comparador**.</span>
      </div>
    );
  }

  // Prepara dados para o gráfico comparativo de histórico de Score
  // Junta os históricos de cada produto por data
  const datesSet = new Set<string>();
  compareList.forEach((p) => {
    p.history?.forEach((h) => datesSet.add(h.date));
  });

  const chartData = Array.from(datesSet).map((date) => {
    const entry: Record<string, any> = { date };
    compareList.forEach((p) => {
      const histItem = p.history?.find((h) => h.date === date);
      entry[p.name] = histItem ? histItem.score : p.trendScore;
    });
    return entry;
  });

  const colors = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div id="product-comparer" className="space-y-6">
      
      {/* Header com Ações */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            Comparativo de Desempenho e Viabilidade
          </h2>
          <p className="text-xs text-slate-500">
            Compare o Índice de Tendência, Preço e Atividade Comercial de múltiplos produtos selecionados.
          </p>
        </div>
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
        >
          Limpar Todos ({compareList.length})
        </button>
      </div>

      {/* Grid Lateral de Comparison e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo - Gráfico Multi-Linhas */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Histórico de Tendência Comparado</h3>
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {compareList.map((p, idx) => (
                  <Line
                    key={p.id}
                    type="monotone"
                    dataKey={p.name}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[idx % colors.length], strokeWidth: 1, r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lado Direito - Atributos rápidos comparados */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Itens Comparados ({compareList.length})</h3>
          
          <div className="space-y-3">
            {compareList.map((p, idx) => (
              <div key={p.id} className="bg-white border border-[#E2E8F0] rounded-lg p-3 relative flex flex-col justify-between hover:border-slate-350 transition-colors shadow-sm">
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded transition-colors"
                  title="Remover"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{p.marketplace.toUpperCase()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pr-5 truncate">{p.name}</h4>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Score</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        <span className="font-bold text-slate-950">{p.trendScore}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Preço Médio</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-slate-950">
                          {p.price ? `R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/D'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Tabela de Comparação Estruturada */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                <th className="p-3 w-1/4">Atributo</th>
                {compareList.map((p, idx) => (
                  <th key={p.id} className="p-3 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                      <span className="truncate max-w-[150px]">{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {/* Marketplace de Origem */}
              <tr className="hover:bg-slate-55/20">
                <td className="p-3 font-medium text-slate-500">Marketplace Original</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 font-semibold text-slate-800 capitalize">
                    {p.marketplace === 'mercadolivre' ? 'Mercado Livre' : p.marketplace}
                  </td>
                ))}
              </tr>
              {/* Categoria */}
              <tr className="hover:bg-slate-55/20">
                <td className="p-3 font-medium text-slate-500">Categoria</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-slate-600">
                    {p.category}
                  </td>
                ))}
              </tr>
              {/* Preço Médio */}
              <tr className="hover:bg-slate-55/20">
                <td className="p-3 font-medium text-slate-500">Preço Médio</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 font-bold text-slate-900 font-mono">
                    {p.price ? `R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não Informado'}
                  </td>
                ))}
              </tr>
              {/* Índice Tendência */}
              <tr className="hover:bg-slate-55/20">
                <td className="p-3 font-medium text-slate-500">Índice de Tendência</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.trendLevel === 'Alta' ? 'bg-green-100 text-green-700' :
                      p.trendLevel === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {p.trendLevel.toUpperCase()}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Crescimento Relativo */}
              <tr className="hover:bg-slate-55/20">
                <td className="p-3 font-medium text-slate-500">Crescimento de Interesse</td>
                {compareList.map((p) => (
                  <td key={p.id} className={`p-3 font-bold font-mono ${p.interestVariation >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {p.interestVariation >= 0 ? '+' : ''}{p.interestVariation}%
                  </td>
                ))}
              </tr>
              {/* Anúncios Totais */}
              <tr className="hover:bg-slate-55/20">
                <td className="p-3 font-medium text-slate-500">Anúncios Localizados</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-slate-800 font-mono">
                    {p.indicatorsCount.toLocaleString('pt-BR')}
                  </td>
                ))}
              </tr>
              {/* Presença Multicanal */}
              <tr className="hover:bg-slate-55/20">
                <td className="p-3 font-medium text-slate-500">Presença de Mercado</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-slate-700 text-xs">
                    Presença em **{p.presenceCount}** marketplace(s)
                    <div className="flex gap-1 mt-1 font-bold uppercase text-[9px] text-slate-400">
                      {p.presenceList.join(', ')}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Qualidade e Conclusão */}
              <tr className="hover:bg-slate-55/20">
                <td className="p-3 font-medium text-slate-500">Conclusão Analítica</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-3 text-slate-500 leading-normal max-w-[250px] text-xs">
                    {p.opportunityConclusion}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
