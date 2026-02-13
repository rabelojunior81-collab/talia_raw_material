
import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { MediaAsset, AssetLayout } from '../types';

export interface UIAsset extends MediaAsset {
  objectUrl: string; 
}

const generateContextualName = (type: string, prompt?: string, sessionTitle?: string): string => {
    const timestamp = Date.now().toString().slice(-4);
    let name = "";
    
    if (sessionTitle && sessionTitle !== "Nova Conversa") {
        name = sessionTitle.toLowerCase().replace(/\s+/g, '_').slice(0, 15);
    } else {
        name = "talia";
    }

    if (prompt) {
        // Extract 2-3 keywords from prompt
        const keywords = prompt.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(w => w.length > 3).slice(0, 2);
        if (keywords.length > 0) name += "_" + keywords.join('_');
    }

    const ext = type === 'video' ? 'mp4' : (type === 'audio' ? 'wav' : (type === 'imagem' || type === 'image' ? 'png' : 'md'));
    return `${name}_${timestamp}.${ext}`;
};

export const useMediaAssets = (sessionId: string | null) => {
  const assets = useLiveQuery<MediaAsset[]>(
    () => sessionId
      ? db.assets.where({ sessionId }).sortBy('createdAt')
      : Promise.resolve([]),
    [sessionId]
  ) || [];

  const [uiAssets, setUiAssets] = useState<UIAsset[]>([]);

  useEffect(() => {
    const newUiAssets = assets.map(asset => {
      let objectUrl = asset.url || '';
      if (asset.blob) {
        objectUrl = URL.createObjectURL(asset.blob);
      }
      return { ...asset, objectUrl };
    });

    setUiAssets(newUiAssets);

    return () => {
      newUiAssets.forEach(asset => {
        if (asset.blob && asset.objectUrl) {
          URL.revokeObjectURL(asset.objectUrl);
        }
      });
    };
  }, [assets]);

  const addAsset = async (file: File | Blob, type: MediaAsset['type'], source: MediaAsset['source'], metadata?: Partial<MediaAsset>) => {
    if (!sessionId) return;
    
    // Normalize types but preserve PDFs as documentos for UI grouping
    let normalizedType = type;
    const isPdf = file.type === 'application/pdf';
    
    if (type === 'image') normalizedType = 'imagem';
    if (type === 'text' || type === 'pdf' || isPdf) normalizedType = 'documento';
    if (type === 'code') normalizedType = 'codigo';

    const session = await db.sessions.get(sessionId);
    const fileName = (file as File).name || generateContextualName(normalizedType, metadata?.prompt, session?.title);
    
    // Default layout for new assets
    const defaultLayout: AssetLayout = {
      x: 50 + (assets.length * 20) % 300,
      y: 50 + (assets.length * 20) % 300,
      w: normalizedType === 'imagem' ? 300 : 400,
      h: normalizedType === 'imagem' ? 300 : 250,
      zIndex: assets.length + 1
    };

    const newAsset: MediaAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sessionId,
      type: normalizedType,
      blob: file,
      fileName,
      mimeType: file.type || (isPdf ? 'application/pdf' : 'text/plain'),
      source,
      createdAt: Date.now(),
      layout: defaultLayout,
      ...metadata
    };

    await db.assets.add(newAsset);
    return newAsset;
  };
  
  const addExternalAsset = async (url: string, type: MediaAsset['type'], title: string, source: MediaAsset['source'] = 'search') => {
      if (!sessionId) return;

      let normalizedType = type;
      if (type === 'image') normalizedType = 'imagem';

      const newAsset: MediaAsset = {
          id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          sessionId,
          type: normalizedType,
          url,
          fileName: title,
          mimeType: 'application/octet-stream',
          source,
          createdAt: Date.now(),
          layout: { x: 100, y: 100, w: 300, h: 300, zIndex: assets.length + 1 }
      };
      
      await db.assets.add(newAsset);
  };

  const updateAssetLayout = async (id: string, layout: Partial<AssetLayout>) => {
    const asset = await db.assets.get(id);
    if (asset) {
      await db.assets.update(id, {
        layout: { ...(asset.layout || { x: 0, y: 0, w: 200, h: 200, zIndex: 1 }), ...layout }
      });
    }
  };

  const deleteAsset = async (id: string) => {
    await db.assets.delete(id);
  };

  const updateAsset = async (id: string, data: Partial<MediaAsset>) => {
    await db.assets.update(id, data);
  };

  return {
    assets: uiAssets,
    addAsset,
    addExternalAsset,
    deleteAsset,
    updateAsset,
    updateAssetLayout
  };
};
