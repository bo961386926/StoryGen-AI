export interface Scene {
  sceneNumber: number;
  description: string;
  visualPrompt: string;
  generatedImageUrl?: string;
  isGenerating?: boolean;
}

export type ImageResolution = '1K' | '2K' | '4K';

export type ArtStyle = 
  | 'Cinematic' 
  | 'Photorealistic' 
  | 'Animated' 
  | 'Anime' 
  | 'Comic Book' 
  | 'Watercolor' 
  | 'Noir' 
  | 'Cyberpunk'
  | 'Line Art';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ScriptAnalysisResponse {
  scenes: {
    sceneNumber: number;
    description: string;
    visualPrompt: string;
  }[];
}