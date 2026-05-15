import { Plus, Search, Calendar, ChevronRight, CheckCircle2, Trash2, Edit2 } from 'lucide-react';
import { useDebts } from '../contexts/DebtContext';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", type = "danger" }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-on-surface-variant mb-8">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-white transition-colors shadow-sm hover:opacity-90",
            type === "danger" ? "bg-error" : "bg-primary"
          )}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DebtList() {
  const { debts, markAsPaid, deleteDebt } = useDebts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'delete' | 'pay', debtId: string, creditor: string} | null>(null);

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = (debt.creditor || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (debt.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? debt.status === statusFilter : true;
    const matchesCategory = categoryFilter ? debt.category === categoryFilter : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const confirmAction = () => {
    if (!modalConfig) return;
    if (modalConfig.type === 'delete') {
      deleteDebt(modalConfig.debtId);
    } else if (modalConfig.type === 'pay') {
      markAsPaid(modalConfig.debtId);
    }
    setModalConfig(null);
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold">Minhas Dívidas</h1>
            <p className="text-on-surface-variant mt-2">Acompanhe e gerencie seus pagamentos pendentes.</p>
          </div>
          <Link 
            to="/adicionar"
            className="bg-primary-container text-white rounded-xl px-6 py-3 font-semibold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={20} /> Nova Dívida
          </Link>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-outline-variant shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por credor ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none border border-outline-variant rounded-xl px-4 py-2 bg-surface text-sm focus:border-primary outline-none sm:min-w-[150px]"
            >
              <option value="">Todos os Status</option>
              <option value="atrasado">Atrasado</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:flex-none border border-outline-variant rounded-xl px-4 py-2 bg-surface text-sm focus:border-primary outline-none sm:min-w-[150px]"
            >
              <option value="">Categorias</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Financiamento">Financiamento</option>
              <option value="Empréstimo">Empréstimo Pessoal</option>
              <option value="Contas Fixas">Contas Fixas</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDebts.length > 0 ? (
          filteredDebts.map((debt) => (
            <DebtGridCard 
              key={debt.id} 
              debt={debt} 
              onMarkPaid={(id) => setModalConfig({ isOpen: true, type: 'pay', debtId: id, creditor: debt.creditor })} 
              onDelete={(id) => setModalConfig({ isOpen: true, type: 'delete', debtId: id, creditor: debt.creditor })} 
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-3xl p-10 md:p-20 border border-outline-variant border-dashed text-center flex flex-col items-center gap-4">
            <div className="bg-surface-container p-6 rounded-full">
              <Plus className="text-on-surface-variant" size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Nenhuma dívida cadastrada</h2>
              <p className="text-on-surface-variant mt-2">Comece adicionando sua primeira dívida para ter o controle total.</p>
            </div>
            <Link 
              to="/adicionar"
              className="mt-4 bg-primary text-white rounded-xl px-8 py-3 font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Adicionar Agora
            </Link>
          </div>
        )}
      </section>

      <ConfirmModal 
        isOpen={modalConfig?.isOpen}
        title={modalConfig?.type === 'delete' ? 'Excluir Dívida' : 'Marcar como Pago'}
        message={modalConfig?.type === 'delete' 
          ? `Tem certeza que deseja excluir permanentemente a dívida de "${modalConfig.creditor}"?`
          : `Tem certeza que deseja marcar a dívida de "${modalConfig.creditor}" como paga?`}
        confirmText={modalConfig?.type === 'delete' ? 'Sim, Excluir' : 'Sim, Marcar Pago'}
        type={modalConfig?.type === 'delete' ? 'danger' : 'primary'}
        onConfirm={confirmAction}
        onCancel={() => setModalConfig(null)}
      />
    </div>
  );
}

interface DebtGridCardProps {
  debt: any;
  onMarkPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

function DebtGridCard({ debt, onMarkPaid, onDelete }: DebtGridCardProps) {
  const isAtrasado = debt.status === 'atrasado';
  const isPago = debt.status === 'pago';

  return (
    <div className={cn(
      "bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-4 group transition-all hover:border-primary",
      isPago && "opacity-75"
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={cn("text-lg font-bold", isPago && "line-through")}>{debt.creditor || 'Sem Credor'}</h3>
          <p className="text-sm text-on-surface-variant">{debt.description}</p>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest",
          isAtrasado ? "bg-error/10 text-error" : isPago ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
        )}>
          {(debt.status || 'pendente').toUpperCase()}
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-on-surface-variant">{isPago ? 'Valor Pago' : 'Valor Atual'}</span>
        <span className={cn(
          "label-numeric text-2xl font-bold tracking-tight leading-none",
          isAtrasado ? "text-error" : "text-on-surface"
        )}>
          {formatCurrency(debt.amount)}
        </span>
        {!isPago && debt.originalAmount && (
          <span className="text-xs text-on-surface-variant font-medium">Original: {formatCurrency(debt.originalAmount)}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto">
        {isPago ? (
          <CheckCircle2 className="text-secondary" size={18} />
        ) : (
          <Calendar className={cn(isAtrasado ? "text-error" : "text-on-surface-variant")} size={18} />
        )}
        <span className={cn(
          "label-numeric text-xs font-semibold",
          isAtrasado ? "text-error" : "text-on-surface-variant"
        )}>
          {isPago ? `Pago em ${debt.paidAt}` : isAtrasado ? `Venceu em ${debt.dueDate}` : `Vence em ${debt.dueDate}`}
        </span>
      </div>

      <div className="pt-4 border-t border-outline-variant flex justify-between items-center gap-2">
        {isPago ? (
          <>
            <button className="flex-1 border border-outline text-on-surface-variant rounded-lg py-2 text-sm font-semibold hover:bg-surface-container-low transition-colors cursor-not-allowed">
              Comprovante
            </button>
            <button onClick={() => onDelete(debt.id)} className="px-4 border border-error text-error rounded-lg py-2 text-sm font-semibold hover:bg-error/10 transition-colors" title="Excluir">
              <Trash2 size={18} />
            </button>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <button onClick={() => onDelete(debt.id)} className="w-10 flex items-center justify-center border border-error text-error rounded-lg py-2 hover:bg-error/10 transition-colors" title="Excluir">
                <Trash2 size={18} />
              </button>
              <Link to={`/editar/${debt.id}`} className="w-10 flex items-center justify-center border border-primary text-primary rounded-lg py-2 hover:bg-primary/10 transition-colors" title="Editar">
                <Edit2 size={18} />
              </Link>
            </div>
            <button onClick={() => onMarkPaid(debt.id)} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
              Marcar Pago
            </button>
          </>
        )}
      </div>
    </div>
  );
}
