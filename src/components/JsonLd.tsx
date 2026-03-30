import { useEffect } from 'react';
import { getResourcesData } from '@/lib/resourcesData';

const BASE_URL = 'https://elpisworship.com';

export default function JsonLd() {
  useEffect(() => {
    // Upcoming events schema
    const { events } = getResourcesData();
    const upcoming = events.filter(e => e.type === 'upcoming');

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
  }, []);

  return null;
}
