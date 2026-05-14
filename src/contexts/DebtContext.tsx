import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Debt, DebtStatus, SummaryData } from '../types';
import { supabase } from '../lib/supabase';

interface DebtContextType {
  debts: Debt[];
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
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('dueDate', { ascending: true });

    if (error) {
      console.error('Error fetching debts:', error);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedDebts = data.map((debt: any) => {
      // Map database columns to our interface (e.g., if we need camelCase)
      // Assuming columns are identically named for now, or we'll ensure they are in SQL.
      if (debt.status === 'pendente') {
        const dueDate = new Date(debt.dueDate);
        const dueTime = new Date(dueDate.getTime() + dueDate.getTimezoneOffset() * 60000);
        dueTime.setHours(0, 0, 0, 0);
        
        if (dueTime < today) {
          return { ...debt, status: 'atrasado' as DebtStatus };
        }
      }
      return debt;
    });

    setDebts(processedDebts);
  };

  const addDebt = async (debtData: Omit<Debt, 'id'>) => {
    const { data, error } = await supabase
      .from('debts')
      .insert([debtData])
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

    setDebts(prev => prev.map(debt => {
      if (debt.id === id) {
        return { ...debt, ...updates } as Debt;
      }
      return debt;
    }));
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

  return (
    <DebtContext.Provider value={{ debts, addDebt, updateDebt, deleteDebt, markAsPaid, summary: calculateSummary() }}>
      {children}
    </DebtContext.Provider>
  );
};
