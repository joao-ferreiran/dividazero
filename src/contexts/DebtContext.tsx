import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDebts();
    } else {
      setDebts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchDebts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('dueDate', { ascending: true });

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
      if (processed.status === 'pendente') {
        const dueDate = new Date(processed.dueDate);
        const dueTime = new Date(dueDate.getTime() + dueDate.getTimezoneOffset() * 60000);
        dueTime.setHours(0, 0, 0, 0);
        
        if (dueTime < today) {
          return { ...processed, status: 'atrasado' as DebtStatus };
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
      setDebts(prev => [...prev, data[0]]);
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
    const match = debt.description?.match(/Parcelas:\s*(\d+)\/(\d+)/i);
    if (match) {
      const current = parseInt(match[1]);
      const total = parseInt(match[2]);
      if (current < total) {
        const newDescription = debt.description.replace(/Parcelas:\s*\d+\/\d+/i, `Parcelas: ${current + 1}/${total}`);
        
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
          status: 'pendente' as DebtStatus
        });
      }
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

    return {
      totalOwed,
      paidThisMonth,
      nearDueCount: nearDueDebts.length,
      nearDueTotal: nearDueDebts.reduce((acc, curr) => acc + curr.amount, 0)
    };
  };

  const summary = useMemo(() => calculateSummary(), [debts]);

  return (
    <DebtContext.Provider value={{ debts, loading, addDebt, updateDebt, deleteDebt, markAsPaid, summary }}>
      {children}
    </DebtContext.Provider>
  );
};
