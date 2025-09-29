import type { Bill, BillSummary, PersonTotal } from './types';

export const calculateBillSummary = (bill: Bill): BillSummary => {
  const { items, people, adjustments, assignments } = bill;

  // Calculate subtotal from all items
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate adjustments total
  const adjustmentsTotal = adjustments.reduce((sum, adjustment) => {
    if (adjustment.isPercentage) {
      return sum + (subtotal * adjustment.value / 100);
    }
    return sum + adjustment.value;
  }, 0);

  // Calculate grand total
  const grandTotal = subtotal + adjustmentsTotal;

  // Calculate individual person totals
  const personTotals: PersonTotal[] = people.map((person) => {
    // Calculate person's subtotal based on assigned items
    let personSubtotal = 0;
    const itemBreakdown: PersonTotal['itemBreakdown'] = [];

    items.forEach((item) => {
      const assignment = assignments.find((a) => a.itemId === item.id);
      if (assignment && assignment.personIds.includes(person.id)) {
        const itemTotal = item.price * item.quantity;
        const share = itemTotal / assignment.personIds.length;
        personSubtotal += share;

        itemBreakdown.push({
          itemId: item.id,
          itemName: item.name,
          share,
        });
      }
    });

    // Calculate person's share of adjustments proportionally
    let personAdjustmentTotal = 0;
    const adjustmentBreakdown: PersonTotal['adjustmentBreakdown'] = [];

    if (subtotal > 0) {
      adjustments.forEach((adjustment) => {
        const adjustmentAmount = adjustment.isPercentage
          ? (subtotal * adjustment.value / 100)
          : adjustment.value;

        const personShare = (personSubtotal / subtotal) * adjustmentAmount;
        personAdjustmentTotal += personShare;

        adjustmentBreakdown.push({
          adjustmentId: adjustment.id,
          adjustmentDescription: adjustment.description,
          share: personShare,
        });
      });
    }

    return {
      personId: person.id,
      subtotal: personSubtotal,
      adjustmentTotal: personAdjustmentTotal,
      total: personSubtotal + personAdjustmentTotal,
      itemBreakdown,
      adjustmentBreakdown,
    };
  });

  return {
    subtotal,
    adjustmentsTotal,
    grandTotal,
    personTotals,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const roundToTwo = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};