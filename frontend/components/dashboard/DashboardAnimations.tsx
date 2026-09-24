"use client";

import { useEffect } from "react";
import gsap from "gsap";


export default function DashboardAnimations() {

  useEffect(() => {

    const context = gsap.context(() => {

      gsap.from(".dashboard-header", {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: "power3.out",
      });


      gsap.from(".stat-card", {
        opacity: 0,
        y: 25,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.2,
        ease: "power3.out",
      });


      gsap.from(".case-card", {
        opacity: 0,
        y: 25,
        duration: 0.6,
        stagger: 0.06,
        delay: 0.35,
        ease: "power3.out",
      });

    });


    return () => context.revert();

  }, []);


  return null;
}