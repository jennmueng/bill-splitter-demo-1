export interface LineItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface Adjustment {
  id: string;
  type: 'fee' | 'tip' | 'tax';
  description: string;
  value: number;
  isPercentage: boolean;
}

export interface Assignment {
  itemId: string;
  personIds: string[];
}

export interface Bill {
  id: string;
  name: string;
  items: LineItem[];
  people: Person[];
  adjustments: Adjustment[];
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonTotal {
  personId: string;
  subtotal: number;
  adjustmentTotal: number;
  total: number;
  itemBreakdown: {
    itemId: string;
    itemName: string;
    share: number;
  }[];
  adjustmentBreakdown: {
    adjustmentId: string;
    adjustmentDescription: string;
    share: number;
  }[];
}

export interface BillSummary {
  subtotal: number;
  adjustmentsTotal: number;
  grandTotal: number;
  personTotals: PersonTotal[];
}