"use client";

import {motion} from "motion/react";
import {Modal, ModalBody, ModalTrigger} from "./ui/animated-modal";
import LoginPage from "@/components/login/Login";
import ThemeToggle from "@/components/ThemeToggle";
import BrutalButton from "@/components/BrutalButton";
import {useSyncExternalStore} from "react";
import {getThemeServerSnapshot, getThemeSnapshot, subscribeTheme} from "@/lib/theme";

type Props = {
  callbackUrl?: string;
  autoOpenAuth?: boolean;
};


export default function HeroSectionTwo({
                                         callbackUrl = "/dashboard",
                                         autoOpenAuth = false,
                                       }: Props) {
  return (
    <div className="h-screen relative p-10 overflow-hidden">
      <div className="hero-bg hero_two m-10"></div>
      <div className="relative z-10 mx-auto flex h-full w-full flex-col items-center">
        <Navbar/>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1.5,
          }}
          className="relative z-10 flex flex-wrap items-center justify-center gap-4"
        >
          <ThemeToggle/>
        </motion.div>
        <div className="absolute top-0 left-10 h-full w-2px bg-neutral-200/80 dark:bg-neutral-800/80 z-10">
          <div className="absolute top-0 h-full w-px bg-neutral-400/50  "/>
        </div>
        <div className="absolute top-0 right-10 h-full w-2px bg-neutral-200/80 dark:bg-neutral-800/80 z-10">
          <div className="absolute h-full w-px bg-neutral-400/50  "/>
        </div>
        <div className="absolute bottom-10 h-2px w-full bg-neutral-200/80 dark:bg-neutral-800/80 z-10">
          <div className="absolute mx-auto h-px w-full bg-neutral-400/50  "/>
        </div>
        <div className="absolute top-10 h-2px w-full bg-neutral-200/80 dark:bg-neutral-800/80 z-10">
          <div className="absolute mx-auto h-px w-full bg-neutral-400/50  "/>
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-16 md:py-20">
          <h1
            className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-slate-300">
            {"Suivez chaque tir, Analysez chaque progression."
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{opacity: 0, filter: "blur(4px)", y: 10}}
                  animate={{opacity: 1, filter: "blur(0px)", y: 0}}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="mr-2 inline-block"
                >
                  {word}
                </motion.span>
              ))}
          </h1>
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 0.8,
            }}
            className="relative z-10 mx-auto max-w-xl py-4 px-4 md:px-0 text-center text-lg font-semibold text-neutral-800 dark:text-neutral-400"
          >
            Une application conçue pour les clubs de Laser Run pour enregistrer les séances de tir et analyser les
            performances des athlètes.
          </motion.p>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 1,
            }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Modal defaultOpen={autoOpenAuth}>
              <ModalTrigger className="">
                <BrutalButton
                  label="Login"
                />
              </ModalTrigger>
              <ModalBody>
                <LoginPage callbackUrl={callbackUrl}/>
              </ModalBody>
            </Modal>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const Navbar = () => {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const logo = theme === "light" ? "/logo.png" : "/logo-dark.png";

  return (
    <nav
      className="flex w-full items-center justify-between px-4 py-4 dark:border-neutral-800 z-20">
      <div className="flex items-center gap-2">
        <div className="w-20">
          <img src={logo} alt="logo" className="w-full"/>
        </div>
        <h1 className="text-base font-bold md:text-2xl">Laser-stats</h1>
      </div>
    </nav>
  );
};
