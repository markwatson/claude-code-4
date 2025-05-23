import React, { useState, useMemo, useEffect } from 'react';
import { Task } from './types';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { AuthForm } from './components/AuthForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { tasksAPI } from './services/api';
import { isMustDo } from './utils/dateUtils';
import './App.css';

function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await tasksAPI.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        completed: false
      };
      
      await tasksAPI.createTask(newTask);
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const toggleTaskComplete = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const updatedTask = { ...task, completed: !task.completed };
      await tasksAPI.updateTask(updatedTask);
      
      setTasks(prev => prev.map(t => 
        t.id === id ? updatedTask : t
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const { allTasks, mustDoTasks } = useMemo(() => {
    const mustDo = tasks.filter(task => isMustDo(task.dueDate));
    const all = tasks.filter(task => !isMustDo(task.dueDate));
    
    const sortTasks = (taskList: Task[]) => {
      return taskList.sort((a, b) => {
        // Completed tasks go to bottom
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // Then sort by due date
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
    };
    
    return {
      allTasks: sortTasks(all),
      mustDoTasks: sortTasks(mustDo)
    };
  }, [tasks]);

  if (!user) {
    return <AuthForm />;
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>Todo List</h1>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      
      <div className="main-content">
        <div className="left-sidebar">
          <TaskForm onAddTask={addTask} />
          <TaskList 
            tasks={allTasks} 
            title="All Tasks" 
            onDeleteTask={deleteTask}
            onToggleComplete={toggleTaskComplete}
          />
        </div>
        
        <div className="right-column">
          <TaskList 
            tasks={mustDoTasks} 
            title="Must Do (Today, Tomorrow & Overdue)" 
            onDeleteTask={deleteTask}
            onToggleComplete={toggleTaskComplete}
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TodoApp />
    </AuthProvider>
  );
}

export default App;