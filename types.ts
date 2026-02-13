
export interface GroundingSource {
  uri: string;
  title: string;
}

export type Mode = 'Âncora' | 'Tradutora';
export type AutonomyMode = 'Co-Autor' | 'Talia Solo';
export type AssetCategory = 'video' | 'audio' | 'image' | 'pdf' | 'text' | 'code' | 'imagem' | 'documento' | 'codigo';

export interface AssetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

export type LayoutAtivo = AssetLayout;

export interface ImageGenerationConfig {
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  imageSize: "1K" | "2K" | "4K";
  prompt: string;
}

export interface MediaAsset {
  id: string;
  sessionId: string;
  type: AssetCategory;
  blob?: Blob | File;
  url?: string;
  fileName: string;
  mimeType: string;
  source: 'user_upload' | 'generated' | 'search' | 'usuario' | 'gerado' | 'busca';
  createdAt: number;
  prompt?: string;
  layout?: AssetLayout;
  analysis?: string; // Cache de análise da Talia para onisciência
}

export type AtivoMultimidia = MediaAsset;

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'model';
  text: string;
  mediaAssets?: Blob[];
  timestamp: number;
  sources?: GroundingSource[];
  isActionLog?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
}

export interface Session {
  id: string;
  projectId: string; 
  title: string;
  createdAt: number;
  mode: Mode;
  autonomyMode?: AutonomyMode;
  lastMessagePreview?: string;
  translationData?: any;
  isCustomTitle?: boolean; // Define se o usuário renomeou manualmente
}

export interface ArchivedDocument {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export type DocumentoArquivado = ArchivedDocument;

export interface ReportableTask {
  taskDescription: string;
  resultContent: string;
}

// Global type declarations for browser extensions
declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
      hasSelectedApiKey: () => Promise<boolean>;
    };
  }
}
