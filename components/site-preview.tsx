'use client';

import BoldLayout from './layouts/bold';
import BookingLayout from './layouts/booking';
import ClassicLayout from './layouts/classic';
import EditorialLayout from './layouts/editorial';
import PortfolioLayout from './layouts/portfolio';
import PremiumLayout from './layouts/premium';
import UtilityLayout from './layouts/utility';
import { layoutOf, type LayoutProps } from './blocks/site-types';

export type { Availability, BlockId, Booking, BookingType, LayoutId, SiteDraft } from './blocks/site-types';
export { LAYOUTS, LAYOUT_IDS } from './blocks/site-types';

// Ulazna tačka za prikaz sajta. Dizajn se bira u nacrtu, tako da isti
// sadržaj može da izađe u bilo kom od dizajna — bez gubitka teksta.
export function SitePreview(props: LayoutProps) {
  const layout = layoutOf(props.draft);

  if (layout === 'editorial') return <EditorialLayout {...props} />;
  if (layout === 'bold') return <BoldLayout {...props} />;
  if (layout === 'premium') return <PremiumLayout {...props} />;
  if (layout === 'portfolio') return <PortfolioLayout {...props} />;
  if (layout === 'utility') return <UtilityLayout {...props} />;
  if (layout === 'booking') return <BookingLayout {...props} />;
  return <ClassicLayout {...props} />;
}
