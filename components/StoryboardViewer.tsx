import React, { useState } from 'react';
import { Scene, ImageResolution, ArtStyle } from '../types';
import { generateSceneImage } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Wand2, RefreshCw, ChevronLeft, Palette, ChevronDown } from 'lucide-react';

interface StoryboardViewerProps {
  scenes: Scene[];
  onBack: () => void;
}

const STYLES: ArtStyle[] = [
  'Cinematic', 'Photorealistic', 'Animated', 'Anime', 
  'Comic Book', 'Watercolor', 'Noir', 'Cyberpunk', 'Line Art'
];

const StoryboardViewer: React.FC<StoryboardViewerProps> = ({ scenes: initialScenes, onBack }) => {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [style, setStyle] = useState<ArtStyle>('Cinematic');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const handleGenerateImage = async (index: number) => {
    const scene = scenes[index];
    if (scene.isGenerating) return;

    setScenes(prev => prev.map((s, i) => i === index ? { ...s, isGenerating: true } : s));

    try {
      const base64Image = await generateSceneImage(scene.visualPrompt, resolution, style);
      setScenes(prev => prev.map((s, i) => i === index ? { ...s, generatedImageUrl: base64Image, isGenerating: false } : s));
    } catch (error) {
      console.error(error);
      setScenes(prev => prev.map((s, i) => i === index ? { ...s, isGenerating: false } : s));
      // Optionally show error toast
    }
  };

  const handleGenerateAll = async () => {
    setIsBulkGenerating(true);
    // Process sequentially to handle concurrency nicely, or Promise.all if we want speed
    // Gemini quotas usually prefer sequential or small batches. Let's do batch of 3.
    
    // We only generate scenes that don't have images yet
    const indicesToGenerate = scenes
      .map((s, i) => (!s.generatedImageUrl ? i : -1))
      .filter(i => i !== -1);
    
    // Mark all as generating
    setScenes(prev => prev.map((s, i) => indicesToGenerate.includes(i) ? {...s, isGenerating: true} : s));

    // Simple sequential for safety
    for (const i of indicesToGenerate) {
       try {
         const base64Image = await generateSceneImage(scenes[i].visualPrompt, resolution, style);
         setScenes(prev => prev.map((s, idx) => idx === i ? { ...s, generatedImageUrl: base64Image, isGenerating: false } : s));
       } catch (e) {
         console.error(`Failed to generate scene ${i + 1}`, e);
         setScenes(prev => prev.map((s, idx) => idx === i ? { ...s, isGenerating: false } : s));
       }
    }
    
    setIsBulkGenerating(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-gray-900/80 p-6 rounded-2xl backdrop-blur border border-gray-800 sticky top-20 z-30 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Storyboard</h2>
            <p className="text-gray-400 text-sm">{scenes.length} Scenes Identified</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {/* Resolution Selector */}
           <div className="flex items-center gap-2 bg-gray-950 rounded-lg p-1 border border-gray-800">
             {['1K', '2K', '4K'].map((res) => (
               <button
                 key={res}
                 onClick={() => setResolution(res as ImageResolution)}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                   resolution === res 
                     ? 'bg-blue-600 text-white shadow' 
                     : 'text-gray-400 hover:text-white hover:bg-gray-800'
                 }`}
               >
                 {res}
               </button>
             ))}
           </div>
           
           {/* Style Selector */}
           <div className="relative group">
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
               <Palette className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
             </div>
             <select
               value={style}
               onChange={(e) => setStyle(e.target.value as ArtStyle)}
               className="appearance-none bg-gray-950 border border-gray-800 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 pr-10 py-2 w-full sm:w-40 cursor-pointer hover:border-gray-700 transition-colors"
             >
               {STYLES.map((s) => (
                 <option key={s} value={s} className="bg-gray-900 text-gray-100">
                   {s}
                 </option>
               ))}
             </select>
             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
               <ChevronDown className="w-4 h-4 text-gray-500" />
             </div>
           </div>

           <div className="h-8 w-px bg-gray-800 hidden sm:block"></div>

           <button
             onClick={handleGenerateAll}
             disabled={isBulkGenerating}
             className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-500 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-lg"
           >
             {isBulkGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
             Generate All Images
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {scenes.map((scene, index) => (
          <div key={scene.sceneNumber} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col group hover:border-gray-700 transition-colors">
            
            {/* Image Area */}
            <div className="aspect-video bg-gray-950 relative overflow-hidden">
              {scene.generatedImageUrl ? (
                <img 
                  src={scene.generatedImageUrl} 
                  alt={`Scene ${scene.sceneNumber}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-800">
                  <ImageIcon className="w-16 h-16 opacity-20" />
                </div>
              )}
              
              {scene.isGenerating && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                  <span className="text-xs text-blue-300 font-medium tracking-wide">RENDERING...</span>
                </div>
              )}
              
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white border border-white/10">
                SCENE {scene.sceneNumber}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
              <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1">
                {scene.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center gap-4">
                 <div className="text-xs text-gray-500 font-mono truncate flex-1">
                    {scene.visualPrompt}
                 </div>
                 <button
                   onClick={() => handleGenerateImage(index)}
                   disabled={scene.isGenerating}
                   className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg transition-colors flex-shrink-0 border border-gray-700"
                   title="Regenerate Image"
                 >
                   <RefreshCw className={`w-4 h-4 ${scene.isGenerating ? 'animate-spin' : ''}`} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryboardViewer;