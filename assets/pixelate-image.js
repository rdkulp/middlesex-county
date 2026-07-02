(function () {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const images = document.querySelectorAll('img.pixelate-in');
  if (!images.length) return;

  // Without GSAP we can't animate, so leave the images visible.
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  images.forEach((img) => {
    gsap.set(img, { opacity: 0 });
    gsap.to(img, {
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: img, start: 'top 85%', once: true },
    });
  });
})();
