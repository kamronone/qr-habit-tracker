import React, { useState, useEffect, useRef } from 'react';
// Удаляем импорт старой библиотеки qrcode.react
// import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import generateQR from '../utils/generateQR';
// Импортируем компонент из новой библиотеки
import { QRCode } from 'react-qrcode-logo';

interface Habit {
  id: string;
  name: string;
  description: string;
}

// Определяем тип пропсов для QRGenerator
interface QRGeneratorProps {
  habits: Habit[];
  selectedHabitId: string;
  setSelectedHabitId: React.Dispatch<React.SetStateAction<string>>;
  onAddHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateHabit: (updatedHabit: Habit) => void;
}

// Принимаем пропсы в компоненте
const QRGenerator: React.FC<QRGeneratorProps> = ({
  habits,
  selectedHabitId,
  setSelectedHabitId,
  onAddHabit,
  onDeleteHabit,
  onUpdateHabit,
}) => {
  // Удаляем локальное состояние привычек и выбранной привычки, так как оно теперь в Home.tsx
  // const [habits, setHabits] = useState<Habit[]>(() => { ... });
  // const [selectedHabit, setSelectedHabit] = useState<string>(() => { ... });

  const [newHabit, setNewHabit] = useState({ name: '', description: '' });
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const qrCodeRef = useRef<any>(null);

  // Удаляем useEffect для сохранения привычек и выбранной привычки, так как это теперь в Home.tsx
  // useEffect(() => { ... }, [habits]);
  // useEffect(() => { ... }, [selectedHabit]);

  // Используем функцию из пропсов для добавления привычки
  const handleAddHabit = () => {
    if (newHabit.name.trim()) {
      const newId = `habit${Date.now()}`;
      onAddHabit({ ...newHabit, id: newId }); // Вызываем функцию из пропсов
      setNewHabit({ name: '', description: '' });
      setShowAddForm(false);
    }
  };

  // Используем функцию из пропсов для удаления привычки
  const handleDeleteHabit = (id: string) => {
    onDeleteHabit(id); // Вызываем функцию из пропсов
  };

  // Добавляем функцию handleEditHabit, которая устанавливает состояние редактируемой привычки
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowAddForm(false);
  };

  // Используем функцию из пропсов для сохранения изменений привычки
  const handleSaveEdit = () => {
    if (editingHabit && editingHabit.name.trim()) {
      onUpdateHabit(editingHabit); // Вызываем функцию из пропсов
      setEditingHabit(null);
    }
  };
  
  // Используем selectedHabitId из пропсов
  const selectedHabitData = habits.find(h => h.id === selectedHabitId);
  const qrValue = selectedHabitData ? generateQR(selectedHabitData.id) : '';

  // Новая функция для скачивания QR в PNG с помощью react-qrcode-logo
  const handleDownloadQR = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.download({
        fileName: `qr-${selectedHabitId}.png`,
        // type: "png", // По умолчанию png
        // extension: "png", // По умолчанию png
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full mb-4 flex items-center space-x-2">
        <select
          value={selectedHabitId} // Используем selectedHabitId из пропсов
          onChange={(e) => setSelectedHabitId(e.target.value)} // Используем функцию из пропсов
          className="flex-grow px-4 py-2 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
        >
          {habits.map(habit => (
            <option key={habit.id} value={habit.id}>
              {habit.name}
            </option>
          ))}
        </select>
        {selectedHabitData && selectedHabitData.id !== 'habit1' && (
          <button
            onClick={() => handleEditHabit(selectedHabitData)}
            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
            title="Редактировать"
          >
            ✏️
          </button>
        )}
         {selectedHabitData && selectedHabitData.id !== 'habit1' && (
          <button
            onClick={() => handleDeleteHabit(selectedHabitData.id)}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
            title="Удалить"
          >
            🗑️
          </button>
        )}
      </div>

      {editingHabit && (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4 w-full mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Редактировать привычку</h3>
          <input
            type="text"
            value={editingHabit.name}
            onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
            placeholder="Название привычки"
            className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
          />
          <input
            type="text"
            value={editingHabit.description}
            onChange={(e) => setEditingHabit({ ...editingHabit, description: e.target.value })}
            placeholder="Описание привычки"
            className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
          />
          <button
            onClick={handleSaveEdit}
            className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300 shadow-md"
          >
            Сохранить изменения
          </button>
          <button
            onClick={() => setEditingHabit(null)}
            className="w-full px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transform hover:scale-105 transition-all duration-300 shadow-md"
          >
            Отмена
          </button>
        </div>
      )}

      {!editingHabit && selectedHabitData && (
        <>
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            {/* Используем компонент QRCode из react-qrcode-logo */}
            <QRCode 
              value={qrValue} 
              size={200}
              ecLevel="H"
              ref={qrCodeRef}
            />
          </div>
          <p className="text-gray-600 mb-4">{selectedHabitData.description}</p>
        </>
      )}

      {!editingHabit && (
        <div className="w-full space-y-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 shadow-md"
          >
            {showAddForm ? 'Отмена' : 'Добавить привычку'}
          </button>

          {showAddForm && (
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
              <input
                type="text"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="Название привычки"
                className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
              />
              <input
                type="text"
                value={newHabit.description}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                placeholder="Описание привычки"
                className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
              />
              <button
                onClick={handleAddHabit}
                className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300 shadow-md"
              >
                Сохранить
              </button>
            </div>
          )}

          {selectedHabitData && (
            <button
              onClick={handleDownloadQR}
              className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-md"
            >
              Скачать QR-код (PNG)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QRGenerator;

