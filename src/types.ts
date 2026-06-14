export type DebtStatus = 'atrasado' | 'pendente' | 'pago';

export interface Debt {
  id: string;
  creditor: string;
  description: string;
  amount: number;
  originalAmount?: number;
  dueDate: string;
  status: DebtStatus;
  category: string;
  installments?: {
    current: number;
    total: number;
  };
  paidAt?: string;
}

export interface SummaryData {
  totalOwed: number;
  paidThisMonth: number;
  nearDueCount: number;
  nearDueTotal: number;
  installmentTotalOwed: number;
  installmentCount: number;
}
