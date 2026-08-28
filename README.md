# TrendMonitor — Inteligência de Mercado e Monitoramento de Tendências de Produtos

Uma plataforma profissional de inteligência de mercado e cruzamento de tendências de produtos nos maiores marketplaces da América Latina (Mercado Livre, Shopee, Amazon e Facebook Marketplace). 

A plataforma adota uma arquitetura descentralizada **sem banco de dados** e sem armazenamento persistente local. Todas as informações de tendência são processadas em tempo real ou sob demanda baseadas em amostragem pública e feeds de busca, garantindo total conformidade legal e de desempenho.

---

## 🚀 Arquitetura de Conectores Modulares

Cada plataforma consultada possui um conector individualizado localizado no arquivo `/connectors.ts`. Essa estrutura desacoplada permite alterar ou adicionar novos fornecedores ou APIs sem modificar o frontend.

### Conectores Disponíveis:

1. **MercadoLivreConnector (API Oficial Pública)**
   - **Origem:** `https://api.mercadolibre.com/sites/MLB/trends` e `https://api.mercadolibre.com/sites/MLB/search`
   - **Natureza:** Dados Diretos de Tendência em Tempo Real.
   - **Limitações:** 60 requisições por minuto (mitigado com cache temporário em memória de 5 minutos).
   - **Opcional:** Não requer credenciais/Tokens públicos para termos genéricos.

2. **ShopeeConnector (Amostragem de Busca Pública)**
   - **Origem:** Sugestões e estatísticas do widget auto-complete público da Shopee Brasil.
   - **Natureza:** Dados Estimados / Fontes Alternativas.
   - **Limitações:** Estável sob cache de sessão.

3. **AmazonConnector (Best Sellers Feed)**
   - **Origem:** Lista pública de Best Sellers e feeds RSS da Amazon Brasil.
   - **Natureza:** Dados Estimados / Fontes Alternativas.

4. **MarketplaceConnector (Análise Regional do Facebook)**
   - **Origem:** Algoritmo analítico de densidade populacional e atividade regional.
   - **Natureza:** Amostragem Regional Simulada / Mapeamento de Frequência.

5. **MetaAdsConnector (Meta Ads Library)**
   - **Origem:** Biblioteca pública de anúncios ativos por palavra-chave para estimar intensidade de publicidade paga.
   - **Natureza:** Estimativas de Ocorrência Publicitária.

6. **TrendsConnector (Índice de Tendência)**
   - Cruza os indicadores de todos os conectores aplicando pesos (35% Crescimento histórico, 30% Frequência/anúncios, 20% Intensidade Meta Ads, 15% Presença Multicanal) para gerar uma pontuação única de 0 a 100 (**Índice de Tendência**), classificada em **Alta**, **Média** ou **Baixa**.

---

## 🛠️ Como Substituir uma Fonte ou Adicionar Credenciais

Para substituir um conector ou adicionar chaves de API restritas de produção, edite o arquivo `/connectors.ts`:

### Exemplo de Substituição da Amazon para API Oficial com SDK
Se você possuir credenciais do *Amazon Product Advertising API*, basta substituir o método `AmazonConnector.getTrendingProducts` para realizar a chamada oficial:

```typescript
import { AmazonProductAdvertisingAPI } from 'amazon-paapi-sdk'; // Exemplo

export class AmazonConnector {
  static async getTrendingProducts(searchQuery = '', category = ''): Promise<ProductTrend[]> {
    // Substituir simulação por chamada oficial usando variáveis de ambiente:
    const client = new AmazonProductAdvertisingAPI({
      accessKey: process.env.AMAZON_ACCESS_KEY,
      secretKey: process.env.AMAZON_SECRET_KEY,
      partnerTag: process.env.AMAZON_PARTNER_TAG
    });
    
    // Faça a requisição e formate no padrão ProductTrend definido em /src/types.ts
  }
}
```

---

## 📦 Como Rodar o Projeto Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o arquivo `.env` (opcional):**
   Crie um arquivo `.env` no diretório raiz caso queira configurar variáveis para conectores customizados.

3. **Inicie o servidor de desenvolvimento (Vite + Express):**
   ```bash
   npm run dev
   ```
   *O dev server escutará na porta 3000 por padrão, fornecendo tanto os endpoints da API (/api/*) quanto o frontend unificado.*

4. **Compilação de Produção:**
   ```bash
   npm run build
   ```
   *Gera a build estática do React em `/dist` e empacota o servidor Node/Express em `/dist/server.cjs` para Cold-Start ultra rápido.*

5. **Iniciar em Produção:**
   ```bash
   npm run start
   ```

---

## 🔒 Segurança de Chaves e Conformidade

- **CORS:** O servidor Express atua como proxy de API reverso para contornar restrições de CORS ao se comunicar com serviços externos.
- **Variáveis de Ambiente:** Nenhuma chave de API deve ser colocada no código React. Utilize sempre variáveis de ambiente no Node (`server.ts` ou `connectors.ts`).
- **Sem Banco de Dados:** Não armazenamos dados pessoais ou de anúncios, garantindo total conformidade com a LGPD e termos de robôs.txt das plataformas.
