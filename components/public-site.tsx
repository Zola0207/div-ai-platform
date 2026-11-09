'use client';

import { FormEvent, useState } from 'react';
import { SitePreview, type Booking, type SiteDraft } from './site-preview';

export default function PublicSite({
  draft,
  siteId,
  initialBookings,
}: {
  draft: SiteDraft;
  siteId: string;
  initialBookings: Booking[];
}) {
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

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
    <SitePreview
      draft={draft}
      onBooking={handleBooking}
      bookingMessage={bookingMessage}
      bookings={bookings}
      variant="page"
    />
  );
}
