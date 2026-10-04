import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import Auth from './components/Auth';
import { supabase } from './lib/supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState('all');

  // 1. Supabase Auth Session Check & Listener
  useEffect(() => {
    // Current user session check karein
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Realtime auth state change listen karein (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Tasks jab user logged in ho
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTodos([]);
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(`Tasks load nahi ho sake: ${error.message}`);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  // 3. Auth Handlers (Login & Signup with Dynamic Email Redirect)
  const handleAuthSubmit = async ({ email, password, isSignUp }) => {
    setLoading(true);
    setErrorMessage('');

    if (isSignUp) {
      // User Signup with emailRedirectTo option
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Localhost ho ya live domain, yeh automatic current URL uthayega
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        alert('Signup successful! Apni email open karke confirmation link par click karein.');
      }
    } else {
      // User Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 4. Database CRUD Operations
  const handleAddTask = async (titleText) => {
    setErrorMessage('');

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: titleText, is_completed: false, user_id: user?.id }])
      .select();

    if (error) {
      setErrorMessage(`Task save nahi ho saka: ${error.message}`);
    } else if (data) {
      setTodos([data[0], ...todos]);
    }
  };

  const handleToggle = async (id) => {
    const taskToToggle = todos.find((todo) => todo.id === id);
    if (!taskToToggle) return;
    const updatedStatus = !taskToToggle.is_completed;

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: updatedStatus })
      .eq('id', id);

    if (error) {
      setErrorMessage(`Status update nahi hua: ${error.message}`);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_completed: updatedStatus } : todo
        )
      );
    }
  };

  const handleEdit = async (id, newTitle) => {
    const { error } = await supabase
      .from('tasks')
      .update({ title: newTitle })
      .eq('id', id);

    if (error) {
      setErrorMessage(`Task edit nahi hua: ${error.message}`);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, title: newTitle } : todo
        )
      );
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      setErrorMessage(`Task delete nahi hua: ${error.message}`);
    } else {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.is_completed;
    if (filter === 'completed') return todo.is_completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <Navbar user={user} onLogout={handleLogout} />

      {!user ? (
        /* Unauthenticated View: Auth Form */
        <Auth
          onAuthSubmit={handleAuthSubmit}
          loading={loading}
          errorMessage={errorMessage}
        />
      ) : (
        /* Authenticated View: Main App */
        <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800">My Tasks</h2>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}

          <TodoInput onAddTask={handleAddTask} />

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-4 border-b border-slate-200 pb-3">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-md capitalize font-medium transition ${
                  filter === f
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Task List */}
          {loading ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              Database se tasks load ho rahe hain...
            </div>
          ) : (
            <TodoList
              todos={filteredTodos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;