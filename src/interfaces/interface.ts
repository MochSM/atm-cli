export interface Session {
  name: string;
}

export interface User {
  name: string;
  balance: number;
  debt: Debt[];
}

export interface Debt {
  name: string;
  isOwed: boolean;
  amount: number;
}
