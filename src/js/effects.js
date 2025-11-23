import {
  createScope,
  createTimeline,
  onScroll,
  splitText,
  stagger,
  utils,
  waapi,
} from 'animejs';

const targetQueries = {
  headerTitle: '[data-anime-target="header-title"]',
  headerLine1Words: '[data-anime-target="header-line-1-word"]',
  headerLine2: '[data-anime-target="header-line-2"]',
  titleCaret: '[data-anime-target="title-caret"]',
  workItems: '[data-anime-target="work"]',
  projects: '[data-anime-target="project"]',
  homeProjects: '[data-anime-target="home-project"]',
  sectionTitles: '[data-anime-target="section-title"]',
};

createScope({
  mediaQueries: { reduceMotion: '(prefers-reduced-motion)' },
}).addOnce((self) => {
  const { reduceMotion } = self.matches;

  if (reduceMotion) return;

  const [body] = utils.$('body');
  const heroTimeline = createTimeline();
  const { chars: titleChars } = splitText(targetQueries.headerTitle, {
    chars: true,
    words: false,
  });

  const createCharsTl = () => {
    let charsTl = createTimeline();
    titleChars.forEach((char, i) => {
      charsTl = charsTl
        .sync(
          waapi.animate(char, {
            opacity: [0, 1],
            duration: 150,
          })
        )
        .sync(
          waapi.animate(targetQueries.titleCaret, {
            x: char.offsetWidth + char.offsetLeft + 5,
            y: char.offsetTop,
            duration: 125,
          }),
          '<<'
        );
    });

    return charsTl;
  };

  heroTimeline
    .sync(
      waapi.animate(targetQueries.headerLine1Words, {
        opacity: [0, 1],
        y: ['30%', 0],
        duration: 500,
        delay: stagger(500),
        ease: 'inOutSine',
      })
    )
    .sync(
      waapi.animate(targetQueries.titleCaret, {
        scaleY: [0, 1],
        opacity: [0.5, 1],
        duration: 400,
        ease: 'outExpo',
      })
    )
    .sync(createCharsTl())
    .label('title_completes')
    .call(() => {
      const caret = utils.$(targetQueries.titleCaret);
      utils.set(caret, {
        transformOrigin: `0px calc(${utils.get(caret, 'y')} + ${utils.get(
          caret,
          'height'
        )} / 2)`,
      });
      waapi.animate(targetQueries.titleCaret, {
        scaleY: [1, 0],
        duration: 400,
        ease: 'outExpo',
      });
    })
    .sync(
      waapi.animate(targetQueries.headerLine2, {
        opacity: [0, 1],
        y: ['30%', 0],
        duration: 500,
        ease: 'inOutSine',
      }),
      'title_completes-=500'
    );

  const subtitles = utils.$(targetQueries.sectionTitles);

  subtitles.forEach((target) => {
    waapi.animate(target, {
      opacity: [0, 1],
      y: ['30%', 0],
      duration: 500,
      delay: 200,
      ease: 'inOutSine',
      autoplay: attachScrollObserver(body),
    });
  });

  waapi.animate(targetQueries.workItems, {
    opacity: [0, 1],
    x: ['-20%', 0],
    duration: 1000,
    delay: stagger(100),
    ease: 'out(1.68)',
    autoplay: attachScrollObserver(body),
  });

  const featuredProj = utils.$(targetQueries.projects);

  const getFeatProjAnimeParams = (reversed) => ({
    opacity: [0, 1],
    x: reversed ? ['30%', 0] : ['-30%', 0],
    duration: 1000,
    ease: 'out(1.68)',
    autoplay: attachScrollObserver(body),
  });

  featuredProj.forEach((target, i) => {
    const isReversed = target.matches('.project--reverse');
    waapi.animate(target.children[0], getFeatProjAnimeParams(isReversed));
    waapi.animate(target.children[1], getFeatProjAnimeParams(!isReversed));
  });

  const homeProjects = utils.$(targetQueries.homeProjects);

  homeProjects.forEach((target) => {
    waapi.animate(target, {
      opacity: [0, 1],
      y: ['10%', 0],
      duration: 1000,
      ease: 'out(1.68)',
      autoplay: attachScrollObserver(body),
    });
  });
});

function attachScrollObserver(container) {
  return onScroll({
    container,
    // play only on enter forward
    sync: 'play complete complete complete',
    onEnterForward: (so) => {
      // disable if already in view
      if (so.isInView) so.revert();
    },
    onEnterBackward: (so) => {
      if (so.isInView) so.revert();
    },
  });
}
