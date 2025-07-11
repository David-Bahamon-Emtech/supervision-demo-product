// src/components/Manage/AITemplateCreatorModal.js - THEMED VERSION
import React, { useState, useEffect, useRef } from 'react';

const AITemplateCreatorModal = ({ isOpen, onClose, onSaveTemplate, currentAIMode }) => {
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorAI, setErrorAI] = useState(null);
  
  const TYPING_SPEED_NORMAL = 30;

  const typewriterIntervalRef = useRef(null);
  const conversationEndRef = useRef(null);

  const availableTemplateTypes = [
    "Compliance Checklist", "Communication Template", "Procedural Document",
    "Policy Document", "Risk Assessment Form", "Other",
  ];

  useEffect(() => {
    if (isOpen && conversationHistory.length === 0) {
      setConversationHistory([
        { id: `welcome_${Date.now()}`, sender: 'ai', message: "Welcome to EMTECH Intelligence! How can I help you create a template today? Please select a Template Type and enter a name before generating for best results." }
      ]);
    }
  }, [isOpen, conversationHistory.length]);

  useEffect(() => {
    if (conversationEndRef.current) {
        conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);


  const callAIGenerationAPI = async (promptToUse, isRegeneration = false, conversationHistoryForAPI = []) => {
    setIsLoadingAI(true);
    setErrorAI(null);
    if (!isRegeneration) setGeneratedContent('');

    const streamingMessageId = `ai_stream_${Date.now()}`;
    setConversationHistory(prev => [ ...prev, { sender: 'ai', message: '', id: streamingMessageId, isStreaming: true } ]);

    let accumulatedText = '', displayedText = '', pendingChunks = [], currentChunkIndex = 0, currentCharIndex = 0;

    const typewriterEffect = () => {
      if (currentChunkIndex < pendingChunks.length) {
        const currentChunk = pendingChunks[currentChunkIndex];
        if (currentCharIndex < currentChunk.length) {
          displayedText += currentChunk.charAt(currentCharIndex++);
          setConversationHistory(prev => prev.map(entry => entry.id === streamingMessageId ? { ...entry, message: displayedText } : entry ));
        } else {
          currentChunkIndex++;
          currentCharIndex = 0;
        }
      }
    };

    const requestBody = {
        prompt: promptToUse,
        history: conversationHistoryForAPI.filter(e => (e.sender === 'user' || e.sender === 'ai') && typeof e.message === 'string'),
        templateType: templateType || ''
    };

    let reader;
    try {
        const response = await fetch('http://localhost:3001/api/templates/generate-ai', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
        });
        if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `HTTP ${response.status}`);
        if (!response.body) throw new Error('ReadableStream not supported');
        
        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        typewriterIntervalRef.current = setInterval(typewriterEffect, TYPING_SPEED_NORMAL);

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let eolIndex;
            while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
                const line = buffer.substring(0, eolIndex).trim();
                buffer = buffer.substring(eolIndex + 2);
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.substring(5).trim());
                        if (json.textChunk) { accumulatedText += json.textChunk; pendingChunks.push(json.textChunk); }
                        else if (json.error) throw new Error(json.error);
                    } catch (e) { console.warn('Error parsing stream:', e); }
                }
            }
        }
    } catch (err) {
        setErrorAI(err.message || "Streaming connection failed.");
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
        setConversationHistory(prev => prev.map(e => e.id === streamingMessageId ? { ...e, isStreaming: false, message: `${e.message}\n\n[Error: ${err.message}]` } : e));
    } finally {
        if (reader) reader.releaseLock();
        const finalize = () => {
          if (currentChunkIndex >= pendingChunks.length) {
            if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
            setGeneratedContent(accumulatedText);
            setConversationHistory(prev => prev.map(e => e.id === streamingMessageId ? { ...e, isStreaming: false, message: accumulatedText } : e));
            setIsLoadingAI(false);
            if (!isRegeneration) setCurrentPrompt('');
          } else {
            setTimeout(finalize, 100);
          }
        };
        finalize();
    }
  };

  const handleSendPrompt = () => {
    if (!currentPrompt.trim()) return;
    const hasMetadataWarning = !templateName.trim() || !templateType.trim();
    setErrorAI(hasMetadataWarning ? "Please enter a Template Name and select a Type for best results." : null);
    
    const userMessage = { id: `user_${Date.now()}`, sender: 'user', message: currentPrompt };
    const historyUpdate = hasMetadataWarning ? [ { id: `system_${Date.now()}`, sender: 'system', message: `Reminder: Name and Type are recommended.` }, userMessage] : [userMessage];
    setConversationHistory(prev => [...prev, ...historyUpdate]);
    callAIGenerationAPI(currentPrompt, false, conversationHistory);
  };

  const handleRegenerate = () => {
    const lastUserPrompt = [...conversationHistory].reverse().find(e => e.sender === 'user');
    if (!lastUserPrompt) return setErrorAI("No previous prompt found to regenerate.");
    const historyForRegen = conversationHistory.slice(0, conversationHistory.lastIndexOf(lastUserPrompt));
    setErrorAI(!templateName.trim() || !templateType.trim() ? "Please ensure Name and Type are set for optimal regeneration." : null);
    setConversationHistory(prev => [ ...prev, { id: `system_${Date.now()}`, sender: 'system', message: `Regenerating for: "${lastUserPrompt.message}"...` } ]);
    callAIGenerationAPI(lastUserPrompt.message, true, historyForRegen);
  };

  const handleAcceptAndSave = async () => {
    if (!templateName.trim() || !templateType.trim() || !generatedContent.trim()) return;
    setIsSaving(true);
    setErrorAI(null);
    const promptUsed = conversationHistory.filter(e => e.sender === 'user').map(e => e.message).join('\n---\nRefinement: ');
    try {
      const response = await fetch('http://localhost:3001/api/templates/save-ai-generated', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName, templateType, textContent: generatedContent, generatedBy: `AI Assistant (${currentAIMode || 'Gemini'})`, promptUsed }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Error: ${response.status}`);
      onSaveTemplate(result.template);
      alert(result.message || "Template saved!");
      handleClose();
    } catch (err) {
      setErrorAI(err.message || "Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    setTemplateName(''); setTemplateType(''); setCurrentPrompt(''); setConversationHistory([]);
    setGeneratedContent(''); setIsLoadingAI(false); setIsSaving(false); setErrorAI(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-theme-border">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-theme-text-primary">Create Template with AI Assistant</h2>
            <button onClick={handleClose} className="text-theme-text-secondary hover:text-white text-2xl">×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="templateName" className="block text-sm font-medium text-theme-text-secondary">Template Name <span className="text-red-500">*</span></label>
                <input type="text" id="templateName" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                    className="mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent"
                    placeholder="e.g., AML Policy Review" disabled={isSaving || isLoadingAI}/>
            </div>
            <div>
                <label htmlFor="templateType" className="block text-sm font-medium text-theme-text-secondary">Template Type <span className="text-red-500">*</span></label>
                <select id="templateType" value={templateType} onChange={(e) => setTemplateType(e.target.value)}
                    className="mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent" disabled={isSaving || isLoadingAI}>
                    <option value="">-- Select Type --</option>
                    {availableTemplateTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
            </div>
        </div>

        <div className="flex-grow bg-theme-bg p-3 rounded-md mb-4 overflow-y-auto border border-theme-border min-h-[250px] flex flex-col">
            <div className="flex-grow">
                {conversationHistory.map((entry) => (
                    <div key={entry.id} className={`mb-3 clear-both flex ${ 
                        entry.sender === 'user' ? 'justify-end' : 
                        entry.sender === 'system' ? 'justify-center italic text-theme-text-secondary text-xs' : 'justify-start'
                    }`}>
                        <div className={`inline-block p-2 px-3 rounded-lg shadow-sm max-w-[90%] break-words ${
                            entry.sender === 'user' ? 'bg-theme-accent text-sidebar-bg rounded-br-none' :
                            entry.sender === 'system' ? 'bg-transparent text-center' : 
                            'bg-black bg-opacity-20 text-theme-text-primary rounded-bl-none'
                        }`}>
                            {entry.sender !== 'system' && <p className="text-xs font-semibold mb-0.5">{entry.sender === 'user' ? 'You' : 'AI Assistant'}</p>}
                            <p className="text-sm whitespace-pre-wrap">
                                {entry.message}
                                {entry.isStreaming && <span className="inline-block w-2 h-4 bg-theme-text-secondary animate-pulse ml-1 align-middle"></span>}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {errorAI && <div className="mt-2 p-3 bg-red-900 bg-opacity-30 text-red-300 text-sm rounded-md border border-red-500"><strong>Error:</strong> {errorAI}</div>}
            <div ref={conversationEndRef} />
        </div>

        <div className="mb-4">
          <label htmlFor="currentPrompt" className="block text-sm font-medium text-theme-text-secondary">Describe the template you need:</label>
          <textarea id="currentPrompt" value={currentPrompt} onChange={(e) => setCurrentPrompt(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendPrompt(); }}}
            rows="3" className="mt-1 block w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm sm:text-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent"
            placeholder="e.g., 'Create a checklist for reviewing new client onboarding...'" disabled={isLoadingAI || isSaving}/>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-theme-border">
            <div className="flex space-x-3 mb-2 sm:mb-0">
                <button type="button" onClick={handleSendPrompt} disabled={isLoadingAI || isSaving || !currentPrompt.trim()}
                    className="px-4 py-2 text-sm font-medium text-sidebar-bg bg-theme-accent hover:brightness-110 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-theme-accent disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoadingAI ? 'Generating...' : 'Send'}
                </button>
                <button type="button" onClick={handleRegenerate} disabled={isLoadingAI || isSaving || !conversationHistory.some(e => e.sender === 'user')}
                    className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    Regenerate
                </button>
            </div>
            <div className="flex space-x-3">
                <button type="button" onClick={handleAcceptAndSave} disabled={isLoadingAI || isSaving || !generatedContent || !templateName.trim() || !templateType.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? 'Saving...' : 'Accept & Save'}
                </button>
                <button type="button" onClick={handleClose} disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-gray-500 disabled:opacity-50">
                    Cancel
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AITemplateCreatorModal;