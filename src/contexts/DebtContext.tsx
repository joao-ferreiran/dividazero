import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Debt, DebtStatus, SummaryData } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface DebtContextType {
  debts: Debt[];
  loading: boolean;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  markAsPaid: (id: string) => void;
  summary: SummaryData;
  income: number;
  updateIncome: (amount: number) => Promise<void>;
}

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export const useDebts = () => {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebts must be used within a DebtProvider');
  }
  return context;
};

export const DebtProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDebts();
      fetchProfile();
    } else {
      setDebts([]);
      setIncome(0);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('monthly_income')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      setIncome(Number(data.monthly_income));
    }
  };

  const updateIncome = async (amount: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ monthly_income: amount })
      .eq('id', user.id);
    if (!error) {
      setIncome(amount);
    }
  };

  const fetchDebts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching debts:', error);
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedDebts = data.map((debt: any) => {
      const processed = {
        ...debt,
        amount: Number(debt.amount),
        originalAmount: debt.originalAmount ? Number(debt.originalAmount) : undefined
      };
      if (processed.status !== 'pago') {
        const dueDate = new Date(processed.dueDate);
        const dueTime = new Date(dueDate.getTime() + dueDate.getTimezoneOffset() * 60000);
        dueTime.setHours(0, 0, 0, 0);
        
        if (dueTime < today) {
          processed.status = 'atrasado' as DebtStatus;
        } else {
          processed.status = 'pendente' as DebtStatus;
        }
      }
      return processed;
    });

    setDebts(processedDebts);
    setLoading(false);
  };

  const addDebt = async (debtData: Omit<Debt, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('debts')
      .insert([{ ...debtData, user_id: user.id }])
      .select();

    if (error) {
      console.error('Error adding debt:', error);
      return;
    }

    if (data && data.length > 0) {
      const addedDebt = data[0];
      if (addedDebt.status !== 'pago') {
        const dueDate = new Date(addedDebt.dueDate);
        const dueTime = new Date(dueDate.getTime() + dueDate.getTimezoneOffset() * 60000);
        dueTime.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueTime < today) {
          addedDebt.status = 'atrasado';
        } else {
          addedDebt.status = 'pendente';
        }
      }
      setDebts(prev => [addedDebt, ...prev]);
    }
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    const { error } = await supabase
      .from('debts')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating debt:', error);
      return;
    }

    setDebts(prev => prev.map(debt => debt.id === id ? { ...debt, ...updates } : debt));
  };

  const deleteDebt = async (id: string) => {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting debt:', error);
      return;
    }

    setDebts(prev => prev.filter(debt => debt.id !== id));
  };

  const markAsPaid = async (id: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const updates = { status: 'pago', paidAt: formattedDate };

    const { error } = await supabase
      .from('debts')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error marking as paid:', error);
      return;
    }

    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, ...updates } as Debt;
      }
      return d;
    }));

    // Auto-advance installments if applicable
    let current = 0;
    let total = 0;
    let hasInstallments = false;
    let newDescription = debt.description;
    let newInstallments = debt.installments;

    if (debt.installments && debt.installments.current && debt.installments.total) {
      current = debt.installments.current;
      total = debt.installments.total;
      if (current < total) {
        hasInstallments = true;
        newInstallments = { current: current + 1, total };
      }
    } else {
      const match = debt.description?.match(/Parcelas:\s*(\d+)\/(\d+)/i);
      if (match) {
        current = parseInt(match[1]);
        total = parseInt(match[2]);
        if (current < total) {
          hasInstallments = true;
          newDescription = debt.description.replace(/Parcelas:\s*\d+\/\d+/i, `Parcelas: ${current + 1}/${total}`);
        }
      }
    }

    if (hasInstallments) {
      const [year, month, day] = debt.dueDate.split('-');
      let nextMonth = parseInt(month) + 1;
      let nextYear = parseInt(year);
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      
      const daysInNextMonth = new Date(nextYear, nextMonth, 0).getDate();
      const nextDay = Math.min(parseInt(day), daysInNextMonth);
      const nextDueDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;

      await addDebt({
        creditor: debt.creditor,
        amount: debt.amount,
        category: debt.category,
        dueDate: nextDueDate,
        description: newDescription,
        installments: newInstallments,
        status: 'pendente' as DebtStatus
      });
    }
  };

  const calculateSummary = (): SummaryData => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const pendingDebts = debts.filter(d => d.status !== 'pago');
    const totalOwed = pendingDebts.reduce((acc, curr) => acc + curr.amount, 0);

    const paidThisMonth = debts.filter(d => {
      if (d.status !== 'pago' || !d.paidAt) return false;
      const paidDate = new Date(d.paidAt);
      const paidTime = new Date(paidDate.getTime() + paidDate.getTimezoneOffset() * 60000);
      return paidTime.getMonth() === currentMonth && paidTime.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + curr.amount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    const nearDueDebts = pendingDebts.filter(d => {
      const dueDate = new Date(d.dueDate);
      const dueTime = new Date(dueDate.getTime() + dueDate.getTimezoneOffset() * 60000);
      dueTime.setHours(0, 0, 0, 0);
      return dueTime >= today && dueTime <= in7Days;
    });

    const installmentDebts = pendingDebts.filter(d => {
      if (d.installments && d.installments.total > 1) return true;
      if (d.description?.match(/Parcelas:\s*(\d+)\/(\d+)/i)) return true;
      return false;
    });
    const installmentCount = installmentDebts.length;
    
    const installmentTotalOwed = installmentDebts.reduce((acc, curr) => {
      if (curr.installments && curr.installments.current && curr.installments.total) {
         const remainingCount = curr.installments.total - curr.installments.current + 1;
         return acc + (remainingCount * curr.amount);
      } else {
         const match = curr.description?.match(/Parcelas:\s*(\d+)\/(\d+)/i);
         if (match) {
           const cur = parseInt(match[1]);
           const tot = parseInt(match[2]);
           const remainingCount = tot - cur + 1;
           return acc + (remainingCount * curr.amount);
         }
      }
      return acc;
    }, 0);

    return {
      totalOwed,
      paidThisMonth,
      nearDueCount: nearDueDebts.length,
      nearDueTotal: nearDueDebts.reduce((acc, curr) => acc + curr.amount, 0),
      installmentTotalOwed,
      installmentCount
    };
  };

  const summary = useMemo(() => calculateSummary(), [debts]);

  return (
    <DebtContext.Provider value={{ debts, loading, addDebt, updateDebt, deleteDebt, markAsPaid, summary, income, updateIncome }}>
      {children}
    </DebtContext.Provider>
  );
};
