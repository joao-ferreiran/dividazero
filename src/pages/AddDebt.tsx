import { FileText, Save, X, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDebts } from '../contexts/DebtContext';
import { DebtStatus } from '../types';

export default function AddDebt() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { debts, addDebt, updateDebt } = useDebts();
  
  const [creditor, setCreditor] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [installments, setInstallments] = useState('');
  const [description, setDescription] = useState('');

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const debtToEdit = debts.find(d => d.id === id);
      if (debtToEdit) {
        setCreditor(debtToEdit.creditor);
        setAmount(debtToEdit.amount.toString());
        setCategory(debtToEdit.category);
        setDueDate(debtToEdit.dueDate);
        
        let desc = debtToEdit.description || '';
        const match = desc.match(/Parcelas:\s*(\d+\/\d+)/i);
        if (match) {
          setInstallments(match[1]);
          desc = desc.replace(/Parcelas:\s*\d+\/\d+/i, '').trim();
        }
        setDescription(desc);
      } else {
        navigate('/dividas');
      }
    }
  }, [id, debts, isEditMode, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditor || !amount || !category || !dueDate) {
      alert('Por favor, preencha os campos obrigatórios (Credor, Valor, Categoria e Vencimento).');
      return;
    }

    const finalDescription = installments 
      ? `Parcelas: ${installments}${description ? '\n' + description : ''}`
      : description;

    if (isEditMode) {
      updateDebt(id!, {
        creditor,
        amount: parseFloat(amount),
        category,
        dueDate,
        description: finalDescription
      });
    } else {
      addDebt({
        creditor,
        amount: parseFloat(amount),
        category,
        dueDate,
        description: finalDescription,
        status: 'pendente' as DebtStatus
      });
    }

    navigate('/dividas');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{isEditMode ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant" htmlFor="amount">Valor da Parcela ou Total *</label>
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
                  <label className="text-sm font-bold text-on-surface-variant" htmlFor="installments">Parcelas (Opcional)</label>
                  <input 
                    id="installments"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="px-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none transition-all placeholder:text-outline"
                    placeholder="Ex: 3/12"
                    type="text" 
                  />
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
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Save size={24} /> {isEditMode ? 'Salvar Alterações' : 'Salvar Dívida'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full bg-white text-secondary border-2 border-secondary py-4 rounded-2xl font-bold text-lg hover:bg-secondary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <X size={24} /> Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
