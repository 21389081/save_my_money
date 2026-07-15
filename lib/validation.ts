export function validateMoneyBook(input: { name: string; how_much: number }) {
  const errors: { name?: string; how_much?: string } = {};
  if (!input.name.trim()) errors.name = "請輸入帳本名稱";
  if (!Number.isFinite(input.how_much) || input.how_much < 0) {
    errors.how_much = "初始值不可小於 0";
  }
  return errors;
}

export function validateTransaction(
  input: { name: string; how_much: number; transaction_date: string },
  today: string,
) {
  const errors: { name?: string; how_much?: string; transaction_date?: string } =
    {};
  if (!input.name.trim()) errors.name = "請輸入條目";
  if (!Number.isFinite(input.how_much) || input.how_much <= 0) {
    errors.how_much = "金額必須大於 0";
  }
  if (input.transaction_date > today) {
    errors.transaction_date = "交易日期不可晚於今天";
  }
  return errors;
}
