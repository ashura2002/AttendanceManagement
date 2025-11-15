import { SubjectDays } from '../enums/scheduleSubject.enum';

export function getDayOnDate(date: Date): SubjectDays | null {
  const day = date.getDay();

  const weekdays: Record<number, SubjectDays> = {
    0: SubjectDays.Sun,
    1: SubjectDays.Mon,
    2: SubjectDays.Tue,
    3: SubjectDays.Wed,
    4: SubjectDays.Thurs,
    5: SubjectDays.Fri,
    6: SubjectDays.Sat,
  };
  return weekdays[day] || null;
}
