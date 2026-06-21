export function validateLedger(input: {
  name: string;
  initialBudget: number;
}) {
  const errors: { name?: string; initialBudget?: string } = {};
  if (!input.name.trim()) errors.name = "請輸入帳本名稱";
  if (!Number.isFinite(input.initialBudget) || input.initialBudget <= 0) {
    errors.initialBudget = "預算必須大於 0";
  }
  return errors;
}

export function validateTransaction(
  input: { title: string; amount: number; date: string },
  today: string,
) {
  const errors: { title?: string; amount?: string; date?: string } = {};
  if (!input.title.trim()) errors.title = "請輸入條目";
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    errors.amount = "金額必須大於 0";
  }
  if (input.date > today) errors.date = "交易日期不可晚於今天";
  return errors;
}
