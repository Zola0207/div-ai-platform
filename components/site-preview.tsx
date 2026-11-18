'use client';

import BoldLayout from './layouts/bold';
import ClassicLayout from './layouts/classic';
import EditorialLayout from './layouts/editorial';
import { layoutOf, type LayoutProps } from './blocks/site-types';

export type { Availability, BlockId, Booking, BookingType, LayoutId, SiteDraft } from './blocks/site-types';
export { LAYOUTS, LAYOUT_IDS } from './blocks/site-types';

// Ulazna tačka za prikaz sajta. Dizajn se bira u nacrtu, tako da isti
// sadržaj može da izađe kao klasičan, editorial ili bold — bez gubitka teksta.
export function SitePreview(props: LayoutProps) {
  const layout = layoutOf(props.draft);

  if (layout === 'editorial') return <EditorialLayout {...props} />;
  if (layout === 'bold') return <BoldLayout {...props} />;
  return <ClassicLayout {...props} />;
}
