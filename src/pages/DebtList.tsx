import { Plus, Search, Calendar, ChevronRight, CheckCircle2, Trash2 } from 'lucide-react';
import { useDebts } from '../contexts/DebtContext';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function DebtList() {
  const { debts, markAsPaid, deleteDebt } = useDebts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.creditor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          debt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? debt.status === statusFilter : true;
    const matchesCategory = categoryFilter ? debt.category === categoryFilter : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
          <div className="flex gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-outline-variant rounded-xl px-4 py-2 bg-surface text-sm focus:border-primary outline-none min-w-[150px]"
            >
              <option value="">Todos os Status</option>
              <option value="atrasado">Atrasado</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-outline-variant rounded-xl px-4 py-2 bg-surface text-sm focus:border-primary outline-none min-w-[150px]"
            >
              <option value="">Categorias</option>
              <option value="cartao">Cartão de Crédito</option>
              <option value="financiamento">Financiamento</option>
              <option value="emprestimo">Empréstimo Pessoal</option>
              <option value="imposto">Impostos</option>
            </select>
          </div>

        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDebts.length > 0 ? (
          filteredDebts.map((debt) => (
            <DebtGridCard key={debt.id} debt={debt} onMarkPaid={markAsPaid} onDelete={deleteDebt} />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-3xl p-20 border border-outline-variant border-dashed text-center flex flex-col items-center gap-4">
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
          <h3 className={cn("text-lg font-bold", isPago && "line-through")}>{debt.creditor}</h3>
          <p className="text-sm text-on-surface-variant">{debt.description}</p>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest",
          isAtrasado ? "bg-error/10 text-error" : isPago ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
        )}>
          {debt.status.toUpperCase()}
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

      {debt.installments && !isPago && (
        <div className="space-y-1.5 mt-2">
          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-secondary h-full rounded-full" 
              style={{ width: `${(debt.installments.current / debt.installments.total) * 100}%` }} 
            />
          </div>
          <p className="text-[10px] text-on-surface-variant text-right font-bold">
            {Math.round((debt.installments.current / debt.installments.total) * 100)}% PAGO
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-outline-variant flex justify-between items-center gap-2">
        {isPago ? (
          <>
            <button className="flex-1 border border-outline text-on-surface-variant rounded-lg py-2 text-sm font-semibold hover:bg-surface-container-low transition-colors cursor-not-allowed">
              Comprovante
            </button>
            <button onClick={() => onDelete(debt.id)} className="px-4 border border-error text-error rounded-lg py-2 text-sm font-semibold hover:bg-error/10 transition-colors">
              <Trash2 size={18} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onDelete(debt.id)} className="w-12 flex items-center justify-center border border-error text-error rounded-lg py-2 hover:bg-error/10 transition-colors">
              <Trash2 size={18} />
            </button>
            <button onClick={() => onMarkPaid(debt.id)} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
              Marcar Pago
            </button>
          </>
        )}
      </div>
    </div>
  );
}
