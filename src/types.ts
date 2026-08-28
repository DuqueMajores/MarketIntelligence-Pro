export interface ProductTrend {
  id: string;
  name: string;
  category: string;
  marketplace: 'facebook' | 'amazon' | 'mercadolivre' | 'shopee';
  indicatorsCount: number; // Quantidade de anúncios ou resultados
  price: number | null; // Preço médio
  interestVariation: number; // Variação de interesse (ex: +24%)
  trendLevel: 'Alta' | 'Média' | 'Baixa';
  trendScore: number; // Índice de Tendência de 0 a 100
  location: string; // Região da consulta
  lastUpdated: string; // Horário da última atualização
  isEstimated: boolean;
  sourceType: 'direct' | 'estimated' | 'alternative';
  sourceName: string;
  growthTrend: number; // Crescimento relativo %
  adIntensity: 'Alta' | 'Média' | 'Baixa' | 'Nenhuma';
  adVolume: number;
  advertisersCount: number;
  presenceCount: number; // Presença em múltiplos marketplaces
  presenceList: ('facebook' | 'amazon' | 'mercadolivre' | 'shopee')[];
  regions: string[];
  relatedKeywords: string[];
  similarProducts: string[];
  opportunityConclusion: string;
  history: {
    date: string;
    score: number;
    price: number | null;
    ads: number | null;
  }[];
}

export interface FilterParams {
  searchQuery: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  location: string;
  period: 'all' | '24h' | '7d' | '30d';
  marketplace: 'all' | 'facebook' | 'amazon' | 'mercadolivre' | 'shopee';
  trendLevel: 'all' | 'Alta' | 'Média' | 'Baixa';
}

export interface FacebookMarketplaceRegionFilter {
  country: string;
  state: string;
  city: string;
  radius: number; // em km
  category: string;
}

export interface MarketReport {
  id: string;
  title: string;
  source: string; // ex: 'Loja Integrada', 'AdNabu'
  publishDate: string;
  summary: string;
  topCategories: string[];
  trendingProducts: string[];
  url: string;
  relevance: 'Alta' | 'Média';
}

export interface MarketplaceStatus {
  facebook: { online: boolean; message: string; type: string };
  amazon: { online: boolean; message: string; type: string };
  mercadolivre: { online: boolean; message: string; type: string };
  shopee: { online: boolean; message: string; type: string };
  metaads: { online: boolean; message: string; type: string };
  trends: { online: boolean; message: string; type: string };
}
