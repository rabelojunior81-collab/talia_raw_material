import React, { useState } from 'react';
import Accordion from './Accordion';

const initialFormatConfig = {
    // Análise e Estratégia
    'Análise SWOT': {},
    'Análise PESTLE': {},
    'Mapeamento da Jornada do Cliente': {},
    'Matriz de Intake Estratégico': {},
    
    // Marketing de Conteúdo e SEO
    'Estratégia de Conteúdo (Pillar Page)': {},
    'Otimização de SEO (On-Page)': {},
    'Calendário Editorial': {},

    // Mídia Social e Performance
    'Plano de Campanha de Mídia Social': {},
    'Modelo de Anúncio de Performance (A/B)': {},
    'Modelo de Post para Comunidade': {},

    // Lançamentos e Influência
    'Planejamento de Lançamento (Infoproduto)': {},
    'Briefing de Campanha de Influenciador': {},
    'Análise de Plataformas de Infoprodutos': {},

    // Marketing Web3 e Cripto
    'Estratégia de Funil Web3': {},
    'Análise de Compliance Regulatório': {},
    'Plano de Conteúdo (DeFi/NFTs)': {},

    // Corporativo e Vendas
    'Proposta Comercial': {},
    'White Paper': {},
    'Apresentação (Pitch Deck)': {},
    'Pacote de Entrega de Campanha': {},
    'Documentação Técnica': {},
};

const SubHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="font-semibold text-red-400 px-2 mt-4 mb-2 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)] border-t border-white/10 pt-4 first:mt-0 first:border-t-0 first:pt-0">
        {children}
    </h3>
);


interface FormatsPanelProps {
    onGenerate: (config: any) => void;
}

