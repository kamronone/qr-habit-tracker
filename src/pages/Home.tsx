import React, { useState, useEffect, useRef } from 'react';
import QRGenerator from '../components/QRGenerator';
import QRScanner from '../components/QRScanner';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format, subDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Habit {
  id: string;
  name: string;
  description: string;
}

interface Stats {
  totalHabits: number;
  completedToday: number;
  bestStreak: number;
}

const Home = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [
      { id: 'habit1', name: 'Утренняя зарядка', description: '15 минут упражнений' }
    ];
  });
  const [selectedHabitId, setSelectedHabitId] = useState<string>(() => {
    const saved = localStorage.getItem('selectedHabitId');
    const initialHabits = JSON.parse(localStorage.getItem('habits') || '[]');
    return saved && initialHabits.find((h: Habit) => h.id === saved) ? saved : initialHabits[0]?.id || '';
  });

  const [habitHistory, setHabitHistory] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
    if (!habits.find(h => h.id === selectedHabitId)) {
      setSelectedHabitId(habits[0]?.id || '');
    }
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('selectedHabitId', selectedHabitId);
  }, [selectedHabitId]);

  useEffect(() => {
    const allDone = JSON.parse(localStorage.getItem('habit_done') || '{}');
    setHabitHistory(allDone[selectedHabitId] || []);
  }, [selectedHabitId]);

  const handleAddHabit = (habit: Habit) => {
    const updatedHabits = [...habits, habit];
    setHabits(updatedHabits);
    setSelectedHabitId(habit.id);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    setHabits(habits.map(habit => 
      habit.id === updatedHabit.id ? updatedHabit : habit
    ));
  };

  const getStreak = () => {
    const doneDates = habitHistory.sort();
    if (doneDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = doneDates.length - 1; i >= 0; i--) {
      const doneDate = new Date(doneDates[i]);
      doneDate.setHours(0, 0, 0, 0);

      if (doneDate.getTime() === currentDate.getTime() || 
          (streak > 0 && doneDate.getTime() === new Date(currentDate.getTime()).setDate(currentDate.getDate() - 1))) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (doneDate.getTime() < currentDate.getTime()) {
           if (i === doneDates.length - 1 && doneDate.getTime() !== currentDate.getTime()) {
              if (doneDate.getTime() !== new Date(currentDate.getTime()).setDate(currentDate.getDate() - 1)) {
                streak = 0;
                break;
              }
           } else if (i < doneDates.length - 1 && doneDate.getTime() !== new Date(doneDates[i+1]).setDate(new Date(doneDates[i+1]).getDate() - 1)) {
             break;
          }
        } else if (doneDate.getTime() > currentDate.getTime()) {
          continue;
        }
      }
      const lastDoneDate = new Date(doneDates[doneDates.length - 1]);
      lastDoneDate.setHours(0,0,0,0);
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
      yesterday.setHours(0,0,0,0);
      if (streak > 0 && lastDoneDate.getTime() === yesterday.getTime() && new Date().getHours() < 1 ) {
      } else if (streak > 0 && lastDoneDate.getTime() < currentDate.getTime()) {
         streak = 0;
      }
      return streak;
    };

  const today = new Date().toISOString().slice(0, 10);
  const completedToday = habitHistory.includes(today) ? 1 : 0;
  const currentStreak = getStreak();

  const getChartData = () => {
    const labels = [];
    const data = [];
    const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));

    for (const day of last7Days) {
      labels.push(format(new Date(day), 'EEE'));
      data.push(habitHistory.includes(day) ? 1 : 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Выполнено',
          data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Статистика выполнения за неделю'
      }
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return value === 1 ? 'Да' : 'Нет';
          }
        },
        min: 0,
        max: 1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              QR Habit Tracker
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Сканируй QR-код, чтобы отметить свою привычку и следить за прогрессом
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <h3 className="text-sm font-medium text-indigo-600">Всего привычек</h3>
                <p className="text-2xl font-bold text-indigo-700">{habits.length}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <h3 className="text-sm font-medium text-purple-600">Выполнено сегодня (эта привычка)</h3>
                <p className="text-2xl font-bold text-purple-700">{completedToday}</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 text-center">
                <h3 className="text-sm font-medium text-pink-600">Текущая серия (эта привычка)</h3>
                <p className="text-2xl font-bold text-pink-700">{currentStreak} дней</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md mb-8">
              <Line options={chartOptions} data={getChartData()} />
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">История выполнения ({habitHistory.length})</h3>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {habitHistory.length > 0 ? (
                  habitHistory.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map((date, index) => (
                    <p key={index} className="text-sm text-gray-600">{date}</p>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Нет записей о выполнении для этой привычки.</p>
                )}
              </div>
            </div>

          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-indigo-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">Сгенерировать QR</h2>
              <QRGenerator 
                habits={habits}
                selectedHabitId={selectedHabitId}
                setSelectedHabitId={setSelectedHabitId}
                onAddHabit={handleAddHabit}
                onDeleteHabit={handleDeleteHabit}
                onUpdateHabit={handleUpdateHabit}
              />
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Сканировать QR</h2>
              <QRScanner habitId={selectedHabitId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
