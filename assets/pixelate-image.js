(function () {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const START_SIZE = 25; // resting block size, in px
  let uid = 0;

  /**
   * Builds an SVG pixelation filter (feFlood → feComposite/feTile → feComposite →
   * feMorphology) and returns the primitives we animate.
   * @param {string} id
   */
  function createFilter(id) {
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', '100%');
    filter.setAttribute('height', '100%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const flood = document.createElementNS(SVG_NS, 'feFlood');
    flood.setAttribute('flood-color', '#808080');
    flood.setAttribute('width', '1');
    flood.setAttribute('height', '1');
    flood.setAttribute('result', 'seed');

    const cell = document.createElementNS(SVG_NS, 'feComposite');
    cell.setAttribute('in', 'seed');

    const tile = document.createElementNS(SVG_NS, 'feTile');
    tile.setAttribute('result', 'tile');

    const composite = document.createElementNS(SVG_NS, 'feComposite');
    composite.setAttribute('in', 'SourceGraphic');
    composite.setAttribute('in2', 'tile');
    composite.setAttribute('operator', 'in');
    composite.setAttribute('result', 'samples');

    const morph = document.createElementNS(SVG_NS, 'feMorphology');
    morph.setAttribute('operator', 'dilate');
    morph.setAttribute('in', 'samples');

    filter.append(flood, cell, tile, composite, morph);
    return { filter, flood, cell, morph };
  }

  const images = document.querySelectorAll('img.pixelate-in');
  if (!images.length) return;

  // Without GSAP we can't animate the pixelation away, so leave the images crisp
  // rather than stuck pixelated.
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Single hidden host for all generated filters.
  const defs = document.createElementNS(SVG_NS, 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.setAttribute('aria-hidden', 'true');
  defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  document.body.appendChild(defs);

  images.forEach((img) => {
    const id = `pixelate-${uid++}`;
    const { filter, flood, cell, morph } = createFilter(id);
    defs.appendChild(filter);

    const state = { size: START_SIZE };

    const apply = () => {
      const s = Math.max(1, state.size);
      const half = Math.max(0, Math.floor(s / 2));
      flood.setAttribute('x', half);
      flood.setAttribute('y', half);
      cell.setAttribute('width', s);
      cell.setAttribute('height', s);
      morph.setAttribute('radius', Math.max(0, s / 2));
    };

    apply();
    img.style.filter = `url(#${id})`;

    gsap
      .timeline({
        scrollTrigger: { trigger: img, start: 'top 85%', once: true },
        onUpdate: apply,
        // Drop the filter once crisp — keeps it out of the paint path.
        onComplete: () => {
          img.style.filter = 'none';
          filter.remove();
        },
      })
      // Pixelate slightly more as it enters...
      .to(state, { size: START_SIZE * 1.6, duration: 0.3, ease: 'power1.in' })
      // ...then resolve into focus.
      .to(state, { size: 1, duration: 0.9, ease: 'power2.out' });
  });
})();
