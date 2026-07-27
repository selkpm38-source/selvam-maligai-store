export default function CategoryChips({ categories }) {
  return (
    <nav aria-label="Product categories" className="px-3 xs:px-4 md:px-6 py-3 md:py-4 -mt-6 relative z-10">
      <div className="flex gap-2 xs:gap-3 overflow-x-auto scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            className="shrink-0 flex items-center gap-1 xs:gap-2 rounded-full bg-white dark:bg-leaf-600/30 border border-leaf-100 dark:border-leaf-400/20 shadow-card px-3 xs:px-4 py-1.5 md:py-2 text-xs xs:text-sm font-medium hover:border-leaf-400 transition-colors"
          >
            <span className="text-base xs:text-lg" aria-hidden="true">{c.icon}</span>
            <span className="hidden xs:inline">{c.name}</span>
            <span className="inline xs:hidden truncate max-w-[60px]">{c.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
