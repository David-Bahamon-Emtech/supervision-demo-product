// src/components/RegulatoryUpdates/RegulatoryUpdatesDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllContent } from './regulatoryUpdatesService.js';
import RegulatoryUpdateEditor from './RegulatoryUpdateEditor.jsx';
import RegulatoryUpdateDetailPage from './RegulatoryUpdateDetailPage.jsx';
import { BellIcon, DocumentTextIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css'; // Import your custom styles

const localizer = momentLocalizer(moment);

// --- Reusable Components (no changes needed here) ---
const SummaryCard = ({ title, count, icon }) => {
  return (
    <div className="bg-theme-bg-secondary p-4 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out border border-theme-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-theme-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-theme-text-primary">{count === null ? '...' : count}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-full bg-black bg-opacity-20">
            {React.cloneElement(icon, { className: 'text-theme-accent w-6 h-6' })}
          </div>
        )}
      </div>
    </div>
  );
};

const ContentRow = ({ item, onSelectContent }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'Published': return 'bg-theme-success-bg text-theme-success-text border border-theme-success-border';
            case 'Draft': return 'bg-theme-warning-bg text-theme-warning-text border border-theme-warning-border';
            case 'Archived': case 'Superseded': return 'bg-theme-bg-secondary text-theme-text-secondary border border-theme-border';
            case 'Scheduled': return 'bg-theme-info-bg text-theme-info-text border border-theme-info-border';
            default: return 'bg-theme-bg-secondary text-theme-text-secondary border border-theme-border';
        }
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <tr className="hover:bg-theme-bg cursor-pointer" onClick={() => onSelectContent(item.id)}>
            <td className="px-6 py-4 whitespace-normal text-sm font-medium text-theme-accent hover:text-white">
                {item.title}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{item.type}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                    {item.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">
                {formatDate(item.issueDate || item.eventDate)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400 hover:text-theme-accent">
                {item.id}
            </td>
        </tr>
    );
};

const CustomEvent = ({ event }) => {
  let colorClass = 'bg-blue-500';
  const type = event.resource?.type?.toLowerCase();
  if (type === 'consultation') colorClass = 'bg-teal-500';
  if (type === 'webinar') colorClass = 'bg-indigo-500';
  if (type === 'conference') colorClass = 'bg-purple-500';
  if (type === 'training') colorClass = 'bg-orange-500';

  return (
    <div className="flex items-center h-full">
      <div className={`w-1 h-full mr-2 ${colorClass}`}></div>
      <div className="text-xs truncate">{event.title}</div>
    </div>
  );
};


