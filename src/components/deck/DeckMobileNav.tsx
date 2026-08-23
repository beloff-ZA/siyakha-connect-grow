import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Check, List } from "lucide-react";
import {
  TOUCH_TARGET_CLASS,
  navLabel,
  selectSection,
  truncateTitle,
  type DeckNavItem,
} from "@/lib/deckMobileNav";
import { cn } from "@/lib/utils";

/**
 * Compact sticky header + section selector for the client deck on small
 * screens. Desktop keeps its existing inline navigation: this component is
 * hidden from `lg` upwards by its own wrapper class.
 */
const DeckMobileNav: React.FC<{
  company: string;
  title: string | null | undefined;
  nav: readonly DeckNavItem[];
  active: string;
  onSelect: (id: string) => void;
}> = ({ company, title, nav, active, onSelect }) => {
  const [open, setOpen] = useState(false);

  const choose = (id: string) => {
    const next = selectSection(nav, id);
    setOpen(next.open);
    onSelect(next.active);
    const el = typeof document !== "undefined" ? document.getElementById(next.active) : null;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex w-full min-w-0 items-center gap-3 lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{company}</p>
        <p className="truncate text-sm font-semibold" title={title ?? undefined}>
          {truncateTitle(title)}
        </p>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            aria-label={`Sections — currently ${navLabel(nav, active)}`}
            className={cn(TOUCH_TARGET_CLASS, "shrink-0 gap-2 px-3")}
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.14em]">Sections</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="text-sm uppercase tracking-[0.16em]">Sections</SheetTitle>
          </SheetHeader>
          <p className="mt-1 text-xs text-muted-foreground">Currently viewing: {navLabel(nav, active)}</p>
          <nav aria-label="Deck sections" className="mt-4 grid gap-2 pb-4">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => choose(item.id)}
                aria-current={item.id === active ? "true" : undefined}
                className={cn(
                  TOUCH_TARGET_CLASS,
                  "flex w-full items-center justify-between border border-border px-4 py-3 text-left text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  item.id === active ? "bg-muted font-semibold" : "hover:bg-muted/60",
                )}
              >
                <span className="min-w-0 truncate">{item.label}</span>
                {item.id === active && <Check className="ml-3 h-4 w-4 shrink-0" strokeWidth={1.5} />}
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DeckMobileNav;
