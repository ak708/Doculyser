
import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  text: string;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<{
    response: string;
    highlights: BoundingBox[];
  }>;
  isProcessingPdf: boolean;
  isPdfLoaded: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSendMessage,
  isProcessingPdf,
  isPdfLoaded
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Add initial system message when PDF is loaded
  useEffect(() => {
    if (isPdfLoaded && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: 'I\'ve processed your PDF. Ask me anything about it!',
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isPdfLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || isProcessing || isProcessingPdf || !isPdfLoaded) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Process message and get response
      const { response } = await onSendMessage(input.trim());
      
      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error processing your request.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`
        flex flex-col h-full bg-chatpanel border-r border-chatpanel-border shadow-lg
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-full md:w-1/3 lg:w-1/3' : 'w-14'}
      `}
    >
      {/* Chat Header */}
      <div className="flex justify-between items-center p-3 border-b border-chatpanel-border bg-white">
        {isExpanded && (
          <h3 className="font-medium text-lg">Document Chat</h3>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExpand}
          className="ml-auto"
          aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
        >
          {isExpanded ? (
            <X className="h-5 w-5" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </Button>
      </div>

      {/* Chat Messages Area */}
      {isExpanded && (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`
                  flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}
                `}
              >
                <div
                  className={`
                    p-3 rounded-lg max-w-[85%]
                    ${message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'}
                  `}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <span className="text-xs opacity-70 block text-right mt-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* Message Input Area */}
      {isExpanded && (
        <div className="p-3 border-t border-chatpanel-border">
          <div className="flex items-end space-x-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                !isPdfLoaded 
                  ? "Upload a PDF first" 
                  : isProcessingPdf 
                    ? "Processing PDF..." 
                    : "Ask about the document..."
              }
              className="resize-none min-h-[60px] max-h-[200px]"
              disabled={!isPdfLoaded || isProcessingPdf || isProcessing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!isPdfLoaded || isProcessingPdf || isProcessing || input.trim() === ''}
              aria-label="Send message"
              size="icon"
            >
              {isProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
