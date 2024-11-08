// pages/index.js

import { useState, useEffect } from 'react';

export default function Home() {
const [newTodos, setNewTodos] = useState('');
const [todos, setTodos] = useState([]);
const [defaultTime, setDefaultTime] = useState(1); // 時間の単位は時間

// ローカルストレージからデータを読み込む
useEffect(() => {
const savedTodos = localStorage.getItem('todos');
if (savedTodos) {
const loadedTodos = JSON.parse(savedTodos).map(todo => ({
...todo,
remainingTime: calculateRemainingTime(todo.deleteAt),
}));
setTodos(loadedTodos);
}
startGlobalTimer();
}, []);

// todosの更新をローカルストレージに保存
useEffect(() => {
localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);

// タスク追加
const addTodos = () => {
const todosArray = newTodos
.trim()
.split('\n')
.filter(todo => todo.trim() !== '');
const newTasks = todosArray.map(todoText => {
const deleteAt = Date.now() + defaultTime * 3600000;
return {
text: todoText,
done: false,
deleteAt,
remainingTime: calculateRemainingTime(deleteAt),
};
});
setTodos([...todos, ...newTasks]);
setNewTodos('');
};

// タスク削除
const removeTodo = index => {
setTodos(todos.filter((_, i) => i !== index));
};

// ファイルへの保存
const saveToFile = () => {
const todosText = todos.map(todo => `${todo.text}${todo.done ? ' (done)' : ''}`).join('\n');
const blob = new Blob([todosText], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `todos-${timestamp}.txt`;

const a = document.createElement('a');
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
};

// リセット
const resetTodos = () => setTodos([]);

// タイマー処理
const startGlobalTimer = () => {
setInterval(() => {
const now = Date.now();
setTodos(currentTodos =>
currentTodos
.map(todo => ({
...todo,
remainingTime: calculateRemainingTime(todo.deleteAt),
}))
.filter(todo => todo.remainingTime > 0)
);
}, 1000);
};

// 残り時間計算
const calculateRemainingTime = deleteAt => {
const remainingTime = deleteAt - Date.now();
return remainingTime > 0 ? remainingTime : 0;
};

// 残り時間のフォーマット
const formatRemainingTime = remainingTime => {
const hours = Math.floor(remainingTime / 3600000);
const minutes = Math.floor((remainingTime % 3600000) / 60000);
const seconds = Math.floor((remainingTime % 60000) / 1000);
return `${hours}h ${minutes}m ${seconds}s `;
};

return (
<div>
    <h1>Todo Timer</h1>
    <textarea value={newTodos} onChange={e=> setNewTodos(e.target.value)}
        placeholder="Enter multiple todos, each on a new line"
      />
      <button onClick={addTodos}>Add Todos</button>
      <button onClick={saveToFile}>Save to File</button>
      <button onClick={resetTodos}>Reset</button>
      <input
        type="number"
        value={defaultTime}
        onChange={e => setDefaultTime(Number(e.target.value))}
        placeholder="時間（時間単位）"
        min="0"
        style={{ width: '60px', marginLeft: '10px' }}
      />
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => {
                const updatedTodos = [...todos];
                updatedTodos[index].done = !updatedTodos[index].done;
                setTodos(updatedTodos);
              }}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            &nbsp;
            {todo.remainingTime >= 0 && (
              <span style={{ fontWeight: 'bold', color: 'red' }}>
                {formatRemainingTime(todo.remainingTime)}
              </span>
            )}
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}