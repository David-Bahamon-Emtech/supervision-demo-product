// src/components/Manage/AITemplateCreatorModal.js - FIXED & SIMPLIFIED VERSION
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
  
  // Typewriter speed is now a constant.
  const TYPING_SPEED_NORMAL = 30; // Default normal speed

  const typewriterIntervalRef = useRef(null);
  const conversationEndRef = useRef(null);

  const availableTemplateTypes = [
    "Compliance Checklist",
    "Communication Template",
    "Procedural Document",
    "Policy Document",
    "Risk Assessment Form",
    "Other",
  ];

  useEffect(() => {
    if (isOpen && conversationHistory.length === 0) {
      setConversationHistory([
        {
          id: `welcome_${Date.now()}`,
          sender: 'ai',
          message: "Welcome to EMTECH Intelligence! How can I help you create a template today? Please select a Template Type and enter a name before generating for best results."
        }
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

    if (!isRegeneration) {
        setGeneratedContent('');
    }

    const streamingMessageId = `ai_stream_${Date.now()}`;
    setConversationHistory(prevHistory => [
        ...prevHistory,
        { sender: 'ai', message: '', id: streamingMessageId, isStreaming: true }
    ]);

    let accumulatedText = '';
    let displayedText = '';
    let pendingChunks = [];
    let currentChunkIndex = 0;
    let currentCharIndex = 0;

    const typewriterEffect = () => {
      if (currentChunkIndex < pendingChunks.length) {
        const currentChunk = pendingChunks[currentChunkIndex];
        if (currentCharIndex < currentChunk.length) {
          displayedText += currentChunk.charAt(currentCharIndex);
          currentCharIndex++;
          setConversationHistory(prev => prev.map(entry =>
            entry.id === streamingMessageId ? { ...entry, message: displayedText } : entry
          ));
        } else {
          currentChunkIndex++;
          currentCharIndex = 0;
        }
      }
    };

    const requestBody = {
        prompt: promptToUse,
        history: conversationHistoryForAPI
            .filter(entry => (entry.sender === 'user' || entry.sender === 'ai') && typeof entry.message === 'string'),
        templateType: templateType || ''
    };

    let reader;
    try {
        const response = await fetch('http://localhost:3001/api/templates/generate-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
            throw new Error(errorData.error);
        }
        if (!response.body) {
            throw new Error('ReadableStream not supported or response body is null');
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Use the constant for the typing speed
        typewriterIntervalRef.current = setInterval(typewriterEffect, TYPING_SPEED_NORMAL);

        while (true) {
            const { value, done: readerDone } = await reader.read();
            if (readerDone) break;

            buffer += decoder.decode(value, { stream: true });
            let eolIndex;
            while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
                const messageLine = buffer.substring(0, eolIndex).trim();
                buffer = buffer.substring(eolIndex + 2);

                if (messageLine.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(messageLine.substring(5).trim());
                        if (jsonData.textChunk) {
                            accumulatedText += jsonData.textChunk;
                            pendingChunks.push(jsonData.textChunk);
                        } else if (jsonData.error) {
                            throw new Error(jsonData.error);
                        }
                    } catch (parseError) {
                        console.warn('Frontend: Error parsing streamed JSON:', parseError);
                    }
                }
            }
        }
    } catch (err) {
        console.error("Frontend: Error in callAIGenerationAPI (streaming):", err);
        setErrorAI(err.message || "Streaming connection failed or an error occurred.");
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);

        setConversationHistory(prev => prev.map(entry =>
            entry.id === streamingMessageId ? { ...entry, isStreaming: false, message: `${entry.message}\n\n[Error: ${err.message}]` } : entry
        ));
    } finally {
        if (reader) reader.releaseLock();
        
        const finalizeWhenTypingDone = () => {
          const isTypingFinished = currentChunkIndex >= pendingChunks.length;
          if (isTypingFinished) {
            if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
            
            setGeneratedContent(accumulatedText);
            setConversationHistory(prev => prev.map(entry =>
                entry.id === streamingMessageId ? { ...entry, isStreaming: false, message: accumulatedText } : entry
            ));
            setIsLoadingAI(false);
            if (!isRegeneration) setCurrentPrompt('');
          } else {
            setTimeout(finalizeWhenTypingDone, 100);
          }
        };
        
        finalizeWhenTypingDone();
    }
  };

  const handleSendPrompt = () => {
    if (!currentPrompt.trim()) return;
    let hasMetadataWarning = false;
    if (!templateName.trim() || !templateType.trim()) {
        setErrorAI("Please enter a Template Name and select a Template Type for best results.");
        hasMetadataWarning = true;
    } else {
        setErrorAI(null);
    }
    const historyForAPI = [...conversationHistory];
    const userMessage = { id: `user_${Date.now()}`, sender: 'user', message: currentPrompt };
    
    setConversationHistory(prevHistory => {
        const newHistory = [...prevHistory];
        if (hasMetadataWarning) {
            newHistory.push({
                id: `system_${Date.now()}`,
                sender: 'system',
                message: `Reminder: Template Name and Type are recommended before generation.`
            });
        }
        newHistory.push(userMessage);
        return newHistory;
    });
    callAIGenerationAPI(currentPrompt, false, historyForAPI);
  };

  const handleRegenerate = () => {
    let promptToRegenerate = '';
    let historyForRegeneration = [];
    let lastUserPromptIndex = -1;
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
        if (conversationHistory[i].sender === 'user') {
            promptToRegenerate = conversationHistory[i].message;
            lastUserPromptIndex = i;
            break;
        }
    }
    if (!promptToRegenerate) {
        setErrorAI("No previous user prompt found to regenerate.");
        return;
    }
    if (lastUserPromptIndex > -1) {
        historyForRegeneration = conversationHistory.slice(0, lastUserPromptIndex);
    }
    if (!templateName.trim() || !templateType.trim()) {
        setErrorAI("Please ensure Template Name and Type are set for optimal regeneration.");
    } else {
        setErrorAI(null);
    }
    setConversationHistory(prevHistory => [
        ...prevHistory,
        { id: `system_${Date.now()}`, sender: 'system', message: `Regenerating for: "${promptToRegenerate}"...` }
    ]);
    callAIGenerationAPI(promptToRegenerate, true, historyForRegeneration);
  };

  const handleAcceptAndSave = async () => {
    if (!templateName.trim() || !templateType.trim() || !generatedContent.trim()) {
      alert("Please ensure Template Name, Type, and generated content are available before saving.");
      return;
    }
    setIsSaving(true);
    setErrorAI(null);
    const allUserPrompts = conversationHistory.filter(entry => entry.sender === 'user').map(entry => entry.message).join('\n---\nRefinement Prompt: ');
    const templateDataToSave = {
      templateName: templateName,
      templateType: templateType,
      textContent: generatedContent,
      generatedBy: `AI Assistant (${currentAIMode || 'Gemini'})`,
      promptUsed: allUserPrompts || "Prompt history not fully captured.",
    };
    try {
      const response = await fetch('http://localhost:3001/api/templates/save-ai-generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(templateDataToSave),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Error saving template: ${response.status}`);
      onSaveTemplate(result.template);
      alert(result.message || "Template saved successfully!");
      handleClose();
    } catch (err) {
      console.error("Error saving template:", err);
      setErrorAI(err.message || "Failed to save the template to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    setTemplateName('');
    setTemplateType('');
    setCurrentPrompt('');
    setConversationHistory([]);
    setGeneratedContent('');
    setIsLoadingAI(false);
    setIsSaving(false);
    setErrorAI(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Create Template with AI Assistant</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        {/* Metadata Inputs - Typing Speed Removed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">Template Name <span className="text-red-500">*</span></label>
                <input type="text" id="templateName" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                    className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., AML Policy Review" disabled={isSaving || isLoadingAI}/>
            </div>
            <div>
                <label htmlFor="templateType" className="block text-sm font-medium text-gray-700">Template Type <span className="text-red-500">*</span></label>
                <select id="templateType" value={templateType} onChange={(e) => setTemplateType(e.target.value)}
                    className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500" disabled={isSaving || isLoadingAI}>
                    <option value="">-- Select Type --</option>
                    {availableTemplateTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
            </div>
        </div>

        {/* Conversation/Display Area */}
        <div className="flex-grow bg-gray-50 p-3 rounded-md mb-4 overflow-y-auto border border-gray-200 min-h-[250px] flex flex-col">
            <div className="flex-grow">
                {conversationHistory.map((entry) => (
                    <div key={entry.id} className={`mb-3 clear-both flex ${ 
                        entry.sender === 'user' ? 'justify-end' : 
                        entry.sender === 'system' ? 'justify-center italic text-gray-500 text-xs' : 'justify-start'
                    }`}>
                        <div className={`inline-block p-2 px-3 rounded-lg shadow-sm max-w-[90%] break-words ${
                            entry.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' :
                            entry.sender === 'system' ? 'bg-transparent text-center' : 
                            'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}>
                            {entry.sender !== 'system' && <p className="text-xs font-semibold mb-0.5">{entry.sender === 'user' ? 'You' : 'AI Assistant'}</p>}
                            <p className="text-sm whitespace-pre-wrap">
                                {entry.message}
                                {entry.isStreaming && <span className="inline-block w-2 h-4 bg-gray-700 animate-pulse ml-1 align-middle"></span>}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {errorAI && (
                 <div className="mt-2 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-300">
                    <strong>Error:</strong> {errorAI}
                </div>
            )}
            <div ref={conversationEndRef} />
        </div>

        {/* Prompt Input Area */}
        <div className="mb-4">
          <label htmlFor="currentPrompt" className="block text-sm font-medium text-gray-700">Describe the template you need:</label>
          <textarea id="currentPrompt" value={currentPrompt} onChange={(e) => setCurrentPrompt(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendPrompt(); }}}
            rows="3" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 'Create a checklist for reviewing new client onboarding...'" disabled={isLoadingAI || isSaving}/>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-3 mb-2 sm:mb-0">
                <button type="button" onClick={handleSendPrompt}
                    disabled={isLoadingAI || isSaving || !currentPrompt.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoadingAI ? 'Generating...' : 'Send'}
                </button>
                <button type="button" onClick={handleRegenerate}
                    disabled={isLoadingAI || isSaving || !conversationHistory.some(e => e.sender === 'user')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    Regenerate
                </button>
            </div>
            <div className="flex space-x-3">
                <button type="button" onClick={handleAcceptAndSave}
                    disabled={isLoadingAI || isSaving || !generatedContent || !templateName.trim() || !templateType.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? 'Saving...' : 'Accept & Save'}
                </button>
                <button type="button" onClick={handleClose} disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 disabled:opacity-50">
                    Cancel
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AITemplateCreatorModal;