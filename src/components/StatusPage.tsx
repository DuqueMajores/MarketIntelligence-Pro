import { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, Info, Database } from 'lucide-react';
import { MarketplaceStatus } from '../types';

interface StatusPageProps {
  onRefresh: () => void;
  isUpdating: boolean;
}

export default function StatusPage({ onRefresh, isUpdating }: StatusPageProps) {
  const [status, setStatus] = useState<MarketplaceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Erro ao obter status das APIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getSourceTypeBadge = (type: string) => {
    switch (type) {
      case 'direct':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
            Conexão Direta (API Oficial)
          </span>
        );
      case 'alternative':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">
            Fonte Pública Alternativa
          </span>
        );
      case 'estimated':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
            Amostragem Pública Estimada
          </span>
        );
    }
  };

  return (
    <div id="sources-and-transparency" className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-3">
        <h1 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Fontes & Transparência</h1>
        <p className="mt-1 text-xs text-slate-500 max-w-3xl">
          Nossa plataforma é baseada na transparência e conformidade regulatória. Não possuímos banco de dados próprio para armazenar anúncios dos marketplaces. Todas as consultas são feitas em tempo real ou sob demanda, respeitando integralmente os termos de uso, robôs.txt e os limites das plataformas consultadas.
        </p>
      </div>

      {/* Grid de Informações de Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo - Tabela de Conectores */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Status dos Conectores Individuais
            </h2>
            <button
              onClick={() => { fetchStatus(); onRefresh(); }}
              disabled={loading || isUpdating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-[#E2E8F0] rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(loading || isUpdating) ? 'animate-spin' : ''}`} />
              Recarregar Conectores
            </button>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Carregando status dos serviços públicos...</div>
            ) : status ? (
              <div className="divide-y divide-slate-100">
                
                {/* Mercado Livre */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">Mercado Livre (MLB)</span>
                      {getSourceTypeBadge(status.mercadolivre.type)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Consulta via API pública de Tendências e Busca do Mercado Livre Brasil. Informações de volume e preço são diretamente obtidas em tempo real.
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>Limite: {status.mercadolivre.limit}</span>
                      <span>•</span>
                      <span>Origem: api.mercadolibre.com</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-green-700">Online e Direto</span>
                  </div>
                </div>

                {/* Shopee */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">Shopee Brasil</span>
                      {getSourceTypeBadge(status.shopee.type)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Mapeado a partir de feeds públicos de busca e estatísticas de volume de buscas fornecidas pelo widget de auto-complete.
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>Limite: {status.shopee.limit}</span>
                      <span>•</span>
                      <span>Origem: shopee.com.br/api/suggestions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-center">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-green-700">Estimado</span>
                  </div>
                </div>

                {/* Amazon */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">Amazon Brasil</span>
                      {getSourceTypeBadge(status.amazon.type)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Compilado em tempo de execução com base no RSS público e estatísticas de popularidade de produtos (Best Sellers Amazon).
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>Limite: {status.amazon.limit}</span>
                      <span>•</span>
                      <span>Origem: RSS Best Sellers Amazon</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-center">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-green-700">Estimado</span>
                  </div>
                </div>

                {/* Facebook Marketplace */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">Facebook Marketplace</span>
                      {getSourceTypeBadge(status.facebook.type)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Módulo regional que analisa a ocorrência de anúncios locais utilizando dados baseados em parâmetros geográficos públicos.
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>Limite: {status.facebook.limit}</span>
                      <span>•</span>
                      <span>Origem: Amostragem de Densidade Local</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-center">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-green-700">Estimado Regional</span>
                  </div>
                </div>

                {/* Meta Ads */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">Meta Ads Library</span>
                      {getSourceTypeBadge(status.metaads.type)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Análise de densidade de anúncios ativos para palavras-chave, indicando a força de tração de marketing patrocinado de cada item.
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>Limite: {status.metaads.limit}</span>
                      <span>•</span>
                      <span>Origem: Biblioteca de Anúncios Públicos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-center">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-green-700">Análise Ativa</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">Não foi possível obter os status.</div>
            )}
          </div>
        </div>

        {/* Lado Direito - Como Calculamos o Índice de Tendência */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Cálculo do Índice de Tendência
          </h2>

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-5 shadow-sm">
            <p className="text-xs text-slate-600 leading-relaxed">
              O **Índice de Tendência** é uma pontuação normalizada de 0 a 100 calculada em tempo real que reflete a atividade comercial e o crescimento de interesse por um determinado produto. O cálculo baseia-se em 4 eixos ponderados:
            </p>

            <div className="space-y-3.5">
              {/* Eixo 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-900">
                  <span>1. Crescimento da Procura</span>
                  <span className="text-blue-600">35% do peso</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                  <div className="bg-blue-600 h-full rounded" style={{ width: '35%' }}></div>
                </div>
                <p className="text-[10px] text-slate-400">Calculado a partir da variação do percentual de interesse em curto período.</p>
              </div>

              {/* Eixo 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-900">
                  <span>2. Densidade de Oferta</span>
                  <span className="text-blue-600">30% do peso</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                  <div className="bg-blue-600 h-full rounded" style={{ width: '30%' }}></div>
                </div>
                <p className="text-[10px] text-slate-400">Volume de anúncios encontrados ativamente nas plataformas.</p>
              </div>

              {/* Eixo 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-900">
                  <span>3. Anúncios Patrocinados</span>
                  <span className="text-blue-600">20% do peso</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                  <div className="bg-blue-600 h-full rounded" style={{ width: '20%' }}></div>
                </div>
                <p className="text-[10px] text-slate-400">Volume de atividade publicitária detectado via Meta Ads Library.</p>
              </div>

              {/* Eixo 4 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-900">
                  <span>4. Presença Multicanal</span>
                  <span className="text-blue-600">15% do peso</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                  <div className="bg-blue-600 h-full rounded" style={{ width: '15%' }}></div>
                </div>
                <p className="text-[10px] text-slate-400">Se o mesmo produto ou termo é encontrado simultaneamente em múltiplos marketplaces.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-start gap-2 bg-slate-50 p-3 rounded border border-[#E2E8F0]">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-[11px] font-bold text-slate-900">Classificação Visual do Nível</span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    <strong className="text-slate-800 font-semibold">Alta:</strong> Score &gt; 75 (Forte tendência)<br />
                    <strong className="text-slate-800 font-semibold">Média:</strong> Score de 41 a 75 (Estável)<br />
                    <strong className="text-slate-800 font-semibold">Baixa:</strong> Score ≤ 40 (Baixo interesse)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Nota Legal e de Conformidade */}
      <div className="bg-amber-50 text-amber-900 border border-amber-250 rounded-lg p-4 flex gap-3 shadow-2xs">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold">Nota Legal e Limitação de Responsabilidade</h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            As informações disponibilizadas neste portal são meras estimativas analíticas consolidadas de mercado com base em dados de acesso público e feeds de amostragem. Não garantimos volume absoluto de buscas ou faturamento de vendas reais, e não nos responsabilizamos por decisões comerciais tomadas baseadas nesses índices. Os logos e marcas pertencem aos seus respectivos proprietários (Facebook, Amazon, Mercado Livre, Shopee).
          </p>
        </div>
      </div>
    </div>
  );
}
