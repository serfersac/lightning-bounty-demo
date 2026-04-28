import React, { useState, useEffect } from 'react';

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      // Handle session completion and mode switch
      setIsActive(false);
      alert(mode === 'work' ? 'Time for a break!' : 'Back to work!');
      setMode(mode === 'work' ? 'break' : 'work');
      setTime(mode === 'work' ? 5 * 60 : 25 * 60);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTime(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center p-4 bg-gray-800 text-white rounded-lg">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => switchMode('work')}
          className={`px-4 py-2 rounded-l-md ${mode === 'work' ? 'bg-red-500' : 'bg-gray-700'}`}
        >
          Work
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`px-4 py-2 rounded-r-md ${mode === 'break' ? 'bg-green-500' : 'bg-gray-700'}`}
        >
          Break
        </button>
      </div>
      <div className="text-6xl font-mono mb-4">{formatTime(time)}</div>
      <div className="flex justify-center space-x-4">
        <button onClick={toggleTimer} className="px-6 py-2 bg-blue-500 rounded-md">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={resetTimer} className="px-6 py-2 bg-gray-600 rounded-md">
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
