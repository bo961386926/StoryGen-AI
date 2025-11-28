import React, { useState } from 'react';
import { FileText, Loader2, Sparkles, Upload } from 'lucide-react';
import { Scene } from '../types';
import { analyzeScript } from '../services/geminiService';

interface ScriptAnalyzerProps {
  onAnalysisComplete: (scenes: Scene[]) => void;
}

const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [script, setScript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setScript(text);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!script.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const scenes = await analyzeScript(script);
      onAnalysisComplete(scenes);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze script. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white">Create Your Storyboard</h2>
        <p className="text-gray-400">Upload your script or paste it below to generate a visual scene sequence.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-1 shadow-lg">
        <div className="relative">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="INT. COFFEE SHOP - DAY&#10;&#10;A gloomy Monday morning. JOHN (30s) sits alone..."
            className="w-full h-64 bg-gray-950/50 text-gray-200 p-6 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm leading-relaxed"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload .txt
              <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={!script.trim() || isAnalyzing}
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Analyzing Script...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 group-hover:text-yellow-200 transition-colors" />
              Generate Scenes
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-gray-400">
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
             <FileText className="w-6 h-6 text-blue-400" />
           </div>
           <h3 className="text-white font-medium mb-2">1. Paste Script</h3>
           <p className="text-sm">Input your screenplay or narrative text.</p>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
             <Sparkles className="w-6 h-6 text-purple-400" />
           </div>
           <h3 className="text-white font-medium mb-2">2. Analyze</h3>
           <p className="text-sm">AI breaks it down into visual scenes.</p>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
             <Loader2 className="w-6 h-6 text-green-400" />
           </div>
           <h3 className="text-white font-medium mb-2">3. Visualize</h3>
           <p className="text-sm">Generate 1K, 2K, or 4K storyboard images.</p>
        </div>
      </div>
    </div>
  );
};

export default ScriptAnalyzer;