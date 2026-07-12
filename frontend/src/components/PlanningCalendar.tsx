'use client';

import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '@/lib/api';
import { PlanningSlot } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from 'sonner';

export default function PlanningCalendar() {
    const [slots, setSlots] = useState<PlanningSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const calendarRef = useRef<FullCalendar>(null);

    const fetchSlots = () => {
        api.get('/planning/slots')
            .then((res) => setSlots(res.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleEventDrop = async (info: any) => {
        const { event } = info;
        try {
            await api.put(`/planning/slots/${event.id}`, {
                start: event.start,
                end: event.end,
            });
            toast.success('Créneau mis à jour avec succès');
            fetchSlots();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du créneau');
            info.revert();
        }
    };

    const handleEventResize = async (info: any) => {
        const { event } = info;
        try {
            await api.put(`/planning/slots/${event.id}`, {
                start: event.start,
                end: event.end,
            });
            toast.success('Durée du créneau mise à jour');
            fetchSlots();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
            info.revert();
        }
    };

    const events = slots.map(slot => ({
        id: slot._id,
        title: `${slot.teamName} ${slot.complaintNumber ? \`(#\${slot.complaintNumber})\` : ''}`,
        start: slot.start,
        end: slot.end,
        backgroundColor: '#6366f1',
        borderColor: '#4f46e5',
        textColor: '#ffffff'
    }));

    if (loading) return <LoadingSpinner />;

    return (
        <section className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Planning des Interventions</h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <div className="calendar-container h-[600px]">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        locale="fr"
                        events={events}
                        editable={true}
                        droppable={true}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        slotMinTime="06:00:00"
                        slotMaxTime="22:00:00"
                        allDaySlot={false}
                        height="100%"
                        eventClassNames="cursor-pointer shadow-sm rounded-md border-0 text-xs font-semibold px-2 py-1"
                    />
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: \`
                .calendar-container .fc-theme-standard td, .calendar-container .fc-theme-standard th {
                    border-color: #e2e8f0;
                }
                .calendar-container .fc-button-primary {
                    background-color: #f8fafc;
                    border-color: #e2e8f0;
                    color: #475569;
                    text-transform: capitalize;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                .calendar-container .fc-button-primary:hover {
                    background-color: #f1f5f9;
                    border-color: #cbd5e1;
                    color: #1e293b;
                }
                .calendar-container .fc-button-active {
                    background-color: #6366f1 !important;
                    border-color: #6366f1 !important;
                    color: #ffffff !important;
                }
                .calendar-container .fc-col-header-cell-cushion {
                    color: #475569;
                    text-decoration: none;
                    font-weight: 700;
                    padding: 8px 4px;
                }
                .calendar-container .fc-timegrid-slot-label-cushion {
                    color: #64748b;
                    font-size: 0.75rem;
                }
            \`}} />
        </section>
    );
}
