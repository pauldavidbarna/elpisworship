import { useEffect } from 'react';
import { isUpcomingEvent } from '@/lib/resourcesData';
import { useResourcesData } from '@/hooks/useResourcesData';

const BASE_URL = 'https://elpisworship.com';

export default function JsonLd() {
  const { events } = useResourcesData();
  useEffect(() => {
    // Upcoming events schema
    const upcoming = events.filter(e => isUpcomingEvent(e));

    document.getElementById('jsonld-events')?.remove();

    if (upcoming.length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'jsonld-events';
      script.textContent = JSON.stringify(
        upcoming.map(event => ({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          startDate: event.date,
          location: {
            '@type': 'Place',
            name: event.location,
            ...(event.locationUrl && { url: event.locationUrl }),
          },
          url: event.ticketUrl ?? BASE_URL,
          organizer: {
            '@type': 'MusicGroup',
            name: 'Elpis Worship',
            url: BASE_URL,
          },
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        }))
      );
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById('jsonld-events')?.remove();
    };
  }, [events]);

  return null;
}
