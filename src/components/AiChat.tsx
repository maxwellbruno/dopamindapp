
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MinimalSpinner from './ui/MinimalSpinner';

interface AiChatProps {
  onClose: () => void;
}

const AiChat: React.FC<AiChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: 'ai', text: "Hello! I'm Mindfulnest AI. How can I help you support your well-being today?" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { mutate: sendMessage, isPending: isAiReplying } = useMutation({
    mutationFn: async (chatHistory: { from: string; text: string }[]) => {
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.from === 'ai' ? 'assistant' : 'user',
        content: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('mindfulnest-ai-chat', {
        body: { messages: formattedHistory },
      });

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data) => {
      const aiResponse = { from: 'ai', text: data.response };
      setMessages(prev => [...prev, aiResponse]);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      const errorResponse = { from: 'ai', text: "I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorResponse]);
    },
  });

  const handleSend = () => {
    if (input.trim() === '' || isAiReplying) return;

    const userMessage = { from: 'user', text: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    sendMessage(newMessages);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full h-[70vh] flex flex-col dopamind-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-mint-green to-mint-green rounded-xl flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="text-lg font-bold text-text-dark">Mindfulnest AI</h3>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="rounded-full">
            ✕
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.from === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                msg.from === 'ai' 
                  ? 'bg-light-gray text-text-dark rounded-bl-none' 
                  : 'bg-mint-green text-white rounded-br-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isAiReplying && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl max-w-[80%] text-sm bg-light-gray text-text-dark rounded-bl-none">
                <MinimalSpinner />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-light-gray border-none text-deep-blue rounded-xl focus-visible:ring-mint-green"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isAiReplying}
          />
          <Button
            onClick={handleSend}
            className="bg-mint-green text-white rounded-xl hover:bg-mint-green/90"
            disabled={isAiReplying}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