const RegulatoryUpdatesDashboardPage = () => {
  const [allContent, setAllContent] = useState([]);
  const [summaryData, setSummaryData] = useState({ updates: null, publications: null, events: null });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Updates');

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [contentToEdit, setContentToEdit] = useState(null);
  const [newContentType, setNewContentType] = useState('Update');

  const [selectedContentId, setSelectedContentId] = useState(null);
  
  // --- NEW: State for controlling the calendar ---
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');


  const fetchData = useCallback(async () => {
    if (selectedContentId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const contentData = await getAllContent();
    setAllContent(contentData || []);

    if (contentData) {
        const updates = contentData.filter(c => c.contentType === 'Update').length;
        const publications = contentData.filter(c => c.contentType === 'Publication').length;
        const events = contentData.filter(c => c.contentType === 'Event').length;
        setSummaryData({ updates, publications, events });
    }
    setIsLoading(false);
  }, [selectedContentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectContent = useCallback((contentId) => {
    setSelectedContentId(contentId);
  }, []);

  const handleBackToList = () => {
    setSelectedContentId(null);
    fetchData();
  };

  const handleOpenCreatorModal = (contentType) => {
    setNewContentType(contentType);
    setContentToEdit(null);
    setIsEditorModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditorModalOpen(false);
    setContentToEdit(null);
  };

  const handleSaveSuccess = (savedContent) => {
    handleCloseModal();
    fetchData();
    setActiveTab(savedContent.contentType === 'Publication' ? 'Publications' : savedContent.contentType === 'Event' ? 'Events' : 'Updates');
  };
  
    // --- NEW: Handlers for calendar navigation and view changes ---
  const handleNavigate = useCallback((newDate) => setCalendarDate(newDate), []);
  const handleView = useCallback((newView) => setCalendarView(newView), []);


  const eventPropGetter = useCallback((event) => {
    let className = 'text-white rounded-md p-0 border-none overflow-hidden';
    const type = event.resource?.type?.toLowerCase();
    
    if (type === 'consultation') {
      className += ' bg-teal-800 hover:bg-teal-700';
    } else if (type === 'webinar') {
      className += ' bg-indigo-800 hover:bg-indigo-700';
    } else if (type === 'conference') {
      className += ' bg-purple-800 hover:bg-purple-700';
    } else if (type === 'training') {
      className += ' bg-orange-800 hover:bg-orange-700';
    } else {
      className += ' bg-blue-800 hover:bg-blue-700';
    }
    
    return { className };
  }, []);

  if (isLoading) {
    return <div className="p-6 text-center text-theme-text-secondary">Loading content...</div>;
  }

  if (selectedContentId) {
    return <RegulatoryUpdateDetailPage updateId={selectedContentId} onBack={handleBackToList} />;
  }

  const filteredContent = allContent.filter(item => item.contentType === activeTab.slice(0, -1));
  
  const eventsForCalendar = allContent
    .filter(item => item.contentType === 'Event' && item.eventDate)
    .map(event => ({
        title: event.title,
        start: new Date(event.eventDate),
        end: new Date(event.eventEndDate || event.eventDate),
        allDay: !event.eventEndDate,
        resource: event,
    }));

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-theme-text-primary">Regulatory Content Hub</h1>
          <p className="text-theme-text-secondary mt-1">Manage and track all regulatory changes, guidance, and publications.</p>
        </div>
        <div className="flex space-x-2">
            <button
                onClick={() => handleOpenCreatorModal('Update')}
                className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent"
            >
                + New Update
            </button>
             <button
                onClick={() => handleOpenCreatorModal('Publication')}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-gray-500"
            >
                + New Publication
            </button>
        </div>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <SummaryCard title="Active Updates" count={summaryData.updates} icon={<BellIcon />} />
            <SummaryCard title="Publications" count={summaryData.publications} icon={<DocumentTextIcon />} />
            <SummaryCard title="Scheduled Events" count={summaryData.events} icon={<CalendarDaysIcon />} />
       </div>

      <div className="mb-6">
        <div className="flex border-b border-theme-border">
            {['Updates', 'Publications', 'Events'].map(tabName => (
                <button key={tabName} onClick={() => setActiveTab(tabName)} className={`py-3 px-4 sm:px-6 -mb-px font-medium text-sm focus:outline-none ${activeTab === tabName ? 'border-b-2 border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'}`}>
                    {tabName}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-theme-bg-secondary shadow-xl rounded-lg overflow-x-auto border border-theme-border">
        <table className="min-w-full divide-y divide-theme-border">
          <thead className="bg-black bg-opacity-20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">
                {activeTab === 'Events' ? 'Event Date' : 'Issue Date'}
              </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Content ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {filteredContent.length > 0 ? filteredContent.map((item) => (
                <ContentRow key={item.id} item={item} onSelectContent={handleSelectContent} />
            )) : (
                <tr>
                    <td colSpan="5" className="text-center py-10 text-theme-text-secondary italic">
                        No {activeTab} found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      
        {activeTab === 'Events' && (
            <div className="mt-8 bg-theme-bg-secondary p-4 rounded-lg shadow-lg border border-theme-border" style={{ height: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={eventsForCalendar}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={event => handleSelectContent(event.resource.id)}
                    eventPropGetter={eventPropGetter}
                    components={{
                        event: CustomEvent,
                    }}
                    // --- ADDED: Controlled component props ---
                    date={calendarDate}
                    view={calendarView}
                    onNavigate={handleNavigate}
                    onView={handleView}
                />
            </div>
        )}

      {isEditorModalOpen && (
        <RegulatoryUpdateEditor
            isOpen={isEditorModalOpen}
            contentToEdit={contentToEdit}
            contentType={newContentType}
            onClose={handleCloseModal}
            onSave={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default RegulatoryUpdatesDashboardPage;