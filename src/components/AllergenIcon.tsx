interface AllergenIconProps {
  allergenSlug: string;
  size?: number;
  className?: string;
}

const iconPaths: Record<string, { color: string; path: string }> = {
  gluten: {
    color: "var(--allergen-gluten)",
    path: "M12 2c-.5 0-1 .2-1.3.6L8 6l-1 6 2.5 2L12 22l2.5-8L17 12l-1-6-2.7-3.4C13 2.2 12.5 2 12 2zm0 3l2 3-1 5h-2l-1-5 2-3z",
  },
  crustaceans: {
    color: "var(--allergen-crustaceans)",
    path: "M12 4C9 4 7 6 7 8c0 1.5.8 2.8 2 3.5V14l-3 2v2h2l2-1.5V18h4v-1.5L16 18h2v-2l-3-2v-2.5c1.2-.7 2-2 2-3.5 0-2-2-4-5-4zm-2 3a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2zM5 9l-3 2v2l3-1V9zm14 0v3l3 1v-2l-3-2z",
  },
  eggs: {
    color: "var(--allergen-eggs)",
    path: "M12 3C9 3 6 7.5 6 12a6 6 0 1012 0c0-4.5-3-9-6-9zm0 12a3 3 0 110-6 3 3 0 010 6z",
  },
  fish: {
    color: "var(--allergen-fish)",
    path: "M12 6c-4 0-7.5 2.5-10 6 2.5 3.5 6 6 10 6s7.5-2.5 10-6c-2.5-3.5-6-6-10-6zm-1.5 3c2 0 3.5 1.5 3.5 3s-1.5 3-3.5 3-3.5-1.5-3.5-3 1.5-3 3.5-3zm0 1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z",
  },
  peanuts: {
    color: "var(--allergen-peanuts)",
    path: "M12 2C9.5 2 8 4 8 6.5S9 10 9 12s-1.5 4-1.5 4h9S15 14 15 12s1-3.5 1-5.5S14.5 2 12 2zm-1 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM9 17l-1 3c0 1 1 2 2 2h4c1 0 2-1 2-2l-1-3H9z",
  },
  soybeans: {
    color: "var(--allergen-soybeans)",
    path: "M15.5 4c-2.5 0-4.5 1.5-5 3.5C10 5.5 8 4 5.5 4 3 4 1 6.5 1 9.5c0 4 4 7 7 9.5l4-3 4 3c3-2.5 7-5.5 7-9.5C23 6.5 21 4 18.5 4c-1.2 0-2.2.4-3 1zm-3.5 6a2 2 0 110 4 2 2 0 010-4z",
  },
  milk: {
    color: "var(--allergen-milk)",
    path: "M8 2v2H6v4l2 2v10c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V10l2-2V4h-2V2H8zm1 5h6v1l-2 2v10h-2V10L9 8V7z",
  },
  "tree-nuts": {
    color: "var(--allergen-tree-nuts)",
    path: "M12 2L8 5v3c0 3 1.5 5.5 4 7 2.5-1.5 4-4 4-7V5l-4-3zm0 3c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zM9 16l-2 2v2c0 1 1 2 2 2h6c1 0 2-1 2-2v-2l-2-2H9z",
  },
  celery: {
    color: "var(--allergen-celery)",
    path: "M12 2c-1 0-2 .5-2 1.5V8l-2.5 5L10 22h4l2.5-9L14 8V3.5C14 2.5 13 2 12 2zM8 6L5 9v3l3 1V6zm8 0v7l3-1V9l-3-3z",
  },
  mustard: {
    color: "var(--allergen-mustard)",
    path: "M10 2v3H9v2l1 1v2H8l-2 4v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-6l-2-4h-2V8l1-1V5h-1V2h-4zm1 10h2v2l1 3h-4l1-3v-2z",
  },
  sesame: {
    color: "var(--allergen-sesame)",
    path: "M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm-2 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-2 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3z",
  },
  sulphites: {
    color: "var(--allergen-sulphites)",
    path: "M8 2l-1 8c0 2 1.5 3.5 3 4v6H8v2h8v-2h-2v-6c1.5-.5 3-2 3-4l-1-8H8zm1.5 2h5l.5 5c0 1-1 2-2 2h-2c-1 0-2-1-2-2l.5-5z",
  },
  lupin: {
    color: "var(--allergen-lupin)",
    path: "M12 2c-2 3-5 5-5 9 0 3 2 5 5 5s5-2 5-5c0-4-3-6-5-9zm0 6c1.1 0 2 1.3 2 3s-.9 3-2 3-2-1.3-2-3 .9-3 2-3zM10 17v3c0 1 1 2 2 2s2-1 2-2v-3h-4z",
  },
  molluscs: {
    color: "var(--allergen-molluscs)",
    path: "M12 3C7 3 3 7 3 12c0 3 1.5 5.5 4 7l1-2c-1.5-1-2.5-3-2.5-5C5.5 8.5 8.5 5.5 12 5.5S18.5 8.5 18.5 12c0 2-1 4-2.5 5l1 2c2.5-1.5 4-4 4-7 0-5-4-9-9-9zm0 5a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z",
  },
};

export function AllergenIcon({ allergenSlug, size = 24, className = "" }: AllergenIconProps) {
  const icon = iconPaths[allergenSlug];
  if (!icon) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={icon.color}
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d={icon.path} />
    </svg>
  );
}
