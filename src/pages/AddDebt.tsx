import { FileText, Save, X, Calendar, Flag, Info, ChevronUp, ChevronDown, BellRing } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useDebts } from '../contexts/DebtContext';
import { DebtStatus } from '../types';

export default function AddDebt() {
  const navigate = useNavigate();
  const { addDebt } = useDebts();
  
  const [showInstallments, setShowInstallments] = useState(false);
  const [creditor, setCreditor] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
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

          {/* Installments Config */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-8 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg"><Calendar className="text-primary" size={20} /></div>
                Configurações de Parcelamento
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant">PARCELAMENTO AUTOMÁTICO</span>
                <button 
                  type="button"
                  className="w-12 h-6 bg-primary rounded-full relative transition-all"
                  onClick={() => setShowInstallments(!showInstallments)}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    showInstallments ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            </div>
            
            {showInstallments && (
              <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface-variant">Número de Parcelas</label>
                    <input 
                      type="number" 
                      className="px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none label-numeric font-bold"
                      defaultValue={12}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface-variant">Periodicidade</label>
                    <select className="px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none cursor-pointer">
                      <option>Mensal</option>
                      <option>Quinzenal</option>
                      <option>Semanal</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface-variant">Primeiro Vencimento</label>
                    <input 
                      type="date" 
                      className="px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none label-numeric"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface-variant">Valor da Parcela</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 label-numeric font-bold text-on-surface-variant">R$</span>
                      <input 
                        disabled
                        className="w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant rounded-xl label-numeric font-bold cursor-not-allowed text-on-surface-variant"
                        value="120,83"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">Detalhamento das Parcelas</h3>
                    <button type="button" className="text-primary hover:bg-primary/5 p-1 rounded-full"><ChevronUp size={20}/></button>
                  </div>
                  <div className="space-y-2 border border-outline-variant rounded-xl overflow-hidden">
                    <div className="bg-surface-container-low px-4 py-2 flex items-center gap-4 text-[10px] font-black text-on-surface-variant tracking-widest uppercase">
                      <span className="w-8 text-center text-xs">Nº</span>
                      <span className="flex-1">VENCIMENTO</span>
                      <span className="flex-1">VALOR (R$)</span>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto divide-y divide-outline-variant">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="px-4 py-3 flex items-center gap-4 bg-white hover:bg-surface-bright transition-colors">
                          <span className="w-8 text-center label-numeric font-bold text-on-surface-variant">{n}</span>
                          <input type="date" className="flex-1 bg-transparent border-none focus:ring-0 p-0 label-numeric text-sm" defaultValue={`2023-11-${n+10}`}/>
                          <input type="text" className="flex-1 bg-transparent border-none focus:ring-0 p-0 label-numeric text-sm font-bold" defaultValue="120,83"/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs text-on-surface-variant">Arraste para editar valores individuais se necessário.</span>
                    <button type="button" className="text-primary font-bold hover:underline text-sm uppercase tracking-wider">Recalcular</button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-4 sm:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg"><BellRing className="text-primary" size={20} /></div>
              Lembretes de Pagamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant">Antecedência</label>
                <select className="px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none cursor-pointer">
                  <option>3 dias antes</option>
                  <option>1 dia antes</option>
                  <option>No dia</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant">Canais</label>
                <div className="flex gap-4 items-center h-[54px]">
                  {['App', 'E-mail', 'SMS'].map(channel => (
                    <label key={channel} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" defaultChecked={channel !== 'SMS'}/>
                      <span className="font-bold text-sm text-on-surface-variant group-hover:text-primary transition-colors">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
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

        {/* Right Column: Settings & Actions */}
        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-24">
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-4 sm:p-8">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg"><Flag className="text-primary" size={20} /></div>
              Prioridade
            </h2>
            <p className="text-sm text-on-surface-variant mb-8 font-medium">Defina a urgência de pagamento para esta dívida.</p>
            
            <div className="space-y-3">
              {[
                { id: 'high', label: 'Alta', color: 'error', icon: 'AlertTriangle' },
                { id: 'medium', label: 'Média', color: 'primary', icon: 'Flag' },
                { id: 'low', label: 'Baixa', color: 'secondary', icon: 'Info' }
              ].map((p) => (
                <label key={p.id} className="flex items-center gap-4 p-4 border border-outline-variant rounded-2xl cursor-pointer hover:bg-surface-bright transition-all group has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="priority" className="w-5 h-5 text-primary border-outline-variant focus:ring-primary cursor-pointer"/>
                  <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{p.label}</span>
                </label>
              ))}
            </div>
          </section>

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
