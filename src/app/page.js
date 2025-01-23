'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, CheckCircle2, Clock, Tag, Trash2, AlertCircle, Search, Hash, BarChart2 } from 'lucide-react';

const ProgrammerTodo = () => {
  const [tasks, setTasks] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'feature',
    priority: 'medium',
    deadline: '',
    status: 'pending',
    tags: '',
    description: '',
    estimatedTime: ''
  });

  useEffect(() => {
    setIsClient(true);
    const savedTasks = localStorage.getItem('programmerTasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Error loading tasks:', e);
        setTasks([]);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('programmerTasks', JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    const newTaskWithId = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      tags: newTask.tags ? newTask.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };
    
    setTasks(prevTasks => [...prevTasks, newTaskWithId]);
    setNewTask({
      title: '',
      type: 'feature',
      priority: 'medium',
      deadline: '',
      status: 'pending',
      tags: '',
      description: '',
      estimatedTime: ''
    });
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'feature':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'bug':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'refactor':
        return <Tag className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatistics = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const byType = {
      feature: tasks.filter(t => t.type === 'feature').length,
      bug: tasks.filter(t => t.type === 'bug').length,
      refactor: tasks.filter(t => t.type === 'refactor').length
    };
    
    return { total, completed, inProgress, pending, byType };
  };

  const filterTasks = (tasks) => {
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (task.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = filterType === 'all' || task.type === filterType;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        return matchesSearch && matchesType && matchesPriority;
      });
  };

  const TaskStatistics = () => {
    const stats = getTaskStatistics();
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const TaskCard = ({ task }) => (
    <Alert key={task.id} className="relative overflow-hidden group bg-white hover:bg-gray-50 transition-all duration-300">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gray-200 to-gray-300 group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-300" />
      <div className="flex flex-col md:flex-row md:items-center justify-between pl-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors duration-300">
            {getTypeIcon(task.type)}
          </div>
          <div className="flex-1">
            <AlertDescription className="text-lg font-medium">{task.title}</AlertDescription>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(task.priority)} transition-colors duration-300`}>
                {task.priority}
              </span>
              {task.deadline && (
                <span className="text-xs flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  <Clock className="w-3 h-3" />
                  {task.deadline}
                </span>
              )}
              {task.estimatedTime && (
                <span className="text-xs flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  <Clock className="w-3 h-3" />
                  {task.estimatedTime}h
                </span>
              )}
              {task.tags && task.tags.map((tag, index) => (
                <span key={index} className="text-xs flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-300">
                  <Hash className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          {task.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateTaskStatus(task.id, 'in-progress')}
              className={`${
                task.status === 'in-progress' 
                ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' 
                : 'hover:bg-gray-100'
              } transition-colors duration-300`}
            >
              In Progress
            </Button>
          )}
          {task.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateTaskStatus(task.id, 'completed')}
              className="text-green-600 hover:bg-green-100 transition-colors duration-300"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTask(task.id)}
            className="text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );

  if (!isClient) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">โปรแกรมเมอร์ Todo List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6" />
            โปรแกรมเมอร์ Todo List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskStatistics />
          
          <form onSubmit={addTask} className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title..."
                className="flex-1"
              />
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
                <option value="refactor">Refactor</option>
              </select>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Description..."
                className="flex-1"
              />
              <Input
                type="text"
                value={newTask.tags}
                onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                placeholder="Tags (comma separated)..."
                className="flex-1"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="w-full md:w-40"
              />
              <Input
                type="number"
                value={newTask.estimatedTime}
                onChange={(e) => setNewTask({ ...newTask, estimatedTime: e.target.value })}
                placeholder="Estimated hours..."
                className="w-full md:w-40"
              />
              <Button type="submit" className="w-full md:w-auto">Add Task</Button>
            </div>
          </form>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full"
                prefix={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="feature">Features</option>
              <option value="bug">Bugs</option>
              <option value="refactor">Refactor</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full p-1 bg-gray-100/30 backdrop-blur-sm rounded-lg">
              <TabsTrigger 
                value="pending" 
                className="flex-1 relative group transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/80 to-amber-200/80 rounded-md opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-2 py-2 px-4">
                  <span>Pending</span>
                  <span className="flex items-center justify-center h-6 min-w-6 px-2 text-sm font-medium rounded-full bg-white/80 text-amber-700 shadow-sm">
                    {filterTasks(tasks.filter(t => t.status === 'pending')).length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="in-progress" 
                className="flex-1 relative group transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-blue-200/80 rounded-md opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-2 py-2 px-4">
                  <span>In Progress</span>
                  <span className="flex items-center justify-center h-6 min-w-6 px-2 text-sm font-medium rounded-full bg-white/80 text-blue-700 shadow-sm">
                    {filterTasks(tasks.filter(t => t.status === 'in-progress')).length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="flex-1 relative group transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-100/80 to-green-200/80 rounded-md opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-2 py-2 px-4">
                  <span>Completed</span>
                  <span className="flex items-center justify-center h-6 min-w-6 px-2 text-sm font-medium rounded-full bg-white/80 text-green-700 shadow-sm">
                    {filterTasks(tasks.filter(t => t.status === 'completed')).length}
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="in-progress" className="mt-6 space-y-4">
              {filterTasks(tasks.filter(t => t.status === 'in-progress')).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </TabsContent>
            <TabsContent value="completed" className="mt-6 space-y-4">
              {filterTasks(tasks.filter(t => t.status === 'completed')).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgrammerTodo;
