import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type EventDrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const EventDrawerContext = createContext<EventDrawerContextValue | null>(null);

export function EventDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, openDrawer, closeDrawer, toggleDrawer }),
    [isOpen, openDrawer, closeDrawer, toggleDrawer],
  );

  return (
    <EventDrawerContext.Provider value={value}>
      {children}
    </EventDrawerContext.Provider>
  );
}

export function useEventDrawer(): EventDrawerContextValue {
  const ctx = useContext(EventDrawerContext);
  if (!ctx) {
    throw new Error("useEventDrawer must be used within EventDrawerProvider");
  }
  return ctx;
}

/** Safe for screens that may render outside the event shell. */
export function useOptionalEventDrawer(): EventDrawerContextValue | null {
  return useContext(EventDrawerContext);
}
