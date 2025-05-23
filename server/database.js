const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // First, check if tasks table exists and needs to be updated
      db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'", (err, row) => {
        if (err) {
          console.error('Error checking tasks table:', err);
          reject(err);
          return;
        }

        if (row) {
          const tableSchema = row.sql;
          let needsUpdate = false;
          
          // Check if table needs updates
          if (tableSchema.includes('due_date TEXT NOT NULL')) {
            console.log('Table needs update: due_date should be nullable');
            needsUpdate = true;
          }
          
          if (!tableSchema.includes('completed')) {
            console.log('Table needs update: missing completed column');
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            console.log('Updating tasks table schema...');
            // Drop and recreate table with correct schema
            db.run('DROP TABLE IF EXISTS tasks', (dropErr) => {
              if (dropErr) {
                console.error('Error dropping tasks table:', dropErr);
                reject(dropErr);
                return;
              }
              createTasksTable();
            });
          } else {
            console.log('Tasks table schema is up to date');
            resolve();
          }
        } else {
          createTasksTable();
        }

        function createTasksTable() {
          db.run(`
            CREATE TABLE IF NOT EXISTS tasks (
              id TEXT PRIMARY KEY,
              user_id INTEGER NOT NULL,
              title TEXT NOT NULL,
              due_date TEXT,
              completed BOOLEAN DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users (id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating tasks table:', err);
              reject(err);
            } else {
              console.log('Tasks table ready with nullable due_date and completed field');
              resolve();
            }
          });
        }
      });
    });
  });
};

const createUser = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      db.run(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash],
        function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
              reject(new Error('Username already exists'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id: this.lastID, username });
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

const findUser = (username) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const createTask = (taskId, userId, title, dueDate, completed = false) => {
  return new Promise((resolve, reject) => {
    console.log('Creating task with:', { taskId, userId, title, dueDate, completed });
    db.run(
      'INSERT INTO tasks (id, user_id, title, due_date, completed) VALUES (?, ?, ?, ?, ?)',
      [taskId, userId, title, dueDate, completed ? 1 : 0],
      function(err) {
        if (err) {
          console.error('Database error creating task:', err);
          reject(err);
        } else {
          console.log('Task created successfully');
          resolve({ 
            id: taskId, 
            userId, 
            title, 
            dueDate: dueDate,
            completed: completed,
            createdAt: new Date().toISOString() 
          });
        }
      }
    );
  });
};

const getUserTasks = (userId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC',
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

const updateTask = (taskId, userId, updates) => {
  return new Promise((resolve, reject) => {
    const { title, dueDate, completed } = updates;
    console.log('Updating task with:', { taskId, userId, updates });
    
    db.run(
      'UPDATE tasks SET title = ?, due_date = ?, completed = ? WHERE id = ? AND user_id = ?',
      [title, dueDate, completed ? 1 : 0, taskId, userId],
      function(err) {
        if (err) {
          console.error('Database error updating task:', err);
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Task not found'));
        } else {
          console.log('Task updated successfully');
          resolve({ id: taskId, ...updates });
        }
      }
    );
  });
};

const deleteTask = (taskId, userId) => {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};

module.exports = {
  initDatabase,
  createUser,
  findUser,
  verifyPassword,
  createTask,
  getUserTasks,
  updateTask,
  deleteTask
};