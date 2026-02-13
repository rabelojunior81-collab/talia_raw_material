
import React, { useState, useEffect } from 'react';
import { Session, ReportableTask } from '../../types';
import { analyzeConversationForReports } from '../../services/geminiService';
import { X, Loader, AlertTriangle, Download } from '../icons/Icons';
import { db } from '../../services/db';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, session }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ReportableTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        setTasks([]);
        setSelectedTasks([]);
        try {
          // Fetch messages from DB
          const messages = await db.messages.where({ sessionId: session.id }).sortBy('timestamp');
          
          if (messages.length === 0) {
             throw new Error("A conversa está vazia.");
          }

          const result = await analyzeConversationForReports(messages);
          setTasks(result);
          // Pre-select all tasks by default
          setSelectedTasks(result.map((_, index) => index));
        } catch (err: any) {
          setError(err.message || "Falha ao analisar a conversa.");
        } finally {
          setLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [isOpen, session]);

  if (!isOpen) {
    return null;
  }

  const handleToggleTask = (index: number) => {
    setSelectedTasks(prev => 
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleDownload = () => {
    let reportContent = `# Relatório da Conversa: ${session.title}\n\n`;
    reportContent += `*Gerado em: ${new Date().toLocaleString('pt-BR')}*\n\n---\n\n`;
    
    selectedTasks.forEach(index => {
      const task = tasks[index];
      reportContent += `## Tarefa: ${task.taskDescription}\n\n`;
      reportContent += `**Resultado:**\n\n`;
      reportContent += `${task.resultContent}\n\n`;
      reportContent += `---\n\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${session.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[#1a1a1a] border border-white/20 w-full max-w-2xl h-[80vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">Gerar Relatório da Conversa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader className="w-12 h-12 animate-spin text-red-500" />
              <p className="mt-4 text-gray-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">Analisando a conversa para identificar tarefas...</p>
            </div>
          )}
          {error && (
            <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-1" />
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && (
            <div>
              <p className="text-gray-400 mb-4 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">Selecione as tarefas concluídas que você deseja incluir no relatório.</p>
              <div className="space-y-4">
                {tasks.length > 0 ? tasks.map((task, index) => (
                  <div key={index} className="bg-black/30 p-4 border border-white/10 flex items-start gap-4">
                    <input 
                      type="checkbox"
                      id={`task-${index}`}
                      checked={selectedTasks.includes(index)}
                      onChange={() => handleToggleTask(index)}
                      className="mt-1.5 w-5 h-5 bg-gray-700 border-gray-500 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor={`task-${index}`} className="flex-grow">
                      <h4 className="font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{task.taskDescription}</h4>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-3">{task.resultContent}</p>
                    </label>
                  </div>
                )) : (
                    <p className="text-center text-gray-400 py-8">Nenhuma tarefa exportável foi encontrada nesta conversa.</p>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-white/10 flex justify-end">
          <button 
            onClick={handleDownload}
            disabled={selectedTasks.length === 0 || loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5"/>
            <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">Baixar Relatório</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExportModal;
