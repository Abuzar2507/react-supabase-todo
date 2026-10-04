import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import TodoInput from './Components/TodoInput';
import TodoList from './Components/TodoList';
import Auth from './Components/Auth';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Auth state change listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch tasks for the authenticated user only
  const fetchTasks = async () => {
    if (!session?.user) return;
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id) // Strict user_id filtering
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(`Tasks load nahi ho sake: ${error.message}`);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  // User/Session change hone par tasks refresh karein
  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    } else {
      setTodos([]);
    }
  }, [session]);

  // 3. Add new task
  const addTask = async (title) => {
    if (!title.trim() || !session?.user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title: title.trim(),
          user_id: session.user.id, // Task user se attach hoga
          is_completed: false,
        },
      ])
      .select();

    if (error) {
      setErrorMessage(`Task add nahi ho saka: ${error.message}`);
    } else if (data) {
      setTodos((prev) => [data[0], ...prev]);
    }
  };

  // 4. Toggle task completion status
  const toggleTask = async (id, currentStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      setErrorMessage(`Task update nahi ho saka: ${error.message}`);
    } else {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, is_completed: !currentStatus } : todo
        )
      );
    }
  };

  // 5. Delete task
  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      setErrorMessage(`Task delete nahi ho saka: ${error.message}`);
    } else {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  // Agar user logged in nahi hai toh Auth screen dikhayein
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar user={session.user} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">My To-Do List</h1>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {errorMessage}
          </div>
        )}

        <TodoInput onAddTask={addTask} />

        {loading ? (
          <p className="text-center text-gray-500 mt-6">Tasks loading...</p>
        ) : (
          <TodoList
            todos={todos}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        )}
      </main>
    </div>
  );
}