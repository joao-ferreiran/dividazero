-- Create the debts table
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creditor TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    "originalAmount" NUMERIC CHECK ("originalAmount" > 0),
    "dueDate" DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'atrasado', 'pago')),
    category TEXT NOT NULL,
    installments JSONB,
    "paidAt" DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECURITY NOTE: 
-- This policy allows full anon access. This is acceptable ONLY
-- because this is a personal-use app not exposed to other users.
-- If you ever add multi-user support, you MUST:
--   1. Enable Supabase Auth
--   2. Add a user_id column with a foreign key to auth.users
--   3. Replace this policy with: USING (auth.uid() = user_id)
-- ============================================================

CREATE POLICY "Personal access (single user prototype)"
ON public.debts
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
