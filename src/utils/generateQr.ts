import { format } from 'date-fns';

const generateQR = (habitId: string) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return `${habitId}_${today}`;
};

export default generateQR;
