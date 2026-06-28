const WEEKDAY_PRICES = [
  { label: "ვაუჩერი", amount: 37 },
  { label: "სტანდარტული", amount: 40 },
  { label: "ბავშვი", amount: 25 },
  { label: "მაცხოვრებელი", amount: 25}
];

const WEEKEND_PRICES = [
  { label: "ვაუჩერი", amount: 52 },
  { label: "სტანდარტული", amount: 56 },
  { label: "ბავშვი", amount: 30 },
  { label: "მაცხოვრებელი", amount: 30}
];

export function getSunbedPriceOptions(date = new Date()) {
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;

  return isWeekend ? WEEKEND_PRICES : WEEKDAY_PRICES;
}
