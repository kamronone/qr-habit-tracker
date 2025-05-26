import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { format } from 'date-fns';

Chart.register(BarElement, CategoryScale, LinearScale);

const Stats = () => {
  const doneDates: string[] = JSON.parse(localStorage.getItem('habit_done') || '[]');
  const streak = doneDates.reduceRight((acc, date, i, arr) => {
    const d = new Date();
    d.setDate(d.getDate() - acc);
    return format(d, 'yyyy-MM-dd') === date ? acc + 1 : acc;
  }, 0);

  const data = {
    labels: doneDates,
    datasets: [
      {
        label: 'Отметки',
        data: doneDates.map(() => 1),
        backgroundColor: 'rgba(34,197,94,0.6)',
      },
    ],
  };

  return (
    <div>
      <p className="font-semibold">🔥 Стрик: {streak} дней</p>
      <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
    </div>
  );
};

export default Stats;
