import {
  animate,
  createScope,
  createTimeline,
  onScroll,
  splitText,
  stagger,
  utils,
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

const [body] = utils.$('body');
const heroTimeline = createTimeline();
const { chars: titleChars } = splitText(targetQueries.headerTitle, {
  chars: true,
  words: false,
});

createScope({
  mediaQueries: { reduceMotion: '(prefers-reduced-motion)' },
}).addOnce((self) => {
  const { reduceMotion } = self.matches;

  if (reduceMotion) return;

  heroTimeline
    .add(targetQueries.headerLine1Words, {
      opacity: [0, 1],
      y: ['30%', 0],
      duration: 500,
      delay: stagger(500),
      ease: 'inOutSine',
    })
    .add(targetQueries.titleCaret, {
      scaleY: [0, 1],
      opacity: [0.5, 1],
      duration: 500,
      easing: 'easeOutExpo',
    })
    .label('caret_ready')
    .add(
      titleChars,
      {
        opacity: [0, 1],
        duration: 800,
        delay: stagger(100),
      },
      'caret_ready'
    )
    .add(
      targetQueries.titleCaret,
      {
        x: titleChars.map((char, i) => {
          return {
            to: char.offsetWidth + char.offsetLeft + 5,
            delay: i === 0 ? 0 : 100,
          };
        }),
        y: titleChars.map((char, i) => ({
          to: char.offsetTop,
          delay: i === 0 ? 0 : 100,
        })),
        duration: 50,
      },
      '<<'
    )
    .label('title_completes')
    .add(targetQueries.titleCaret, {
      scaleY: [1, 0],
      duration: 500,
      easing: 'easeOutExpo',
      onBegin: () => {
        const caret = utils.$(targetQueries.titleCaret);
        utils.set(caret, {
          top: utils.get(caret, 'y'),
          left: utils.get(caret, 'x'),
          x: 0,
          y: 0,
        });
      },
    })
    .add(
      targetQueries.headerLine2,
      {
        opacity: [0, 1],
        y: ['30%', 0],
        duration: 500,
        ease: 'inOutSine',
      },
      'title_completes-=1000'
    )
    .init();

  const subtitles = utils.$(targetQueries.sectionTitles);

  subtitles.forEach((target) => {
    animate(target, {
      opacity: [0, 1],
      y: ['30%', 0],
      duration: 500,
      delay: 200,
      easing: 'inOutSine',
      autoplay: onScroll({
        container: body,
      }),
    });
  });

  animate(targetQueries.workItems, {
    opacity: [0, 1],
    x: ['-20%', 0],
    y: ['-50%', 0],
    duration: 1000,
    delay: stagger(100),
    ease: 'out(1.68)',
    autoplay: onScroll({
      container: body,
    }),
  });

  const featuredProjFirstHalf = utils.$(
    `${targetQueries.projects} > :first-child`
  );
  const featuredProjSecondHalf = utils.$(
    `${targetQueries.projects} > :last-child`
  );

  featuredProjFirstHalf.forEach((target, i) => {
    animate(target, {
      opacity: [0, 1],
      x: (target) => {
        return target.parentElement.matches('.project--reverse')
          ? ['30%', 0]
          : ['-30%', 0];
      },
      duration: 1000,
      ease: 'out(1.68)',
      autoplay: onScroll({
        container: body,
      }),
    });
    animate(featuredProjSecondHalf[i], {
      opacity: [0, 1],
      x: (target) => {
        return target.parentElement.matches('.project--reverse')
          ? ['-30%', 0]
          : ['30%', 0];
      },
      duration: 1000,
      ease: 'out(1.68)',
      autoplay: onScroll({
        container: body,
      }),
    });
  });

  const homeProjects = utils.$(targetQueries.homeProjects);

  homeProjects.forEach((target) => {
    animate(target, {
      opacity: [0, 1],
      y: ['10%', 0],
      duration: 1000,
      ease: 'out(1.68)',
      autoplay: onScroll({
        container: body,
      }),
    });
  });
});
