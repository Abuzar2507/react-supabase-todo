import React, { useState } from 'react';

const TodoInput = ({ onAddTask }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onAddTask(text.trim());
    setText(''); // Input صاف کرنے کے لیے
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        placeholder="نیا ٹاسک لکھیں..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
      />
      <button
        type="submit"
        className="bg-slate-800 text-white px-5 py-2 rounded-lg hover:bg-slate-700 transition duration-150 font-medium"
      >
        Add Task
      </button>
    </form>
  );
};

export default TodoInput;