import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { MarketReport } from '../types';

export default function MarketReportsModule() {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/market-reports');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error('Erro ao buscar relatórios de e-commerce:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Análises de Mercado & Relatórios Setoriais
          </h2>
          <p className="text-xs text-slate-500">
            Resumos consolidados de artigos públicos e estudos de tendências das principais autoridades em e-commerce.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-[#E2E8F0] rounded-md transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Relatórios
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Atualizando relatórios públicos...</div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-[#E2E8F0] rounded-lg p-4 hover:border-slate-350 transition-all flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                {/* Badge de Origem */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 tracking-wider uppercase">
                    {report.source}
                  </span>
                  <span className="text-[10px] text-slate-400">{report.publishDate}</span>
                </div>

                {/* Título */}
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{report.title}</h3>

                {/* Resumo */}
                <p className="text-xs text-slate-500 leading-relaxed">{report.summary}</p>

                {/* Categorias Quentes */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-700 block flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Categorias em Destaque:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {report.topCategories.map((cat, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-600 border border-[#E2E8F0] rounded px-2 py-0.5 text-[10px] font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Produtos Quentes */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-700 block flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    Produtos com Maior Conversão Estimada:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-1 pl-1">
                    {report.trendingProducts.map((prod, idx) => (
                      <li key={idx} className="leading-tight">
                        {prod}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botão de Link Externo Original */}
              <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-medium">Relevância: {report.relevance}</span>
                <a
                  href={report.url}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Ir para Artigo Completo
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-sm">Nenhum relatório encontrado.</div>
      )}
    </div>
  );
}
