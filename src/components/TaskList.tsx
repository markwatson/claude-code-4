import React from 'react';
import { Task } from '../types';
import { formatDate, getDateLabel } from '../utils/dateUtils';

interface TaskListProps {
  tasks: Task[];
  title: string;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, title, onDeleteTask, onToggleComplete }) => {
  return (
    <div className="task-list">
      <h2>{title}</h2>
      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                className="task-checkbox"
              />
              <div className="task-content">
                <h4>{task.title}</h4>
                {task.dueDate && (
                  <p className={`due-date ${getDateLabel(task.dueDate).toLowerCase()}`}>
                    Due: {getDateLabel(task.dueDate)}
                    {getDateLabel(task.dueDate) !== formatDate(task.dueDate) && 
                      ` (${formatDate(task.dueDate)})`
                    }
                  </p>
                )}
                {!task.dueDate && <p className="no-due-date">No due date</p>}
              </div>
              <button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                    onDeleteTask(task.id);
                  }
                }}
                className="delete-btn"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};