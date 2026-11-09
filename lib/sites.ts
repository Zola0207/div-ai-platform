export type SiteRecord = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  template_id: string | null;
  category_id: string | null;
  draft: unknown;
  status: string;
  created_at: string;
  updated_at: string;
};
