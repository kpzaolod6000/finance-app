export type AccountType = 'cash' | 'bank' | 'card' | 'savings' | 'investment';
export type CategoryType = 'income' | 'expense';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type RecurrenceInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BudgetStatus = 'ok' | 'at_risk' | 'exceeded';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
    initial_balance: string;
    currency: string;
    color: string;
    icon: string;
    is_archived: boolean;
    current_balance: string | null;
}

export interface Category {
    id: string;
    user_id: string;
    parent_id: string | null;
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    account_id: string;
    transfer_account_id: string | null;
    category_id: string | null;
    type: TransactionType;
    amount: string;
    currency: string;
    occurred_at: string;
    description: string | null;
    recurring_transaction_id: string | null;
    account?: Account;
    transfer_account?: Account;
    category?: Category;
}

export interface Budget {
    id: string;
    user_id: string;
    category_id: string;
    amount_limit: string;
    currency: string;
    period_month: string;
    spent?: string;
    percentage?: number;
    status?: BudgetStatus;
    category?: Category;
}
