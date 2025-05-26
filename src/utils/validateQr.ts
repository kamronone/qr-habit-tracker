import { format } from 'date-fns';

const validateQR = (scanned: string, habitId: string) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return scanned === `${habitId}_${today}`;
};

export default validateQR;
