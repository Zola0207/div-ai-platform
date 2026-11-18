'use client';

import { FormEvent, useEffect, useState } from 'react';
import { SitePreview, type Booking, type SiteDraft } from './site-preview';
import SiteApp from './site-app';

export default function PublicSite({
  draft,
  siteId,
  slug,
  initialBookings,
}: {
  draft: SiteDraft;
  siteId: string;
  slug: string;
  initialBookings: Booking[];
}) {
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  // Jedna poseta po sesiji po sajtu — bez kolačića i bez ličnih podataka.
  useEffect(() => {
    const key = `div-view-${siteId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Privatni režim može da blokira sessionStorage — tada samo brojimo.
    }

    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('div-session-id') ?? '';
      if (!sessionId) {
        sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('div-session-id', sessionId);
      }
    } catch {
      sessionId = '';
    }

    void fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        siteId,
        path: window.location.pathname,
        referrer: document.referrer,
        sessionId,
      }),
    }).catch(() => undefined);
  }, [siteId]);

  const handleBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const booking: Booking = {
      id: `${Date.now()}`,
      businessName: draft.businessName,
      clientName: String(data.get('clientName') ?? '').trim(),
      phone: String(data.get('clientPhone') ?? '').trim(),
      service: String(data.get('service') ?? '').trim(),
      date: String(data.get('date') ?? ''),
      time: String(data.get('time') ?? ''),
      siteId,
    };

    if (!booking.clientName || !booking.phone) {
      setBookingMessage('Unesite ime i broj telefona.');
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      if (!res.ok) {
        setBookingMessage('Slanje trenutno nije moguće. Pozovite nas telefonom.');
        return;
      }
      setBookings((current) => [...current, booking]);
      setBookingMessage('Hvala! Zahtev je poslat — javićemo se radi potvrde.');
      form.reset();
    } catch {
      setBookingMessage('Slanje trenutno nije moguće. Pozovite nas telefonom.');
    }
  };

  return (
    <>
      <SitePreview
        draft={draft}
        onBooking={handleBooking}
        bookingMessage={bookingMessage}
        bookings={bookings}
        variant="page"
      />
      <SiteApp slug={slug} name={draft.businessName} accent={draft.accentColor} />
    </>
  );
}
