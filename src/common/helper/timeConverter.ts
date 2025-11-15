export function convertTo24Hour(time: string): string {
  const [raw, modifier] = time
    .trim()
    .toUpperCase()
    .split(/(AM|PM)/);
  let [hours, minutes] = raw.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:00`;
}
