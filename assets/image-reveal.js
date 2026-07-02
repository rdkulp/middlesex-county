(function () {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const mainContent = document.getElementById('MainContent');
  if (!mainContent) return;

  const revealed = new WeakSet();

  // The first section usually holds the page's hero/LCP image, so it's left alone.
  function getFirstSection() {
    return mainContent.firstElementChild;
  }

  function collectEligibleImages(root) {
    const firstSection = getFirstSection();
    const images = root instanceof HTMLImageElement ? [root] : [...root.querySelectorAll('img')];

    return images.filter((img) => {
      if (revealed.has(img)) return false;
      if (!mainContent.contains(img)) return false;
      if (firstSection && firstSection.contains(img)) return false;
      return true;
    });
  }

  function revealImages(images) {
    if (!images.length) return;

    for (const img of images) revealed.add(img);

    gsap.set(images, { opacity: 0, y: 32 });

    ScrollTrigger.batch(images, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.08,
          overwrite: true,
        }),
    });
  }

  revealImages(collectEligibleImages(mainContent));

  // Catches images added later, e.g. infinite-scroll collection grids or section re-renders.
  const observer = new MutationObserver((mutations) => {
    const newImages = [];

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        newImages.push(...collectEligibleImages(node));
      }
    }

    revealImages(newImages);
  });

  observer.observe(mainContent, { childList: true, subtree: true });
})();
