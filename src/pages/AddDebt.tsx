import { FileText, Save, X, Calendar, Flag, Info, ChevronUp, ChevronDown, BellRing } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useDebts } from '../contexts/DebtContext';
import { DebtStatus } from '../types';

export default function AddDebt() {
  const navigate = useNavigate();
  const { addDebt } = useDebts();
  
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditor || !amount || !category || !dueDate) {
      alert('Por favor, preencha os campos obrigatórios (Credor, Valor, Categoria e Vencimento).');
      return;
    }

    addDebt({
      creditor,
      amount: parseFloat(amount),
      category,
      dueDate,
      description,
      status: 'pendente' as DebtStatus
    });

    navigate('/dividas');
  };

  return (

    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Adicionar Nova Dívida</h1>
        <p className="text-on-surface-variant text-lg mt-2">Preencha os detalhes abaixo para registrar um novo compromisso financeiro.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* Left Column: Primary Details */}
        <div className="xl:col-span-8 space-y-6">
          {/* Main Info */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-4 sm:p-8">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg"><FileText className="text-primary" size={20} /></div>
              Informações Principais
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant" htmlFor="creditor">Nome do Credor *</label>
                <input 
                  id="creditor"
                  value={creditor}
                  onChange={(e) => setCreditor(e.target.value)}
                  className="px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                  placeholder="Ex: Banco Central, Cartão Visa..."
                  type="text" 
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant" htmlFor="amount">Valor Total *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 label-numeric font-bold text-on-surface-variant">R$</span>
                    <input 
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none label-numeric font-bold"
                      placeholder="0,00"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant" htmlFor="category">Categoria *</label>
                  <select 
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Financiamento">Financiamento</option>
                    <option value="Empréstimo">Empréstimo Pessoal</option>
                    <option value="Contas Fixas">Contas Fixas</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant" htmlFor="dueDate">Vencimento *</label>
                  <input 
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>
            </div>

          </section>

          </section>

          {/* Observations */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-4 sm:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg"><Info className="text-primary" size={20} /></div>
              Descrição / Observações
            </h2>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none min-h-[120px] resize-none"
              placeholder="Adicione detalhes adicionais sobre esta dívida (opcional)..."
            />
          </section>
        </div>

        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-24">

          <div className="flex flex-col gap-4">
            <button 
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Save size={24} /> Salvar Dívida
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full bg-white text-secondary border-2 border-secondary py-4 rounded-2xl font-bold text-lg hover:bg-secondary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <X size={24} /> Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
