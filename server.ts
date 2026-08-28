import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  TrendsConnector, 
  MarketplaceConnector, 
  MercadoLivreConnector, 
  ShopeeConnector, 
  AmazonConnector 
} from './connectors';
import { FacebookMarketplaceRegionFilter } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Habilitar processamento de JSON nas requisições
  app.use(express.json());

  // 1. ENDPOINTS DE API

  // Endpoint de integridade
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Endpoint de status das fontes e transparência
  app.get('/api/status', (req, res) => {
    res.json({
      facebook: { 
        online: true, 
        message: 'Amostragem Regional em Tempo Real', 
        type: 'estimated',
        limit: 'Ilimitado (Simulação Analítica)'
      },
      amazon: { 
        online: true, 
        message: 'Mapeamento de Best Sellers Públicos', 
        type: 'alternative',
        limit: 'Estável (Atualização Cacheada)'
      },
      mercadolivre: { 
        online: true, 
        message: 'API Oficial Pública do Mercado Livre', 
        type: 'direct',
        limit: '60 requisições por minuto (Rate limit controlado)'
      },
      shopee: { 
        online: true, 
        message: 'Feed de Sugestões de Busca Públicas', 
        type: 'alternative',
        limit: 'Estável (Atualização Cacheada)'
      },
      metaads: { 
        online: true, 
        message: 'Análise de Atividade Publicitária Estimada', 
        type: 'estimated',
        limit: 'Ilimitado (Algoritmo do Servidor)'
      },
      trends: { 
        online: true, 
        message: 'Índice Unificado de Tendências de Mercado', 
        type: 'direct',
        limit: 'Calculado Sob Demanda'
      }
    });
  });

  // Endpoint unificado de tendências (dashboard principal com busca e filtros)
  app.get('/api/trends', async (req, res) => {
    try {
      const searchQuery = (req.query.searchQuery as string) || '';
      const category = (req.query.category as string) || '';
      const location = (req.query.location as string) || 'Brasil';
      const marketplace = (req.query.marketplace as 'all' | 'facebook' | 'amazon' | 'mercadolivre' | 'shopee') || 'all';

      const data = await TrendsConnector.getUnifiedTrends(searchQuery, category, location, marketplace);
      res.json(data);
    } catch (error: any) {
      console.error('Erro ao buscar tendências unificadas:', error);
      res.status(500).json({ error: 'Erro interno ao processar tendências unificadas', details: error.message });
    }
  });

  // Endpoint específico para análise regional do Facebook Marketplace
  app.post('/api/marketplace/facebook', async (req, res) => {
    try {
      const { searchQuery, country, state, city, radius, category } = req.body;
      
      const regionFilter: FacebookMarketplaceRegionFilter = {
        country: country || 'Brasil',
        state: state || 'SP',
        city: city || 'São Paulo',
        radius: radius ? Number(radius) : 10,
        category: category || 'Geral'
      };

      const data = await MarketplaceConnector.getTrendingProducts(searchQuery || '', category || '', regionFilter);
      res.json(data);
    } catch (error: any) {
      console.error('Erro na análise regional do FB Marketplace:', error);
      res.status(500).json({ error: 'Erro ao processar análise do FB Marketplace', details: error.message });
    }
  });

  // Endpoint de relatórios e análises de artigos de e-commerce especializados
  app.get('/api/market-reports', (req, res) => {
    try {
      const reports = TrendsConnector.getMarketReports();
      res.json(reports);
    } catch (error: any) {
      console.error('Erro ao retornar relatórios de e-commerce:', error);
      res.status(500).json({ error: 'Erro ao obter relatórios de mercado' });
    }
  });


  // 2. MIDDLEWARE VITE E ARQUIVOS ESTÁTICOS

  if (process.env.NODE_ENV !== 'production') {
    // Configuração do Vite em modo desenvolvimento
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Configuração de produção para servir arquivos estáticos de compilação do Vite
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback de SPA do React para qualquer rota não tratada anteriormente
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 3. INICIALIZAÇÃO DO SERVIDOR
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OK] Servidor de Inteligência de Mercado escutando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ERRO] Falha ao iniciar o servidor:', err);
});
