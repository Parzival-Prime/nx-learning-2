import SidebarWrapper from '@seller-ui/src/components/sidebar';

export default function _layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex bg-neutral-950 min-h-screen">
      <aside className="w-60 min-w-60 max-w-75 border-r border border-r-slate-800 text-white p-4">
        <div className="sticky top-0">
          <SidebarWrapper />
        </div>
      </aside>
      <main className="flex-1">
        <div className="overflow-auto">{children}</div>
      </main>
    </div>
  );
}
