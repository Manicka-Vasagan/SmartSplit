// Core financial calculation utilities for SmartSplit.
// Implements equal/custom split calculations, balance aggregation across all
// expenses, and a debt simplification algorithm that minimizes total transactions.

/**
 * Split an amount equally across a list of member IDs.
 * @param {number} amount - Total expense amount
 * @param {string[]} memberIds - Array of user ID strings
 * @returns {{ user: string, amount: number }[]}
 */
export const calculateEqual = (amount, memberIds) => {
  const share = parseFloat((amount / memberIds.length).toFixed(2));
  const remainder = parseFloat((amount - share * memberIds.length).toFixed(2));

  return memberIds.map((userId, idx) => ({
    user: userId,
    amount: idx === 0 ? parseFloat((share + remainder).toFixed(2)) : share,
  }));
};

/**
 * Validate that custom splits sum to the total amount.
 * @param {{ user: string, amount: number }[]} splits
 * @returns {boolean}
 */
export const calculateCustom = (splits) => {
  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  return parseFloat(total.toFixed(2));
};

/**
 * Aggregate net balances for each member across all expenses.
 * Positive balance = others owe this user; Negative = this user owes others.
 * @param {Object[]} expenses - Array of populated Expense documents
 * @param {string[]} memberIds - Array of user ID strings
 * @returns {{ [userId: string]: number }}
 */
export const calculateBalances = (expenses, memberIds) => {
  const balances = {};
  memberIds.forEach((id) => {
    balances[id.toString()] = 0;
  });

  for (const expense of expenses) {
    const paidById = expense.paidBy._id
      ? expense.paidBy._id.toString()
      : expense.paidBy.toString();

    // The payer is owed the full amount
    if (balances[paidById] !== undefined) {
      balances[paidById] = parseFloat(
        (balances[paidById] + expense.amount).toFixed(2)
      );
    }

    // Each split member owes their share
    for (const split of expense.splits) {
      const splitUserId = split.user._id
        ? split.user._id.toString()
        : split.user.toString();

      if (balances[splitUserId] !== undefined) {
        balances[splitUserId] = parseFloat(
          (balances[splitUserId] - split.amount).toFixed(2)
        );
      }
    }
  }

  return balances;
};

/**
 * Simplify a balance object into minimum transactions.
 * Uses a greedy algorithm matching the largest creditor with the largest debtor.
 * @param {{ [userId: string]: number }} balanceObj
 * @returns {{ from: string, to: string, amount: number }[]}
 */
export const simplifyDebts = (balanceObj) => {
  const transactions = [];

  // Build mutable arrays of creditors (positive) and debtors (negative)
  const entries = Object.entries(balanceObj).map(([user, amount]) => ({
    user,
    amount: parseFloat(amount.toFixed(2)),
  }));

  const creditors = entries.filter((e) => e.amount > 0).sort((a, b) => b.amount - a.amount);
  const debtors = entries.filter((e) => e.amount < 0).sort((a, b) => a.amount - b.amount);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debit = debtors[di];

    const settleAmount = parseFloat(
      Math.min(credit.amount, Math.abs(debit.amount)).toFixed(2)
    );

    if (settleAmount > 0) {
      transactions.push({
        from: debit.user,
        to: credit.user,
        amount: settleAmount,
      });
    }

    credit.amount = parseFloat((credit.amount - settleAmount).toFixed(2));
    debit.amount = parseFloat((debit.amount + settleAmount).toFixed(2));

    if (Math.abs(credit.amount) < 0.01) ci++;
    if (Math.abs(debit.amount) < 0.01) di++;
  }

  return transactions;
};
