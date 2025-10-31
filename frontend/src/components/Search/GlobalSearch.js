import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FolderKanban, ListTodo, Users, Clock } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({
    projects: [],
    tasks: [],
    members: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], tasks: [], members: [] });
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setIsOpen(true);

    try {
      const lowercaseQuery = searchQuery.toLowerCase();
      
      // Search projects
      const projectResults = projects.filter(project =>
        project.name.toLowerCase().includes(lowercaseQuery) ||
        project.description?.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 5);

      // Search tasks
      const taskResults = tasks.filter(task =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.description?.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 5);

      // Mock member search (in real app, this would come from API)
      const memberResults = [
        { id: 'user1', username: 'john_doe', name: 'John Doe', role: 'developer' },
        { id: 'user2', username: 'jane_smith', name: 'Jane Smith', role: 'manager' },
        { id: 'user3', username: 'bob_wilson', name: 'Bob Wilson', role: 'designer' }
      ].filter(member =>
        member.username.toLowerCase().includes(lowercaseQuery) ||
        member.name.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 3);

      setResults({
        projects: projectResults,
        tasks: taskResults,
        members: memberResults
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    const allResults = [
      ...results.projects.map(item => ({ ...item, type: 'project' })),
      ...results.tasks.map(item => ({ ...item, type: 'task' })),
      ...results.members.map(item => ({ ...item, type: 'member' }))
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allResults[selectedIndex]) {
          handleResultClick(allResults[selectedIndex]);
        }
        break;
    }
  };

  const handleResultClick = (item) => {
    switch (item.type) {
      case 'project':
        navigate(`/projects/${item.id}`);
        break;
      case 'task':
        navigate(`/tasks/${item.id}`);
        break;
      case 'member':
        navigate(`/users/${item.id}`);
        break;
    }
    setIsOpen(false);
    setQuery('');
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-4 h-4 text-blue-600" />;
      case 'task':
        return <ListTodo className="w-4 h-4 text-green-600" />;
      case 'member':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Search className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatResultText = (item, type) => {
    const queryLower = query.toLowerCase();
    const text = type === 'member' ? item.name : item.title || item.name;
    const index = text.toLowerCase().indexOf(queryLower);
    
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    
    return (
      <span>
        {before}
        <mark className="bg-yellow-200 px-1 rounded">{match}</mark>
        {after}
      </span>
    );
  };

  const allResults = [
    ...results.projects.map(item => ({ ...item, type: 'project' })),
    ...results.tasks.map(item => ({ ...item, type: 'task' })),
    ...results.members.map(item => ({ ...item, type: 'member' }))
  ];

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search projects, tasks, members..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : allResults.length > 0 ? (
            <div className="py-2">
              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Projects
                  </div>
                  {results.projects.map((project, index) => {
                    const globalIndex = index;
                    return (
                      <button
                        key={project.id}
                        onClick={() => handleResultClick({ ...project, type: 'project' })}
                        className={`
                          w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                          ${selectedIndex === globalIndex ? 'bg-blue-50' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {getResultIcon('project')}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {formatResultText(project, 'project')}
                            </div>
                            {project.description && (
                              <div className="text-xs text-gray-500 truncate">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Tasks
                  </div>
                  {results.tasks.map((task, index) => {
                    const globalIndex = results.projects.length + index;
                    return (
                      <button
                        key={task.id}
                        onClick={() => handleResultClick({ ...task, type: 'task' })}
                        className={`
                          w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                          ${selectedIndex === globalIndex ? 'bg-blue-50' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {getResultIcon('task')}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {formatResultText(task, 'task')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {task.project_name} • {task.status}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Members */}
              {results.members.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Team Members
                  </div>
                  {results.members.map((member, index) => {
                    const globalIndex = results.projects.length + results.tasks.length + index;
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleResultClick({ ...member, type: 'member' })}
                        className={`
                          w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                          ${selectedIndex === globalIndex ? 'bg-blue-50' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {getResultIcon('member')}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {formatResultText(member, 'member')}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{member.username} • {member.role}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : query ? (
            <div className="p-4 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
