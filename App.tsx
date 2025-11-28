import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ScriptAnalyzer from './components/ScriptAnalyzer';
import StoryboardViewer from './components/StoryboardViewer';
import ChatWidget from './components/ChatWidget';
import { Scene } from './types';
import { KeyRound, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [scenes, setScenes] = useState<Scene[]>([]);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    setIsCheckingKey(true);
    try {
      const aiStudio = (window as any).aistudio;
      if (aiStudio && aiStudio.hasSelectedApiKey) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for development if window.aistudio is not injected
        console.warn("window.aistudio not found");
        setHasApiKey(false); 
      }
    } catch (e) {
      console.error("Error checking API key", e);
      setHasApiKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      const aiStudio = (window as any).aistudio;
      if (aiStudio && aiStudio.openSelectKey) {
        await aiStudio.openSelectKey();
        // Assume success as per instructions
        setHasApiKey(true);
      } else {
        alert("AI Studio environment not detected.");
      }
    } catch (e) {
      console.error("Error selecting key", e);
      // If "Requested entity was not found", reset.
      setHasApiKey(false);
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Initializing...</div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
           <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
             <KeyRound className="w-8 h-8 text-blue-400" />
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
           <p className="text-gray-400 mb-8">
             To use the high-fidelity <strong>Nano Banana Pro</strong> model for 4K generation, you must select a paid API key from a valid Google Cloud Project.
           </p>
           
           <button 
             onClick={handleSelectKey}
             className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
           >
             Select API Key
           </button>

           <a 
             href="https://ai.google.dev/gemini-api/docs/billing" 
             target="_blank" 
             rel="noreferrer"
             className="text-xs text-blue-400 hover:text-blue-300 underline block"
           >
             Read about Gemini API Billing
           </a>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {scenes.length === 0 ? (
        <ScriptAnalyzer onAnalysisComplete={setScenes} />
      ) : (
        <StoryboardViewer scenes={scenes} onBack={() => setScenes([])} />
      )}
      <ChatWidget />
    </Layout>
  );
};

export default App;