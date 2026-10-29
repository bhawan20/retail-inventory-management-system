import React, { useState, useEffect } from 'react';
import { 
  KanbanSquare, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  User, 
  ArrowRight, 
  BarChart3, 
  RefreshCw, 
  Filter,
  CheckSquare,
  ShieldCheck,
  ChevronRight,
  GitPullRequest
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api } from '../services/api';

export default function AgileCapstoneView() {
  const [activeTab, setActiveTab] = useState('BOARD'); // BOARD, EPICS, SPRINTS, METRICS
  const [overview, setOverview] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Scrum Board
  const [selectedSprint, setSelectedSprint] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const loadAgileData = async () => {
    try {
      setLoading(true);
      const [overviewRes, storiesRes] = await Promise.all([
        api.getAgileOverview(),
        api.getAgileStories(selectedSprint ? { sprint_id: selectedSprint } : {})
      ]);
      setOverview(overviewRes);
      setStories(storiesRes.stories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgileData();
  }, [selectedSprint]);

  const handleMoveStory = async (storyId, newStatus) => {
    try {
      // Optimistic UI update
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, status: newStatus } : s));
      await api.updateStoryStatus(storyId, newStatus);
      const updatedOverview = await api.getAgileOverview();
      setOverview(updatedOverview);
    } catch (err) {
      alert(err.message);
      loadAgileData();
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading Agile Scrum Capstone Suite...</p>
      </div>
    );
  }

  const { summary, epics, sprints } = overview || { summary: {}, epics: [], sprints: [] };

  // Scrum columns
  const columns = [
    { id: 'TO_DO', title: 'Sprint Backlog / To Do', color: 'border-slate-300 bg-slate-50/50' },
    { id: 'IN_PROGRESS', title: 'In Progress (Active Dev)', color: 'border-blue-400 bg-blue-50/20' },
    { id: 'REVIEW', title: 'Code Review & QA Gate', color: 'border-amber-400 bg-amber-50/20' },
    { id: 'DONE', title: 'Accepted & Done (UAT)', color: 'border-emerald-400 bg-emerald-50/20' }
  ];

  const filteredStories = stories.filter(s => {
    if (selectedRole && s.assignee_role !== selectedRole) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Capstone Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider">
                Scrum / Agile Capstone Case Study (P_022)
              </span>
              <span className="text-slate-400 text-xs">• 15 Sprints Delivery</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white tracking-tight">
              Retail Inventory Management Scrum Suite
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Iterative product delivery across 8 distinct business epics, 15 timeboxed sprints, user stories with acceptance criteria, and Jira-style workflow kanban tracking.
            </p>
          </div>

          {/* Quick Metrics Pill */}
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{summary.epics_count}</div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Epics</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">{summary.sprints_count}</div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Sprints</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">{summary.completion_percentage}%</div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('BOARD')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'BOARD' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KanbanSquare className="w-4 h-4 text-blue-600" />
            <span>Interactive Scrum Board</span>
          </button>
          <button
            onClick={() => setActiveTab('EPICS')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'EPICS' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>8 Epics Breakdown</span>
          </button>
          <button
            onClick={() => setActiveTab('SPRINTS')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'SPRINTS' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>15 Sprints Roadmap</span>
          </button>
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'METRICS' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Velocity & Burndown</span>
          </button>
        </div>

        <button
          onClick={loadAgileData}
          className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Scrum State</span>
        </button>
      </div>

      {/* VIEW 1: INTERACTIVE SCRUM BOARD */}
      {activeTab === 'BOARD' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">Sprint Filter:</span>
              <select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                <option value="">All 15 Sprints ({stories.length} stories)</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>
                    Sprint {s.sprint_number}: {s.name.split(':')[1] || s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">Scrum Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                <option value="">All Assignees / Roles</option>
                <option value="Lead Developer">Lead Developer</option>
                <option value="Full Stack Dev">Full Stack Dev</option>
                <option value="Frontend Dev">Frontend Dev</option>
                <option value="Backend Dev">Backend Dev</option>
                <option value="DevOps Specialist">DevOps Specialist</option>
              </select>
            </div>
          </div>

          {/* Kanban Board Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map(col => {
              const colStories = filteredStories.filter(s => s.status === col.id);

              return (
                <div 
                  key={col.id}
                  className={`rounded-2xl border ${col.color} p-4 flex flex-col min-h-[480px] shadow-sm`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                    <span className="font-bold text-xs text-slate-800">{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">
                      {colStories.length}
                    </span>
                  </div>

                  {/* Stories Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colStories.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                        No stories in this column
                      </div>
                    ) : (
                      colStories.map(story => (
                        <div
                          key={story.id}
                          className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-all text-xs space-y-2 group"
                        >
                          {/* Story ID & Points */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-500 text-[11px]">
                              {story.id}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] font-mono">
                              {story.story_points} pts
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {story.title}
                          </h4>

                          {/* User Story format: As a... I want to... */}
                          <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                            <strong>As a</strong> {story.user_role}, <strong>I want to</strong> {story.capability}.
                          </div>

                          {/* Footer: Assignee & Sprint */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                            <div className="flex items-center space-x-1 font-medium text-slate-700">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{story.assignee_role}</span>
                            </div>
                            <span className="font-mono text-slate-400">
                              Sprint {story.sprint_number}
                            </span>
                          </div>

                          {/* Move Story Pipeline Stepper */}
                          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Move:</span>
                            <div className="flex items-center space-x-1">
                              {col.id !== 'TO_DO' && (
                                <button
                                  onClick={() => handleMoveStory(story.id, 'TO_DO')}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium"
                                  title="Move to To Do"
                                >
                                  To Do
                                </button>
                              )}
                              {col.id !== 'IN_PROGRESS' && (
                                <button
                                  onClick={() => handleMoveStory(story.id, 'IN_PROGRESS')}
                                  className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-medium"
                                  title="Move to In Progress"
                                >
                                  In Dev
                                </button>
                              )}
                              {col.id !== 'REVIEW' && (
                                <button
                                  onClick={() => handleMoveStory(story.id, 'REVIEW')}
                                  className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[10px] font-medium"
                                  title="Move to Review"
                                >
                                  Review
                                </button>
                              )}
                              {col.id !== 'DONE' && (
                                <button
                                  onClick={() => handleMoveStory(story.id, 'DONE')}
                                  className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium"
                                  title="Mark Done"
                                >
                                  Done
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: 8 EPICS BREAKDOWN */}
      {activeTab === 'EPICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {epics.map((epic) => (
            <div
              key={epic.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">{epic.id}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{epic.title}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    epic.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {epic.priority}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {epic.description}
                </p>

                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Target Business Value:</div>
                  <div className="text-slate-700 mt-0.5 leading-relaxed font-medium">
                    {epic.business_value}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Sprint Alignment: <strong className="text-slate-800">{epic.target_sprints}</strong></span>
                  <span>{epic.completed_stories} / {epic.total_stories} User Stories Done</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${epic.progress_percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: 15 SPRINTS ROADMAP */}
      {activeTab === 'SPRINTS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Sprint #</th>
                  <th className="py-3 px-4">Sprint Goal & Deliverables</th>
                  <th className="py-3 px-4">Timeframe</th>
                  <th className="py-3 px-4 text-center">Velocity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sprints.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      Sprint {sp.sprint_number}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sp.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sp.goal}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {sp.start_date} → {sp.end_date} ({sp.duration})
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                      {sp.velocity_points} pts
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sp.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800 animate-pulse'
                      }`}>
                        {sp.status === 'COMPLETED' ? 'Completed' : 'Active Sprint'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: VELOCITY & BURNDOWN */}
      {activeTab === 'METRICS' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Sprint Velocity Velocity Tracking (15 Sprints)</h3>
            <p className="text-xs text-slate-500 mb-4">Committed story points delivered per two-week iteration cycle</p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sprints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="sprint_number" tickFormatter={(v) => `S${v}`} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(val) => [`${val} story points`, 'Delivered Velocity']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="velocity_points" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
