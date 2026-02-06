import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import TodoFilter from './components/TodoFilter';
import { FilterType } from '@shared/types/api';
import './App.css';
import { useDebounce } from './hooks/useDebounce';

const queryClient = new QueryClient();

function App() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header className="app-header"><h1>Todo App</h1></header>
        <main className="app-main">
          <div className="todo-container">
            <TodoForm />
            <div className="todo-search-filter">
              <TodoFilter currentFilter={filter} onFilterChange={setFilter} />
              <input type="text" placeholder="Enter todo title" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="form-input todo-search-input"/>
            </div>
            <TodoList filter={filter} searchQuery={debouncedSearchQuery || undefined}/>
          </div>
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
