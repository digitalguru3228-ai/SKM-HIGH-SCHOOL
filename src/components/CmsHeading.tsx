import React, { useEffect, useState } from 'react';
import { getSiteContent } from '../services/siteContent';

export const CmsHeading: React.FC<{ field: string; fallback: string; className?: string }> = ({ field, fallback, className }) => {
  const [title, setTitle] = useState(fallback);
  useEffect(() => { let active = true; getSiteContent('homepage').then(data => { if (active && data[field]) setTitle(data[field]); }).catch(() => {}); return () => { active = false; }; }, [field, fallback]);
  return <h2 className={className}>{title}</h2>;
};
