'use client';

import { useChat } from '@ai-sdk/react';
import { ChevronLeft, Menu, Search, Plus, Smile, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function KakaoTalkChat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat() as any;
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[#191919] text-white font-sans max-w-md mx-auto shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#191919] sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <ChevronLeft className="w-6 h-6 cursor-pointer" />
          <div>
            <h1 className="text-lg font-bold">연애 고수 선배 😎</h1>
            <p className="text-xs text-zinc-400">활동 중</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 cursor-pointer text-zinc-300" />
          <Menu className="w-5 h-5 cursor-pointer text-zinc-300" />
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-center my-4">
          <span className="bg-black/20 text-xs px-3 py-1 rounded-full text-zinc-400">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </span>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
            <p className="text-sm">선배에게 연애 고민을 털어놔보세요!</p>
            <p className="text-xs opacity-70">"오늘 소개팅인데 뭐 입을까?", "과팅 매너 좀 알려줘"</p>
          </div>
        )}

        {messages.map((m: any) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
          >
            {m.role !== 'user' && (
              <div className="w-10 h-10 rounded-xl bg-zinc-700 flex-shrink-0 flex items-center justify-center text-xl overflow-hidden">
                <span className="select-none">😎</span>
              </div>
            )}
            <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
              {m.role !== 'user' && <span className="text-xs text-zinc-400 mb-1 ml-1">연애 고수 선배</span>}
              <div
                className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                  m.role === 'user'
                    ? 'bg-[#fee500] text-[#191919] rounded-tr-none'
                    : 'bg-[#2c2c2c] text-white rounded-tl-none border border-zinc-800'
                }`}
              >
                {m.content}
                {m.toolInvocations?.map((toolInvocation: any) => {
                  const toolCallId = toolInvocation.toolCallId;
                  if (toolInvocation.state === 'result') {
                    return (
                      <div key={toolCallId} className="mt-2 text-[10px] text-zinc-400 border-t border-zinc-700 pt-1">
                        검색 결과 확인됨
                      </div>
                    );
                  }
                  return (
                    <div key={toolCallId} className="mt-2 text-[10px] text-zinc-400 italic">
                      검색 중...
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 mx-1">
                {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-2 bg-[#191919] border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="p-2 text-zinc-400 cursor-pointer">
            <Plus className="w-6 h-6" />
          </div>
          <div className="flex-1 bg-[#2c2c2c] rounded-2xl flex items-end p-2 border border-zinc-800">
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-2 max-h-32 resize-none outline-none"
              placeholder="메시지 입력"
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <Smile className="w-6 h-6 text-zinc-400 cursor-pointer mx-1" />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input?.trim()}
            className={`p-2 rounded-xl transition-colors ${
              input?.trim() ? 'bg-[#fee500] text-[#191919]' : 'text-zinc-600'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer >
    </div >
  );
}
