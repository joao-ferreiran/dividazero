import { Wallet, CreditCard, AlertTriangle, Calendar, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useDebts } from '../contexts/DebtContext';
import { formatCurrency, cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#003d9b', '#00687a', '#785900', '#564264', '#005b4b'];

export default function Dashboard() {
  const { debts, summary, income, updateIncome } = useDebts();
  const navigate = useNavigate();
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');

  // Calculate Distribution Data dynamically
  const distributionData = useMemo(() => {
    const categoryTotals = debts.reduce((acc, debt) => {
      const cat = debt.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + (debt.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [debts]);

  // Calculate Evolution Data (Next 6 months)
  const evolutionData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const targetMonth = date.getMonth();
      const targetYear = date.getFullYear();

      const monthDebts = debts.filter(d => {
        const dDate = new Date(d.dueDate + 'T12:00:00Z');
        return dDate.getMonth() === targetMonth && dDate.getFullYear() === targetYear;
      });

      const totalValue = monthDebts.reduce((acc, curr) => acc + curr.amount, 0);

      return {
        month: months[targetMonth],
        value: totalValue
      };
    });
  }, [debts]);

  // Calculate Installment Projection (Next 6 months)
  const installmentProjection = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();
    
    const projection = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      return {
        month: months[date.getMonth()],
        year: date.getFullYear(),
        total: 0,
        monthIndex: date.getMonth(),
      };
    });

    debts.forEach(debt => {
      if (debt.status === 'pago') return;
      
      let current = 1, total = 1;
      if (debt.installments && debt.installments.total > 1) {
        current = debt.installments.current;
        total = debt.installments.total;
      } else {
        const match = debt.description?.match(/Parcelas:\s*(\d+)\/(\d+)/i);
        if (match) {
          current = parseInt(match[1]);
          total = parseInt(match[2]);
        }
      }

      if (total > 1 && current <= total) {
        const remaining = total - current + 1;
        
        let startDate = new Date(debt.dueDate + 'T12:00:00Z');
        if (startDate < today && debt.status === 'atrasado') {
           startDate = new Date(today);
        }

        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();

        for (let j = 0; j < remaining; j++) {
           const targetDate = new Date(startYear, startMonth + j, 1);
           
           const projIndex = projection.findIndex(p => p.monthIndex === targetDate.getMonth() && p.year === targetDate.getFullYear());
           if (projIndex !== -1) {
             projection[projIndex].total += debt.amount;
           }
        }
      }
    });

    return projection;
  }, [debts]);

  // O Saldo Livre deve ser: Renda - (Tudo que já paguei esse mês + Tudo que ainda preciso pagar urgente/esse mês)
  const pendingToPayThisMonth = debts.filter(d => {
    if (d.status === 'pago') return false;
    // Se está atrasado, tem que pagar agora
    if (d.status === 'atrasado') return true;
    // Se vence esse mês, tem que pagar esse mês
    const dDate = new Date(d.dueDate + 'T12:00:00Z');
    return dDate.getMonth() === new Date().getMonth() && dDate.getFullYear() === new Date().getFullYear();
  }).reduce((acc, curr) => acc + curr.amount, 0);

  const saldoLivre = income - summary.paidThisMonth - pendingToPayThisMonth;

  const paidProgress = income > 0 ? Math.min(100, Math.round((summary.paidThisMonth / income) * 100)) : 0;

  return (

    <div className="space-y-8">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Visão Geral</h1>
          <p className="text-on-surface-variant">Acompanhe seu progresso e mantenha suas finanças sob controle.</p>
        </div>
        <div className="bg-surface-bright border border-outline-variant rounded-xl p-3 flex items-center gap-3">
          <div className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Renda Fixa</div>
          {isEditingIncome ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                placeholder="Ex: 1620,00"
                className="w-24 px-2 py-1 border border-primary rounded outline-none text-sm font-bold"
                autoFocus
              />
              <button onClick={() => {
                const normalized = incomeInput.replace(/\./g, '').replace(',', '.');
                const val = Number(normalized);
                if (!isNaN(val)) {
                  updateIncome(val);
                  setIsEditingIncome(false);
                }
              }} className="text-primary hover:bg-primary/10 p-1 rounded cursor-pointer">
                <Check size={18} />
              </button>
              <button onClick={() => setIsEditingIncome(false)} className="text-error hover:bg-error/10 p-1 rounded cursor-pointer">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg label-numeric text-primary">{formatCurrency(income)}</span>
              <button 
                onClick={() => { setIncomeInput(income.toString()); setIsEditingIncome(true); }}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Saldo Livre (Mês)" 
          value={formatCurrency(saldoLivre)} 
          badge={saldoLivre < 0 ? "Orçamento Estourado" : null}
          variant={saldoLivre < 0 ? "error" : "primary"}
          icon={<Wallet className="text-on-surface-variant" size={20} />}
        />
        <SummaryCard 
          title="Total Devido" 
          value={formatCurrency(summary.totalOwed)} 
          icon={<Wallet className="text-on-surface-variant" size={20} />}
        />

        <SummaryCard 
          title="Valor Pago (Mês)" 
          value={formatCurrency(summary.paidThisMonth)} 
          progress={paidProgress}
          progressLabel={income > 0 ? `${paidProgress}% da renda mensal` : "Defina sua renda"}
          variant="secondary"
          icon={<CreditCard className="text-on-surface-variant" size={20} />}
        />

        <SummaryCard 
          title="Próximos Vencimentos (7 dias)" 
          value={summary.nearDueCount.toString()} 
          subtitle={`Totalizando ${formatCurrency(summary.nearDueTotal)}`}
          variant="error"
          icon={<Calendar className="text-on-surface-variant" size={20} />}
        />
      </section>

      {/* Charts Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col">
          <h2 className="text-xl font-bold mb-6">Distribuição por Categoria</h2>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Porcentagem']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-on-surface">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-2xl p-6 border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Evolução de Pagamentos</h2>
            <span className="text-sm text-on-surface-variant">Próximos 6 meses</span>
          </div>
          <div className="h-[200px] sm:h-[240px] w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E2E4" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#434654' }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #C3C6D6' }}
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#003d9b" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  className="hover:fill-secondary transition-colors cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Near Due List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Dívidas Próximas do Vencimento</h2>
          <button onClick={() => navigate('/dividas')} className="text-primary text-sm font-semibold hover:underline cursor-pointer">Ver todas</button>
        </div>
        <div className="space-y-3">
          {debts.length > 0 ? (
            debts.slice(0, 2).map((debt) => (
              <div 
                key={debt.id} 
                className="bg-white rounded-2xl p-4 md:p-6 border border-outline-variant shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-primary transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    {(debt.category || '').includes('Cartão') ? <CreditCard size={24} /> : <Wallet size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{debt.creditor}</h3>
                    <p className="text-sm text-on-surface-variant">{debt.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end w-full md:w-auto gap-0.5">
                  <span className="label-numeric text-lg font-bold">{formatCurrency(debt.amount)}</span>
                  <span className={cn(
                    "text-sm flex items-center gap-1",
                    debt.status === 'atrasado' ? "text-error" : "text-on-surface-variant"
                  )}>
                    {debt.status === 'atrasado' && <AlertTriangle size={14} />}
                    {debt.status === 'atrasado' ? `Venceu em (${debt.dueDate})` : `Vence em (${debt.dueDate})`}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-outline-variant">
                  {debt.status === 'atrasado' && (
                    <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-1 rounded tracking-widest">URGENTE</span>
                  )}
                  <button onClick={() => navigate('/dividas')} className="ml-auto md:ml-0 px-4 py-2 rounded-lg border border-secondary text-secondary font-semibold text-sm hover:bg-secondary hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
                    Detalhes <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-outline-variant border-dashed text-center">
              <p className="text-on-surface-variant font-medium">Nenhuma dívida próxima do vencimento.</p>
            </div>
          )}
        </div>

      </section>

      {/* Installments Summary */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Resumo de Parcelamentos</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-2">
            <span className="text-sm font-medium text-on-surface-variant">Total Restante em Parcelas</span>
            <span className="label-numeric text-3xl font-bold text-primary">{formatCurrency(summary.installmentTotalOwed)}</span>
            <span className="text-sm text-on-surface-variant">{summary.installmentCount} dívidas parceladas ativas</span>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-3 max-h-[260px] overflow-y-auto">
            {debts.filter(d => d.status !== 'pago' && (d.installments?.total > 1 || d.description?.match(/Parcelas:/i))).length > 0 ? (
              debts.filter(d => d.status !== 'pago' && (d.installments?.total > 1 || d.description?.match(/Parcelas:/i))).map(debt => {
                let current = 1, total = 1;
                if (debt.installments) {
                  current = debt.installments.current;
                  total = debt.installments.total;
                } else {
                  const match = debt.description?.match(/Parcelas:\s*(\d+)\/(\d+)/i);
                  if (match) {
                    current = parseInt(match[1]);
                    total = parseInt(match[2]);
                  }
                }
                const remaining = total - current + 1;
                const remainingValue = remaining * debt.amount;
                return (
                  <div key={debt.id} className="flex justify-between items-center pb-2 border-b border-outline-variant/50 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-on-surface">{debt.creditor}</h4>
                      <p className="text-xs text-on-surface-variant">Faltam {remaining} parcelas (Atual: {current}/{total})</p>
                    </div>
                    <span className="label-numeric font-bold text-on-surface">{formatCurrency(remainingValue)}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-on-surface-variant text-center my-auto">Nenhuma dívida parcelada ativa.</p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-4 max-h-[260px]">
            <span className="text-sm font-medium text-on-surface-variant">Projeção por Mês (Próx. 6 meses)</span>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2">
              {installmentProjection.map((proj, i) => (
                <div key={i} className="flex justify-between items-center pb-2 border-b border-outline-variant/50 last:border-0 last:pb-0">
                  <span className="text-sm font-bold text-on-surface">{proj.month} {proj.year}</span>
                  <span className="label-numeric font-bold text-primary">{formatCurrency(proj.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, badge, progress, progressLabel, subtitle, icon, variant = 'primary' }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-on-surface-variant">{title}</span>
        {icon}
      </div>
      <div className={cn(
        "label-numeric text-2xl sm:text-4xl font-bold tracking-tight",
        variant === 'secondary' ? "text-secondary" : variant === 'error' ? "text-error" : "text-on-surface"
      )}>
        {value}
      </div>
      
      {badge && (
        <div className="mt-1">
          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold tracking-wider uppercase">
            {badge}
          </span>
        </div>
      )}

      {progress !== undefined && (
        <div className="space-y-1 mt-2">
          <div className="w-full bg-surface-container-high rounded-full h-1.5">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-on-surface-variant text-right font-bold uppercase">{progressLabel}</p>
        </div>
      )}

      {subtitle && (
        <p className="text-sm text-on-surface-variant mt-1 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
