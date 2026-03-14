"use client";

import {motion} from "motion/react";
import Link from "next/link";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalTrigger} from "./ui/animated-modal";
import LoginPage from "@/app/login/page";

export default function HeroSectionOne() {
  return (
    <div className="h-screen relative p-10 overflow-hidden">
      <div className="hero-bg m-10"></div>
      <div className=" mx-auto flex w-full h-full flex-col items-center md:justify-between">
        <Navbar/>
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
        <div className="flex flex-col justify-between md:justify-baseline py-10 md:py-20 h-full md:h-fit">
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
            Une application conçue pour les clubs de Laser Run pour enregistrer les séances de tir et analyser les performances des athlètes.
          </motion.p>
        </div>
      </div>
    </div>
  );
}

const Navbar = () => {
  return (
    <nav
      className="flex w-full items-center justify-between px-4 py-4 dark:border-neutral-800 z-20">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500"/>
        <h1 className="text-base font-bold md:text-2xl">Laser-stats</h1>
      </div>
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
          <Modal>
            <ModalTrigger className="">
              <button className="px-8 py-0.5  border-2 border-black dark:border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)] ">
                Login
              </button>
            </ModalTrigger>
            <ModalBody>
              <LoginPage/>
            </ModalBody>
          </Modal>
      </motion.div>
    </nav>
  );
};
