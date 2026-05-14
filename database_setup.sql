-- Create the debts table
CREATE TABLE public.debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creditor TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    "originalAmount" NUMERIC,
    "dueDate" DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    category TEXT NOT NULL,
    installments JSONB,
    "paidAt" DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- For this local/personal prototype, we will enable RLS but create a policy 
-- that allows all operations (anon access) so you don't have to deal with login right now.
-- IF YOU PLAN TO PUBLISH THIS, YOU MUST ADD AUTHENTICATION AND RESTRICT THESE POLICIES.

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for anon users (PROTOTYPE ONLY)"
ON public.debts
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
