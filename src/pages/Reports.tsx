import { Download, FileText, TrendingDown, Calendar, ArrowRight } from 'lucide-react';
import { useDebts } from '../contexts/DebtContext';
import { formatCurrency, cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Reports() {
  const { debts, summary } = useDebts();

  const reportData: any[] = [];

  const creditorTotals = debts.reduce((acc, debt) => {
    if (debt.status !== 'pago') {
      acc[debt.creditor] = (acc[debt.creditor] || 0) + debt.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalPending = Object.values(creditorTotals).reduce((a, b) => a + b, 0);

  const dynamicCreditors = Object.entries(creditorTotals)
    .map(([name, amount], index) => {
      const colors = ['#EC7000', '#CC092F', '#003d9b', '#00687a', '#ba1a1a'];
      return {
        name,
        type: 'Dívida',
        amount,
        percent: totalPending > 0 ? Math.round((amount / totalPending) * 100) : 0,
        color: colors[index % colors.length],
        initial: name.charAt(0).toUpperCase()
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const handleExportCSV = () => {
    const header = ['Credor', 'Valor', 'Vencimento', 'Status', 'Categoria'];
    const rows = debts.map(d => [d.creditor, d.amount, d.dueDate, d.status, d.category]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dividas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (

    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-on-surface-variant mt-2">Análise detalhada da sua evolução financeira e previsões de quitação.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto print:hidden">
          <button onClick={handleExportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-secondary text-secondary rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary-container hover:text-on-secondary-container transition-colors">
            <Download size={18} /> CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors shadow-sm">
            <FileText size={18} /> Imprimir
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evolution Chart */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-outline-variant shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-xl font-bold">Evolução: Dívidas vs Pagamentos</h2>
            <select className="bg-surface border border-outline-variant rounded-xl text-sm py-1.5 px-3 focus:border-primary outline-none">
              <option>Este Ano</option>
              <option>Últimos 6 Meses</option>
            </select>
          </div>
          <div className="h-[250px] sm:h-[350px] w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E2E4" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#434654' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#434654' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #C3C6D6', padding: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="divida" 
                  name="Dívida Total" 
                  stroke="#003d9b" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#003d9b' }} 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pago" 
                  name="Pagamentos Realizados" 
                  stroke="#00687a" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#00687a' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projection Card */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-2xl border border-outline-variant shadow-sm p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="text-secondary" />
              <h2 className="text-xl font-bold">Projeção de Quitação</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-8 font-medium">Estimativa baseada no seu ritmo médio de pagamentos dos últimos 3 meses.</p>
          </div>

          <div className="flex items-end gap-6 mb-8">
            <div className="bg-secondary-container p-5 rounded-full flex items-center justify-center shadow-inner">
              <Calendar className="text-on-secondary-container" size={40} />
            </div>
            <div>
              <div className="label-numeric text-3xl sm:text-5xl font-bold tracking-tight">
                {debts.length > 0 ? "Dez 2024" : "---"}
              </div>
              <div className="text-[10px] font-bold text-secondary mt-2 uppercase tracking-widest leading-none">Mês Previsto para Liberdade</div>
            </div>

          </div>

          <div className="space-y-4 bg-surface-bright p-5 rounded-2xl border border-outline-variant">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-on-surface-variant">Progresso Global</span>
              <span className="label-numeric font-bold text-primary">0%</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-secondary rounded-full shadow-sm" style={{ width: '0%' }} />
            </div>
            <p className="text-xs text-on-surface-variant text-center font-medium">
              Faltam <span className="label-numeric font-bold text-on-surface">{formatCurrency(summary.totalOwed)}</span> para o objetivo.
            </p>
          </div>

        </div>

        {/* Creditors List */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-2xl border border-outline-variant shadow-sm p-4 sm:p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-6">Maiores Credores</h2>
          <div className="flex-1 space-y-4">
            {dynamicCreditors.length > 0 ? (
              dynamicCreditors.map((creditor, i) => (
                <div key={creditor.name} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 hover:bg-surface-bright rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-sm border border-black/5" 
                        style={{ backgroundColor: `${creditor.color}15`, color: creditor.color }}
                      >
                        {creditor.initial}
                      </div>
                      <div>
                        <div className="font-bold text-lg leading-none">{creditor.name}</div>
                        <div className="text-xs text-on-surface-variant font-medium mt-1.5">{creditor.type}</div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <div className="label-numeric text-lg font-bold">{formatCurrency(creditor.amount)}</div>
                      <div className={cn(
                        "inline-flex self-end px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        creditor.percent > 40 ? "bg-error/10 text-error" : "bg-surface-container-high text-on-surface-variant"
                      )}>
                        {creditor.percent}% do total
                      </div>
                    </div>
                  </div>
                  {i < dynamicCreditors.length - 1 && <div className="h-px bg-outline-variant/30 w-full" />}
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-outline-variant border-dashed rounded-2xl">
                <p className="text-on-surface-variant font-medium">Nenhum credor registrado.</p>
              </div>
            )}
          </div>
          <button 
            disabled={dynamicCreditors.length === 0}
            className="mt-8 py-3 w-full border border-primary text-primary font-bold text-sm rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ver Análise Completa <ArrowRight size={18} />
          </button>

        </div>
      </div>
    </div>
  );
}
