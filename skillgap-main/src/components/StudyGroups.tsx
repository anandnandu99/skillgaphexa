import React, { useState } from 'react';
import { Users, MessageCircle, Calendar, Clock, Plus, Search, Filter, Star, MapPin } from 'lucide-react';

const StudyGroups = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'programming', name: 'Programming' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'design', name: 'Design' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'mobile', name: 'Mobile Development' }
  ];

  const studyGroups = [
    {
      id: 1,
      name: 'Full Stack Developers',
      description: 'A community for developers learning full-stack development with React, Node.js, and databases.',
      category: 'programming',
      members: 156,
      isPublic: true,
      meetingTime: 'Wednesdays 7:00 PM EST',
      nextMeeting: '2024-01-24T19:00:00Z',
      tags: ['React', 'Node.js', 'MongoDB', 'Express'],
      moderator: 'Sarah Johnson',
      rating: 4.8,
      joined: false,
      avatar: '🚀'
    },
    {
      id: 2,
      name: 'Data Science Enthusiasts',
      description: 'Learn data science, machine learning, and AI together. Share projects and discuss latest trends.',
      category: 'data-science',
      members: 89,
      isPublic: true,
      meetingTime: 'Saturdays 2:00 PM EST',
      nextMeeting: '2024-01-27T14:00:00Z',
      tags: ['Python', 'Machine Learning', 'Statistics', 'Pandas'],
      moderator: 'Dr. Mike Chen',
      rating: 4.9,
      joined: true,
      avatar: '📊'
    },
    {
      id: 3,
      name: 'UI/UX Design Circle',
      description: 'Designers sharing knowledge about user experience, interface design, and design thinking.',
      category: 'design',
      members: 67,
      isPublic: true,
      meetingTime: 'Fridays 6:00 PM EST',
      nextMeeting: '2024-01-26T18:00:00Z',
      tags: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      moderator: 'Emma Wilson',
      rating: 4.7,
      joined: false,
      avatar: '🎨'
    },
    {
      id: 4,
      name: 'Cloud Architecture Masters',
      description: 'Advanced discussions on cloud architecture, DevOps, and infrastructure as code.',
      category: 'cloud',
      members: 134,
      isPublic: false,
      meetingTime: 'Tuesdays 8:00 PM EST',
      nextMeeting: '2024-01-23T20:00:00Z',
      tags: ['AWS', 'Azure', 'Kubernetes', 'Terraform'],
      moderator: 'David Kumar',
      rating: 4.6,
      joined: true,
      avatar: '☁️'
    },
    {
      id: 5,
      name: 'Mobile App Developers',
      description: 'Cross-platform mobile development with React Native, Flutter, and native technologies.',
      category: 'mobile',
      members: 92,
      isPublic: true,
      meetingTime: 'Sundays 3:00 PM EST',
      nextMeeting: '2024-01-28T15:00:00Z',
      tags: ['React Native', 'Flutter', 'iOS', 'Android'],
      moderator: 'Lisa Zhang',
      rating: 4.5,
      joined: false,
      avatar: '📱'
    }
  ];

  const myGroups = studyGroups.filter(group => group.joined);

  const upcomingMeetings = [
    {
      id: 1,
      groupName: 'Data Science Enthusiasts',
      title: 'Introduction to Neural Networks',
      date: '2024-01-27T14:00:00Z',
      duration: '2 hours',
      type: 'Workshop',
      attendees: 23
    },
    {
      id: 2,
      groupName: 'Cloud Architecture Masters',
      title: 'Kubernetes Best Practices',
      date: '2024-01-23T20:00:00Z',
      duration: '1.5 hours',
      type: 'Discussion',
      attendees: 18
    }
  ];

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatMeetingTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Groups</h1>
        <p className="text-gray-600">Connect with peers, share knowledge, and learn together</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'discover', label: 'Discover Groups' },
              { id: 'my-groups', label: 'My Groups' },
              { id: 'meetings', label: 'Upcoming Meetings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'discover' && (
            <div>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search study groups..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
              </div>

              {/* Study Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{group.avatar}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{group.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{group.members} members</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              group.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {group.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{group.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{group.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {group.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{group.meetingTime}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Moderated by {group.moderator}</span>
                      </div>
                    </div>

                    <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      group.joined
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {group.joined ? 'Joined' : 'Join Group'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'my-groups' && (
            <div>
              {myGroups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No groups joined yet</h3>
                  <p className="text-gray-600 mb-4">Join study groups to connect with peers and enhance your learning</p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Discover Groups
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {myGroups.map((group) => (
                    <div key={group.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{group.avatar}</div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                            <p className="text-gray-600">{group.members} members • Next: {formatMeetingTime(group.nextMeeting)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4" />
                            <span>Chat</span>
                          </button>
                          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            Settings
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{group.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {group.tags.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'meetings' && (
            <div>
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                  <p className="text-gray-600">Join study groups to see their upcoming meetings and events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {meeting.type}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{meeting.groupName}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatMeetingTime(meeting.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{meeting.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{meeting.attendees} attending</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            Join Meeting
                          </button>
                          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            Add to Calendar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;