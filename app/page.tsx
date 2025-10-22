"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger, Flip);

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const pulseTl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      paused: false,
    });

    pulseTl.to(svg, {
      scale: 1.2,
      duration: 1.5,
      ease: "power1.inOut",
      transformOrigin: "center center",
      onUpdate: () => {
        const s = gsap.getProperty(svg, "scale");
        svg.style.transform = `translate(-50%, -50%) scale(${s})`;
      },
    });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        gsap.to(svg, {
          opacity: 1 - self.progress,
          ease: "none",
          overwrite: "auto",
        });
      },
      onLeave: () => pulseTl.pause(),
      onEnterBack: () => pulseTl.resume(),
      onEnter: () => pulseTl.resume(),
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const p = section.querySelector("h3");

    gsap.set(p, {
      backgroundImage:
        "radial-gradient(circle at 50% 200vh, rgb(255, 210, 123) 0%, rgb(223, 58, 147) 15%, rgb(92, 22, 99) 30%, rgba(32, 31, 66, 0) 50%)",
      maskImage:
        "radial-gradient(at 50% 0vh, rgb(0,0,0) 120vh, rgba(0,0,0,0) 200vh)",
    });

    gsap.to(p, {
      backgroundImage:
        "radial-gradient(circle at 40% 0vh, rgb(255, 179, 135) 0%, rgb(252, 82, 67) 70%, rgb(157, 47, 106) 100%, rgba(32, 31, 66, 0) 150%)",
      maskImage:
        "radial-gradient(at 20% -120vh, rgb(0,0,0) 0vh, rgba(0,0,0,0) 50vh)",
      scrollTrigger: {
        trigger: p,
        start: "top bottom+=20%",
        end: "bottom top-=40%",
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    let pinnedMarqueeImgClone: HTMLImageElement | null = null;
    let isImgCloneActive = false;

    const createPinnedMarqueeImgClone = () => {
      if (isImgCloneActive) return;

      const originalMarqueeImg =
        document.querySelector<HTMLImageElement>(".pin img");
      if (!originalMarqueeImg) return;

      const rect = originalMarqueeImg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      pinnedMarqueeImgClone = originalMarqueeImg.cloneNode(
        true
      ) as HTMLImageElement;

      gsap.set(pinnedMarqueeImgClone, {
        position: "fixed",
        left: centerX - originalMarqueeImg.offsetWidth / 2 + "px",
        top: centerY - originalMarqueeImg.offsetHeight / 2 + "px",
        width: originalMarqueeImg.offsetWidth + "px",
        height: originalMarqueeImg.offsetHeight + "px",
        transform: "rotate(-5deg)",
        transformOrigin: "center center",
        pointerEvents: "none",
        willChange: "transform",
        zIndex: 100,
      });

      document.body.appendChild(pinnedMarqueeImgClone);
      gsap.set(originalMarqueeImg, { opacity: 0 });
      isImgCloneActive = true;
    };

    const removePinnedMarqueeImgClone = () => {
      if (!isImgCloneActive) return;
      if (pinnedMarqueeImgClone) {
        pinnedMarqueeImgClone.remove();
        pinnedMarqueeImgClone = null;
      }
      const originalMarqueeImg =
        document.querySelector<HTMLImageElement>(".pin img");
      if (!originalMarqueeImg) return;

      gsap.set(originalMarqueeImg, { opacity: 1 });
      isImgCloneActive = false;
    };

    ScrollTrigger.create({
      trigger: ".horizontal",
      start: "top top",
      end: () => `+=${window.innerHeight * 5}`,
      pin: true,
    });

    ScrollTrigger.create({
      trigger: ".marquee",
      start: "top top",
      onEnter: createPinnedMarqueeImgClone,
      onEnterBack: createPinnedMarqueeImgClone,
      onLeaveBack: removePinnedMarqueeImgClone,
    });

    let flipAnimation: gsap.core.Animation | null = null;

    ScrollTrigger.create({
      trigger: ".horizontal",
      start: "top 50%",
      end: () => `+=${window.innerHeight * 5.5}`,
      onEnter: () => {
        if (pinnedMarqueeImgClone && isImgCloneActive && !flipAnimation) {
          const state = Flip.getState(pinnedMarqueeImgClone);

          gsap.set(pinnedMarqueeImgClone, {
            position: "fixed",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100svh",
            transform: "rotate(0deg)",
            transformOrigin: "center center",
          });

          flipAnimation = Flip.from(state, {
            duration: 1,
            ease: "none",
            paused: true,
          });
        }
      },
      onLeaveBack: () => {
        if (flipAnimation) {
          flipAnimation.kill();
          flipAnimation = null;
        }
        gsap.set(".horizontal > div", {
          x: "0%",
        });
      },
    });

    ScrollTrigger.create({
      trigger: ".horizontal",
      start: "top 50%",
      end: () => `+=${window.innerHeight * 5.5}`,
      onUpdate: (self) => {
        const progress = self.progress;

        if (progress <= 0.2) {
          const scaleProgress = progress / 0.2;
          if (flipAnimation) {
            flipAnimation.progress(scaleProgress);
          }
        }

        if (progress > 0.2 && progress <= 0.95) {
          if (flipAnimation) {
            flipAnimation.progress(1);
          }

          const horizontalProgress = (progress - 0.2) / 0.75;

          const wrapperTranslateX = -66.67 * horizontalProgress;
          gsap.set(".horizontal > div", {
            x: `${wrapperTranslateX}%`,
          });

          const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
          const imageTranslateX = -slideMovement * 100;
          gsap.set(pinnedMarqueeImgClone, {
            x: `${imageTranslateX}%`,
          });
        } else if (progress > 0.95) {
          if (flipAnimation) {
            flipAnimation.progress(1);
          }
          gsap.set(pinnedMarqueeImgClone, {
            x: "-200%",
          });
          gsap.set(".horizontal > div", {
            x: "-66.67%",
          });
        }
      },
    });

    return () => ScrollTrigger.killAll();
  }, []);

  useEffect(() => {
    const backgroundEl = document.getElementById("background");
    if (!backgroundEl) return;

    const originalColors = [
      { r: 28, g: 24, b: 41, stop: 0 },
      { r: 27, g: 24, b: 40, stop: 8.61 },
      { r: 25, g: 23, b: 36, stop: 17.21 },
      { r: 22, g: 21, b: 32, stop: 25.82 },
      { r: 20, g: 18, b: 28, stop: 34.42 },
      { r: 18, g: 17, b: 24, stop: 43.03 },
      { r: 17, g: 17, b: 23, stop: 51.63 },
    ];

    const targetColors = [
      { r: 84, g: 91, b: 117, stop: 0 },
      { r: 81, g: 88, b: 114, stop: 8.61 },
      { r: 74, g: 82, b: 108, stop: 17.21 },
      { r: 66, g: 73, b: 100, stop: 25.82 },
      { r: 58, g: 65, b: 92, stop: 34.42 },
      { r: 52, g: 59, b: 86, stop: 43.03 },
      { r: 50, g: 57, b: 83, stop: 51.63 },
    ];

    const lerp = (a: number, b: number, t: number) =>
      Math.round(a + (b - a) * t);

    const createGradient = (t: number) => {
      const colorStops = originalColors
        .map((orig, i) => {
          const target = targetColors[i];
          const r = lerp(orig.r, target.r, t);
          const g = lerp(orig.g, target.g, t);
          const b = lerp(orig.b, target.b, t);
          return `rgb(${r}, ${g}, ${b}) ${orig.stop}%`;
        })
        .join(", ");

      return `linear-gradient(223.17deg, ${colorStops})`;
    };

    ScrollTrigger.create({
      trigger: ".horizontal",
      start: "top center",
      end: () => `+=${window.innerHeight * 5.5}`,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;

        const t = progress <= 0.5 ? progress * 2 : 2 - progress * 2;

        backgroundEl.style.backgroundImage = createGradient(t);
      },
    });
  }, []);

  useEffect(() => {
    const grids = document.querySelectorAll<HTMLElement>(
      ".md\\:columns-2 > div"
    );

    if (grids.length < 2) return;

    gsap.to(grids[0], {
      y: () => grids[0].offsetHeight * 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: grids[0],
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(grids[1], {
      y: () => grids[1].offsetHeight * 0.2,
      ease: "none",
      scrollTrigger: {
        trigger: grids[1],
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <main>
      <div
        id="background"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-svh bg-[linear-gradient(223.17deg,#1c1829,#1b1828_8.61%,#191724_17.21%,#161520_25.82%,#14131c_34.42%,#121218_43.03%,#111117_51.63%)]"
      ></div>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        fill="none"
        viewBox="0 0 24 24"
        style={{
          filter:
            "drop-shadow(0 0 calc(max(5vw,10vh)* .025) rgba(255,176,196,.5)) drop-shadow(0 0 calc(max(5vw,10vh) * .1) #000)",
          position: "fixed",
          left: "50%",
          bottom: "10%",
          transform: `translate(-50%, -50%)`,
        }}
      >
        <path
          stroke="#ffb0c4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v12m0 0-5-5m5 5 5-5"
        />
      </svg>
      <section
        ref={sectionRef}
        className="fragment relative w-screen h-screen mt-[50vh]"
      >
        <h3 className="absolute left-1/2 top-1/2 -translate-1/2 text-transparent bg-clip-text pointer-events-none main-text">
          Inicio de animación
        </h3>
      </section>
      <section className="relative w-full h-[50vh] mt-[50vh] marquee">
        <div className="absolute top-1/2 left-1/2 -translate-1/2 -rotate-5 w-[150%] h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full flex justify-between items-center gap-4 will-change-transform">
            <div className="flex-1 w-full aspect-5/3 pin">
              <img src="/main.webp" alt="" />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full h-svh horizontal text-white">
        <div className="w-[300%] h-svh flex will-change-transform">
          <div className="flex-1 h-full flex gap-8 p-8"></div>
          <div className="flex-1 h-full flex gap-8 p-8">
            <div className="flex justify-center items-start flex-3 flex-col">
              <q className="text-[#ffff7e]">Temazos de primera.</q>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard
                dummy text ever since the 1500s, when an unknown printer took a
                galley of type and scrambled it to make a type specimen book.
              </p>
            </div>
            <div className="flex justify-center items-center flex-2">
              <img src="/1.webp" alt="" />
            </div>
          </div>
          <div className="flex-1 h-full flex gap-8 p-8">
            <div className="flex justify-center items-start flex-3 flex-col">
              <q className="text-[#ffff7e]">Only Raw... Records</q>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard
                dummy text ever since the 1500s, when an unknown printer took a
                galley of type and scrambled it to make a type specimen book.
              </p>
            </div>
            <div className="flex justify-center items-center flex-2">
              <img src="/2.webp" alt="" />
            </div>
          </div>
        </div>
      </section>
      <section className="fragment relative text-white">
        <div
          className="grid grid-cols-12"
          style={{ gap: "calc(16px * 1.125)" }}
        >
          <q className="text-[#fff9cb] title col-start-2 col-span-8">
            Pase lo que pase, puedes contar conmigo.
          </q>
        </div>
        <div className="md:columns-2">
          <div
            className="grid md:grid-cols-6 gap-4"
            style={{ gap: "calc(16px * 1.125)" }}
          >
            <div className="col-start-2 col-span-4 vertical-space">
              <q className="text-[#ffb0c4]">Otro día en el paraíso, ¿eh?</q>
            </div>
            <div className="col-span-6">
              <img src="/back1.webp" alt="" />
            </div>
          </div>
          <div
            className="grid md:grid-cols-6 gap-4"
            style={{ gap: "calc(16px * 1.125)" }}
          >
            <div className="col-start-2 col-span-4 vertical-space">
              <p>
                Conocer a Lucia podría ser lo mejor o lo peor que le haya
                pasado. Jason tiene claro cómo le gustaría que acabara la
                historia, pero ahora mismo es difícil saberlo.
              </p>
            </div>

            <div className="col-span-6">
              <img src="/back2.webp" alt="" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
