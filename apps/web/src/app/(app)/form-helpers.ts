export const nullableNumber = {
  setValueAs: (value: string) => (value === "" ? null : Number(value)),
};
