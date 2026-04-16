"use client";
import {cn} from "@/lib/utils";
import {AnimatePresence, motion} from "motion/react";
import React, {createContext, ReactNode, useContext, useEffect, useRef, useState,} from "react";
import {createPortal} from "react-dom";

interface ModalContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({
                                children,
                                defaultOpen = false,
                              }: {
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <ModalContext.Provider value={{open, setOpen}}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export function Modal({
                        children,
                        defaultOpen = false,
                      }: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return <ModalProvider defaultOpen={defaultOpen}>{children}</ModalProvider>;
}

export const ModalTrigger = ({
                               children,
                               className,
                             }: {
  children: ReactNode;
  className?: string;
}) => {
  const {setOpen} = useModal();

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-md text-black dark:text-white text-center relative overflow-hidden",
        className
      )}
      onClick={() => setOpen(true)}
    >
      {children}
    </div>
  );
};

export const ModalBody = ({
                            children,
                            className,
                          }: {
  children: ReactNode;
  className?: string;
}) => {
  const {open, setOpen} = useModal();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const modalRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(modalRef, () => setOpen(false));

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1, backdropFilter: "blur(10px)"}}
          exit={{opacity: 0, backdropFilter: "blur(0px)"}}
          className="fixed inset-0 z-[100] flex h-full w-full items-center justify-center [perspective:800px] [transform-style:preserve-3d]"
        >
          <Overlay/>

          <motion.div
            ref={modalRef}
            className={cn(
              "relative z-[101] flex min-h-[50%] max-h-[90%] flex-1 flex-col overflow-hidden border border-transparent bg-[var(--card)] md:max-w-[40%] md:rounded-2xl dark:border-neutral-800",
              className
            )}
            initial={{
              opacity: 0,
              scale: 0.5,
              rotateX: 40,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              rotateX: 10,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 15,
            }}
          >
            <CloseIcon/>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const ModalContent = ({
                               children,
                               className,
                             }: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-1 flex-col p-8 md:p-10", className)}>
      {children}
    </div>
  );
};

export const ModalFooter = ({
                              children,
                              className,
                            }: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex justify-end bg-gray-100 p-4 dark:bg-neutral-900",
        className
      )}
    >
      {children}
    </div>
  );
};

const Overlay = ({className}: { className?: string }) => {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1, backdropFilter: "blur(10px)"}}
      exit={{opacity: 0, backdropFilter: "blur(0px)"}}
      className={cn("fixed inset-0 z-50 h-full w-full bg-opacity-50", className)}
    />
  );
};

const CloseIcon = () => {
  const {setOpen} = useModal();

  return (
    <button
      onClick={() => setOpen(false)}
      className="group absolute top-4 right-4"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-black transition duration-200 group-hover:rotate-3 group-hover:scale-125 dark:text-white"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M18 6l-12 12"/>
        <path d="M6 6l12 12"/>
      </svg>
    </button>
  );
};

export const useOutsideClick = <T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;

      if (!ref.current || !target || ref.current.contains(target)) {
        return;
      }

      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