const FormatsPanel: React.FC<FormatsPanelProps> = ({ onGenerate }) => {
    const [config, setConfig] = useState(initialFormatConfig);

    const handleCheckboxChange = (category: string, field: string, checked: boolean) => {
        setConfig(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: checked,
            }
        }));
    };

    const OptionCheckbox: React.FC<{ category: string, field: string, label: string; description?: string }> = ({ category, field, label, description }) => (
      <label className="flex items-start gap-3 p-2 hover:bg-white/5 cursor-pointer transition-colors">
        <input 
            type="checkbox" 
            checked={!!config[category]?.[field]}
            onChange={(e) => handleCheckboxChange(category, field, e.target.checked)}
            className="mt-1 flex-shrink-0 w-4 h-4 bg-gray-800 border-gray-600 rounded text-red-600 focus:ring-red-500 focus:ring-offset-0 focus:ring-2" 
        />
        <div className="flex-grow">
          <span className="text-gray-100 text-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{label}</span>
          {description && <p className="text-xs text-gray-300">{description}</p>}
        </div>
      </label>
    );

    return (
        <div className="flex flex-col h-full -mr-2 pr-2">
            <div className="flex-grow overflow-y-auto space-y-2 hide-scrollbar">
                <p className="text-sm text-gray-300 mb-4 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">Selecione e configure o arquétipo do documento a ser gerado, baseado no novo conhecimento da IA.</p>
                
                <Accordion title="Análise e Estratégia" defaultOpen>
                    <SubHeading>Análise SWOT</SubHeading>
                    <OptionCheckbox category="Análise SWOT" field="Forças (Interno)" label="Forças (Interno)" />
                    <OptionCheckbox category="Análise SWOT" field="Fraquezas (Interno)" label="Fraquezas (Interno)" />
                    <OptionCheckbox category="Análise SWOT" field="Oportunidades (Externo)" label="Oportunidades (Externo)" />
                    <OptionCheckbox category="Análise SWOT" field="Ameaças (Externo)" label="Ameaças (Externo)" />

                    <SubHeading>Análise PESTLE</SubHeading>
                    <OptionCheckbox category="Análise PESTLE" field="Fatores Políticos" label="Fatores Políticos" />
                    <OptionCheckbox category="Análise PESTLE" field="Fatores Econômicos" label="Fatores Econômicos" />
                    <OptionCheckbox category="Análise PESTLE" field="Fatores Sociais" label="Fatores Sociais" />
                    <OptionCheckbox category="Análise PESTLE" field="Fatores Tecnológicos" label="Fatores Tecnológicos" />
                    <OptionCheckbox category="Análise PESTLE" field="Fatores Legais (Ambientais)" label="Fatores Legais (Ambientais)" />
                    
                    <SubHeading>Mapeamento da Jornada do Cliente</SubHeading>
                    <OptionCheckbox category="Mapeamento da Jornada do Cliente" field="Definição da Buyer Persona" label="Definição da Buyer Persona" />
                    <OptionCheckbox category="Mapeamento da Jornada do Cliente" field="Mapeamento do Estado Atual" label="Mapeamento do Estado Atual (Touchpoints, Pain Points)" />
                    <OptionCheckbox category="Mapeamento da Jornada do Cliente" field="Mapeamento do Estado Futuro" label="Mapeamento do Estado Futuro (Experiência Ideal)" />
                    <OptionCheckbox category="Mapeamento da Jornada do Cliente" field="Plano de Oportunidade e Ação" label="Plano de Oportunidade e Ação" />
                    
                    <SubHeading>Matriz de Intake Estratégico (Briefing)</SubHeading>
                    <OptionCheckbox category="Matriz de Intake Estratégico" field="Objetivo de Negócio" label="Objetivo de Negócio" />
                    <OptionCheckbox category="Matriz de Intake Estratégico" field="Objetivo de Marketing (KPI)" label="Objetivo de Marketing (KPI)" />
                    <OptionCheckbox category="Matriz de Intake Estratégico" field="Público-Alvo (Persona)" label="Público-Alvo (Persona)" />
                    <OptionCheckbox category="Matriz de Intake Estratégico" field="Mensagem Central Única" label="Mensagem Central Única" />
                    <OptionCheckbox category="Matriz de Intake Estratégico" field="Canais de Distribuição" label="Canais de Distribuição" />
                    <OptionCheckbox category="Matriz de Intake Estratégico" field="Apelo à Ação (CTA)" label="Apelo à Ação (CTA)" />
                    <OptionCheckbox category="Matriz de Intake Estratégico" field="Restrições e Mandatórios" label="Restrições e Mandatórios" />
                </Accordion>

                <Accordion title="Marketing de Conteúdo e SEO">
                    <SubHeading>Estratégia de Conteúdo (Pillar Page)</SubHeading>
                    <OptionCheckbox category="Estratégia de Conteúdo (Pillar Page)" field="Definição da Pillar Page" label="Definição da Pillar Page (Tópico Principal)" />
                    <OptionCheckbox category="Estratégia de Conteúdo (Pillar Page)" field="Desenvolvimento de Topic Clusters" label="Desenvolvimento de Topic Clusters (Sub-tópicos)" />
                    <OptionCheckbox category="Estratégia de Conteúdo (Pillar Page)" field="Arquitetura de Linkagem Interna" label="Arquitetura de Linkagem Interna" />

                    <SubHeading>Otimização de SEO (On-Page)</SubHeading>
                    <OptionCheckbox category="Otimização de SEO (On-Page)" field="Pesquisa de Palavras-Chave" label="Pesquisa de Palavras-Chave" />
                    <OptionCheckbox category="Otimização de SEO (On-Page)" field="Análise de Intenção de Busca" label="Análise de Intenção de Busca" />
                    <OptionCheckbox category="Otimização de SEO (On-Page)" field="Otimização de Título e Descrição" label="Otimização de Título e Descrição (para Blog ou YouTube)" />
                    <OptionCheckbox category="Otimização de SEO (On-Page)" field="Sugestão de Legendas (CC) para Vídeo" label="Sugestão de Legendas (Closed Captions) para Vídeo" />

                    <SubHeading>Calendário Editorial</SubHeading>
                    <OptionCheckbox category="Calendário Editorial" field="Estrutura de Calendário" label="Estrutura de Calendário (Planilha)" />
                    <OptionCheckbox category="Calendário Editorial" field="Definição de Pilares de Conteúdo" label="Definição de Pilares de Conteúdo" />
                    <OptionCheckbox category="Calendário Editorial" field="Alinhamento com Funil (ToFu, MoFu, BoFu)" label="Alinhamento com Funil (ToFu, MoFu, BoFu)" />
                </Accordion>
                
                <Accordion title="Mídia Social e Performance">
                    <SubHeading>Plano de Campanha de Mídia Social</SubHeading>
                    <OptionCheckbox category="Plano de Campanha de Mídia Social" field="Definição de Sinais Prioritários por Plataforma" label="Definição de Sinais Prioritários (Ex: Saves, Comentários)" />
                    <OptionCheckbox category="Plano de Campanha de Mídia Social" field="Roteiro de Vídeo Curto (Reels/TikTok)" label="Roteiro de Vídeo Curto (Hook, Problema, Solução, CTA)" />
                    <OptionCheckbox category="Plano de Campanha de Mídia Social" field="Modelo de Carrossel (Narrativa Sequencial)" label="Modelo de Carrossel (Narrativa Sequencial)" />
                
                    <SubHeading>Modelo de Anúncio de Performance (A/B)</SubHeading>
                    <OptionCheckbox category="Modelo de Anúncio de Performance (A/B)" field="Matriz de Variações" label="Matriz de Variações (3x Imagens, 3x Headlines, 2x CTAs)" />
                    <OptionCheckbox category="Modelo de Anúncio de Performance (A/B)" field="Sugestão de Criativos" label="Sugestão de Criativos (Texto e Visual)" />

                    <SubHeading>Modelo de Post para Comunidade</SubHeading>
                    <OptionCheckbox category="Modelo de Post para Comunidade" field="Template de Anúncio (Discord/Telegram)" label="Template de Anúncio (Discord/Telegram)" />
                </Accordion>

                <Accordion title="Lançamentos e Influência">
                    <SubHeading>Planejamento de Lançamento (Infoproduto)</SubHeading>
                    <OptionCheckbox category="Planejamento de Lançamento (Infoproduto)" field="Fase de Pré-lançamento (Captura)" label="Fase de Pré-lançamento (Captura de Leads)" />
                    <OptionCheckbox category="Planejamento de Lançamento (Infoproduto)" field="Fase de Aquecimento (Nutrição)" label="Fase de Aquecimento (Conteúdo de Pré-Lançamento)" />
                    <OptionCheckbox category="Planejamento de Lançamento (Infoproduto)" field="Fase de Lançamento (Abertura do Carrinho)" label="Fase de Lançamento (Oferta, Bônus, Escassez)" />
                    
                    <SubHeading>Briefing de Campanha de Influenciador</SubHeading>
                    <OptionCheckbox category="Briefing de Campanha de Influenciador" field="Objetivo e KPIs" label="Objetivo e KPIs" />
                    <OptionCheckbox category="Briefing de Campanha de Influenciador" field="Mensagem Central e CTA" label="Mensagem Central e CTA" />
                    <OptionCheckbox category="Briefing de Campanha de Influenciador" field="Entregáveis (Deliverables)" label="Entregáveis (Deliverables)" />
                    <OptionCheckbox category="Briefing de Campanha de Influenciador" field="Diretrizes Criativas (Dos & Don'ts)" label="Diretrizes Criativas (Dos & Don'ts)" />

                    <SubHeading>Análise de Plataformas de Infoprodutos</SubHeading>
                    <OptionCheckbox category="Análise de Plataformas de Infoprodutos" field="Análise Comparativa de Taxas (Brasil)" label="Análise Comparativa de Taxas (Hotmart, Eduzz, etc.)" />
                    <OptionCheckbox category="Análise de Plataformas de Infoprodutos" field="Recomendação baseada no formato" label="Recomendação (E-book vs. Curso em Vídeo)" />
                </Accordion>

                <Accordion title="Marketing Web3 e Cripto">
                    <SubHeading>Estratégia de Funil Web3</SubHeading>
                    <OptionCheckbox category="Estratégia de Funil Web3" field="Mapeamento do Funil Invertido" label="Mapeamento do Funil Invertido (Foco em Comunidade)" />
                    <OptionCheckbox category="Estratégia de Funil Web3" field="Táticas para Geração de Hype (ToFu)" label="Táticas para Geração de Hype (ToFu)" />
                    <OptionCheckbox category="Estratégia de Funil Web3" field="Estratégias de Onboarding e Retenção (MoFu/BoFu)" label="Estratégias de Onboarding e Retenção (MoFu/BoFu)" />
                    
                    <SubHeading>Análise de Compliance Regulatório</SubHeading>
                    <OptionCheckbox category="Análise de Compliance Regulatório" field="Aplicação do Howey Test / Teste CVM" label="Análise Preliminar (Howey Test / Contrato de Investimento Coletivo)" />
                    <OptionCheckbox category="Análise de Compliance Regulatório" field="Diretrizes de Comunicação" label="Diretrizes de Comunicação (Foco em Utilidade vs. Especulação)" />

                    <SubHeading>Plano de Conteúdo (DeFi/NFTs)</SubHeading>
                    <OptionCheckbox category="Plano de Conteúdo (DeFi/NFTs)" field="Conteúdo Educacional (Analogias Simples)" label="Conteúdo Educacional (Analogias Simples)" />
                    <OptionCheckbox category="Plano de Conteúdo (DeFi/NFTs)" field="Explicação de Utilidade e Valor" label="Explicação de Utilidade e Valor" />
                    <OptionCheckbox category="Plano de Conteúdo (DeFi/NFTs)" field="Comunicação Transparente de Riscos" label="Comunicação Transparente de Riscos" />
                </Accordion>

                <Accordion title="Corporativo e Vendas">
                    <SubHeading>Proposta Comercial</SubHeading>
                    <OptionCheckbox category="Proposta Comercial" field="Estrutura Completa da Proposta" label="Estrutura Completa da Proposta" />
                    <OptionCheckbox category="Proposta Comercial" field="Declaração do Problema e Solução" label="Declaração do Problema e Solução" />
                    <OptionCheckbox category="Proposta Comercial" field="Cronograma e Preços" label="Cronograma e Preços" />
                    
                    <SubHeading>Apresentação (Pitch Deck)</SubHeading>
                    <OptionCheckbox category="Apresentação (Pitch Deck)" field="Slide de Título" label="Slide de Título" />
                    <OptionCheckbox category="Apresentação (Pitch Deck)" field="Slide de Problema e Solução" label="Slide de Problema e Solução" />
                    <OptionCheckbox category="Apresentação (Pitch Deck)" field="Slide de Dados e Projeções" label="Slide de Dados e Projeções" />
                    <OptionCheckbox category="Apresentação (Pitch Deck)" field="Slide de Equipe" label="Slide de Equipe" />
                    
                    <SubHeading>Pacote de Entrega de Campanha</SubHeading>
                    <OptionCheckbox category="Pacote de Entrega de Campanha" field="Guia de Uso Estratégico" label="Guia de Uso Estratégico (Ligando Ativos a KPIs)" />
                    <OptionCheckbox category="Pacote de Entrega de Campanha" field="Estrutura de Pastas e Nomenclatura" label="Blueprint de Estrutura de Pastas e Nomenclatura" />
                </Accordion>
            </div>
             <div className="pt-4 mt-auto flex-shrink-0">
                 <button 
                    onClick={() => onGenerate(config)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 transition-colors [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                 >
                    Gerar Documento
                </button>
            </div>
        </div>
    );
};

export default FormatsPanel;