import { Wallet, CreditCard, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { useDebts } from '../contexts/DebtContext';

import { formatCurrency, cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const evolutionData: any[] = [];


const distributionData: any[] = [];


export default function Dashboard() {
  const { debts, summary } = useDebts();

  return (

    <div className="space-y-8">
      {/* Header Section */}
      <section>
        <h1 className="text-3xl font-bold text-on-surface">Visão Geral</h1>
        <p className="text-on-surface-variant">Acompanhe seu progresso e mantenha suas finanças sob controle.</p>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Devido" 
          value={formatCurrency(summary.totalOwed)} 
          badge={summary.totalOwed > 0 ? "+2% este mês" : null}
          icon={<Wallet className="text-on-surface-variant" size={20} />}
        />

        <SummaryCard 
          title="Valor Pago (Mês)" 
          value={formatCurrency(summary.paidThisMonth)} 
          progress={summary.paidThisMonth > 0 ? 45 : 0}
          progressLabel={summary.paidThisMonth > 0 ? "45% da meta mensal" : "0% da meta mensal"}
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
                  <Tooltip />
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
            <span className="text-sm text-on-surface-variant">Últimos 6 meses</span>
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
                />
                <Bar 
                  dataKey="value" 
                  fill="#003d9b" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  className="hover:fill-secondary transition-colors"
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
          <button className="text-primary text-sm font-semibold hover:underline">Ver todas</button>
        </div>
        <div className="space-y-3">
          {debts.length > 0 ? (
            debts.slice(0, 2).map((debt) => (
              <div 
                key={debt.id} 
                className="bg-white rounded-2xl p-4 md:p-6 border border-outline-variant shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    {debt.category.includes('Cartão') ? <CreditCard size={24} /> : <Wallet size={24} />}
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
                  <button className="ml-auto md:ml-0 px-4 py-2 rounded-lg border border-secondary text-secondary font-semibold text-sm hover:bg-secondary hover:text-white transition-colors flex items-center gap-2">
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
