import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import validateQR from '../utils/validateQR';

interface QRScannerProps {
  habitId: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ habitId }) => {
  const [scanning, setScanning] = useState(true);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  
  useEffect(() => {
    const allDone = JSON.parse(localStorage.getItem('habit_done') || '{}');
    setScanHistory(allDone[habitId] || []);
  }, [habitId]);

  const markDone = () => {
    const today = new Date().toISOString().slice(0, 10);
    const allDone = JSON.parse(localStorage.getItem('habit_done') || '{}');
    const habitDone = allDone[habitId] || [];

    if (!habitDone.includes(today)) {
      const updatedHabitDone = [...habitDone, today];
      const updatedAllDone = { ...allDone, [habitId]: updatedHabitDone };
      localStorage.setItem('habit_done', JSON.stringify(updatedAllDone));
      setLastScan('success');
      setScanHistory(updatedHabitDone);
      setTimeout(() => setLastScan(null), 2000);
    } else {
      setLastScan('already_done');
      setTimeout(() => setLastScan(null), 2000);
    }
  };

  useEffect(() => {
    setScanHistory([]);
    
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        'scanner',
        { 
          fps: 10, 
          qrbox: 250,
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        false
      );

      scanner.render(
        (decoded: string) => {
          if (validateQR(decoded, habitId)) {
            markDone();
          } else {
            setLastScan('error');
            setTimeout(() => setLastScan(null), 2000);
          }
        },
        (error: string) => {
          console.error('Ошибка сканирования:', error);
        }
      );

      return () => {
        scanner.clear();
      };
    }
  }, [scanning, habitId]);

  const getStreak = () => {
    const doneDates = scanHistory.sort();
    if (doneDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = doneDates.length - 1; i >= 0; i--) {
      const doneDate = new Date(doneDates[i]);
      doneDate.setHours(0, 0, 0, 0);

      // Если дата выполнения сегодня или вчера и соответствует текущей дате в серии
      if (doneDate.getTime() === currentDate.getTime() || 
          (streak > 0 && doneDate.getTime() === new Date(currentDate.getTime()).setDate(currentDate.getDate() - 1))) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Переходим к предыдущему дню
      } else if (doneDate.getTime() < currentDate.getTime()) {
         // Если дата выполнения раньше, чем ожидаемый предыдущий день, серия прерывается
        if (i === doneDates.length - 1 && doneDate.getTime() !== currentDate.getTime()) {
          // Если самая последняя дата не сегодня, начинаем серию с 0, если только она не вчера
           if (doneDate.getTime() !== new Date(currentDate.getTime()).setDate(currentDate.getDate() - 1)) {
             streak = 0;
             break;
           }
        } else if (i < doneDates.length - 1 && doneDate.getTime() !== new Date(doneDates[i+1]).setDate(new Date(doneDates[i+1]).getDate() - 1)) {
           // Если между текущей и предыдущей датами есть пропуск
           break;
        }
      } else if (doneDate.getTime() > currentDate.getTime()) {
        // Пропускаем будущие даты или сегодняшнюю, если мы уже ее учли
        continue;
      }
    }

    // Дополнительная проверка на случай, если последняя дата была вчера
    const lastDoneDate = new Date(doneDates[doneDates.length - 1]);
    lastDoneDate.setHours(0,0,0,0);
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    yesterday.setHours(0,0,0,0);

    if (streak > 0 && lastDoneDate.getTime() === yesterday.getTime() && new Date().getHours() < 1 ) {
       // Учитываем, если выполнение было вчера, а сейчас уже новый день, но еще рано сбрасывать серию
    } else if (streak > 0 && lastDoneDate.getTime() < currentDate.getTime()) {
       streak = 0;
    }

    return streak;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md">
        {scanning ? (
          <div id="scanner" className="rounded-lg overflow-hidden shadow-lg" />
        ) : (
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg flex items-center justify-center h-64">
            <span className="text-gray-500 text-lg">Сканирование остановлено</span>
          </div>
        )}
        
        {lastScan && (
          <div className={`absolute inset-0 flex items-center justify-center bg-opacity-75 ${
            lastScan === 'success' ? 'bg-green-500' : 
            lastScan === 'error' ? 'bg-red-500' : 
            'bg-yellow-500'
          }`}>
            <span className="text-white text-2xl font-bold">
              {lastScan === 'success' ? '✅ Успешно!' : 
               lastScan === 'error' ? '❌ Ошибка!' : 
               '⚠️ Уже отмечено сегодня!'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 w-full max-w-md bg-white rounded-lg shadow-md p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Текущая серия</h3>
          <p className="text-3xl font-bold text-indigo-600">{getStreak()} дней</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">История выполнения ({scanHistory.length})</h3>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
            {scanHistory.length > 0 ? (
              scanHistory.sort().map((date, index) => (
                <p key={index} className="text-sm text-gray-600">{date}</p>
              ))
            ) : (
              <p className="text-sm text-gray-500">Нет записей о выполнении.</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setScanning(!scanning)}
        className={`mt-4 px-6 py-2 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-md ${
          scanning 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {scanning ? 'Остановить сканирование' : 'Начать сканирование'}
      </button>
    </div>
  );
};

export default QRScanner;
