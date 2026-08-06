import { useEffect, useMemo, useRef, useState } from 'react';
import badgeSections from '../assets/badges/badge-sections.svg';
import badgeBubbles100 from '../assets/badges/badge-bubbles-100.svg';
import badgeBubbles1000 from '../assets/badges/badge-bubbles-1000.svg';
import badgeBubbles5000 from '../assets/badges/badge-bubbles-5000.svg';
import badgeMagicLamp from '../assets/badges/badge-magic-lamp.svg';
import badgeProject1 from '../assets/badges/badge-project-1.svg';
import badgeProject10 from '../assets/badges/badge-project-10.svg';
import badgeProjectAll from '../assets/badges/badge-project-all.svg';
import badgeJournal from '../assets/badges/badge-journal.svg';
import badgeJourneyman from '../assets/badges/badge-journeyman.svg';
import badgeFooter from '../assets/badges/badge-footer.svg';
import badgeTime1 from '../assets/badges/badge-time-1.svg';
import badgeTime5 from '../assets/badges/badge-time-5.svg';
import badgeTime15 from '../assets/badges/badge-time-15.svg';
import badgeTime60 from '../assets/badges/badge-time-60.svg';
import badgeSpaceNerd from '../assets/badges/badge-space-nerd.svg';
import badgeCartographer from '../assets/badges/badge-cartographer.svg';
import badgePipeline from '../assets/badges/badge-pipeline.svg';
import badgeSteelCity from '../assets/badges/badge-steel-city.svg';
import badgeBridgeBuilder from '../assets/badges/badge-bridge-builder.svg';
import badgeModeCollector from '../assets/badges/badge-mode-collector.svg';
import badgeStargazer from '../assets/badges/badge-stargazer.svg';
import badgeToolsmith from '../assets/badges/badge-toolsmith.svg';
import badgeLightsOut from '../assets/badges/badge-lights-out.svg';
import ThemeToggle from './ThemeToggle';
import HomeButton from './HomeButton';
import rawProjects from '../data/project.json';
import { visibleProjects } from '../utils/visibleProjects';
import { MODES, MODE_EVENT, readMode } from '../utils/siteMode';
import { FOOTER_LINK_IDS } from '../constants/footerLinks';

const projects = visibleProjects(rawProjects);

const BADGE_STORAGE_KEY = 'badgeState:v2';

const BADGES = [
  {
    id: 'section-scout',
    name: 'Section Scout',
    description: 'Visited every main section.',
    icon: badgeSections,
  },
  {
    id: 'bubble-collector-100',
    name: 'Bubble Novice',
    description: 'Collected 100 floating bubbles.',
    icon: badgeBubbles100,
    iconAccent: 'bg-cyan-100 text-cyan-700 ring-cyan-300/70 dark:bg-cyan-500/20 dark:text-cyan-200 dark:ring-cyan-400/40',
  },
  {
    id: 'bubble-collector-1000',
    name: 'Bubble Enthusiast',
    description: 'Collected 1,000 floating bubbles.',
    icon: badgeBubbles1000,
    iconAccent: 'bg-violet-100 text-violet-700 ring-violet-300/70 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-400/40',
  },
  {
    id: 'bubble-collector-5000',
    name: 'Bubble Master',
    description: 'Collected 5,000 floating bubbles.',
    icon: badgeBubbles5000,
    iconAccent: 'bg-amber-100 text-amber-700 ring-amber-300/70 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/40',
  },
  {
    id: 'magic-lamp',
    name: 'Magic Lamp',
    description: "You're granted three wishes!",
    icon: badgeMagicLamp,
  },
  {
    id: 'project-first-steps',
    name: 'First Steps',
    description: 'Opened your first project card.',
    icon: badgeProject1,
  },
  {
    id: 'project-explorer',
    name: 'Project Explorer',
    description: 'Opened 10 project cards.',
    icon: badgeProject10,
  },
  {
    id: 'project-completionist',
    name: 'Project Completionist',
    description: 'Opened every project card.',
    icon: badgeProjectAll,
  },
  {
    id: 'journal-reader',
    name: 'Journal Reader',
    description: 'Opened a journal paper link.',
    icon: badgeJournal,
  },
  {
    id: 'journeyman',
    name: 'Journeyman',
    description: 'Opened every role in the professional journey.',
    icon: badgeJourneyman,
  },
  {
    id: 'footer-friend',
    name: 'Footer Friend',
    description: 'Clicked every footer link.',
    icon: badgeFooter,
  },
  {
    id: 'one-minute-mark',
    name: 'One Minute Mark',
    description: 'Spent one minute on the page.',
    icon: badgeTime1,
  },
  {
    id: 'five-minute-mark',
    name: 'Five Minute Mark',
    description: 'Spent five minutes on the page.',
    icon: badgeTime5,
  },
  {
    id: 'quarter-hour',
    name: 'Quarter Hour',
    description: 'Spent fifteen minutes on the page.',
    icon: badgeTime15,
  },
  {
    id: 'hour-mark',
    name: 'Hour Mark',
    description: 'Spent one hour on the page.',
    icon: badgeTime60,
  },
  {
    id: 'space-nerd',
    name: 'Space Nerd',
    description: 'Entered space nerd mode.',
    icon: badgeSpaceNerd,
  },
  {
    id: 'cartographer',
    name: 'Cartographer',
    description: 'Entered geospatial mode.',
    icon: badgeCartographer,
    iconAccent: 'bg-amber-100 text-amber-800 ring-amber-300/70 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/40',
  },
  {
    id: 'pipeline-operator',
    name: 'Pipeline Operator',
    description: 'Entered technologist mode.',
    icon: badgePipeline,
    iconAccent: 'bg-sky-100 text-sky-800 ring-sky-300/70 dark:bg-sky-500/20 dark:text-sky-200 dark:ring-sky-400/40',
  },
  {
    id: 'steel-city',
    name: 'Steel City',
    description: 'Entered Pittsburgh mode.',
    icon: badgeSteelCity,
    iconAccent: 'bg-amber-100 text-amber-800 ring-amber-300/70 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/40',
  },
  {
    id: 'mode-collector',
    name: 'Mode Collector',
    description: 'Tried all five backdrops.',
    icon: badgeModeCollector,
    iconAccent: 'bg-orange-100 text-orange-800 ring-orange-300/70 dark:bg-orange-500/20 dark:text-orange-200 dark:ring-orange-400/40',
  },
  {
    id: 'stargazer',
    name: 'Stargazer',
    description: 'Placed 25 stars in the night sky.',
    icon: badgeStargazer,
    iconAccent: 'bg-violet-100 text-violet-700 ring-violet-300/70 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-400/40',
  },
  {
    id: 'bridge-builder',
    name: 'Bridge Builder',
    description: 'Threw 10 spans across the rivers.',
    icon: badgeBridgeBuilder,
    iconAccent: 'bg-amber-100 text-amber-800 ring-amber-300/70 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/40',
  },
  {
    id: 'toolsmith',
    name: 'Toolsmith',
    description: 'Explored every toolkit group.',
    icon: badgeToolsmith,
    iconAccent: 'bg-indigo-100 text-indigo-700 ring-indigo-300/70 dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-indigo-400/40',
  },
  {
    id: 'lights-out',
    name: 'Lights Out',
    description: 'Flipped between light and dark.',
    icon: badgeLightsOut,
    iconAccent: 'bg-slate-200 text-slate-700 ring-slate-400/70 dark:bg-slate-500/20 dark:text-slate-100 dark:ring-slate-400/40',
  },
];

const SECTION_IDS = ['skills', 'timeline', 'leadership', 'achievements', 'projects', 'footer'];
// Derived, not hand-written: the footer had five links against a hard-coded
// total of four, so Footer Friend unlocked a link early.
const TOTAL_FOOTER_LINKS = FOOTER_LINK_IDS.length;
const BUBBLE_THRESHOLDS = [100, 1000, 5000];
const TOTAL_PROJECT_CARDS = projects.length;
const TIME_BADGE_THRESHOLDS = [
  { id: 'one-minute-mark', ms: 1 * 60 * 1000 },
  { id: 'five-minute-mark', ms: 5 * 60 * 1000 },
  { id: 'quarter-hour', ms: 15 * 60 * 1000 },
  { id: 'hour-mark', ms: 60 * 60 * 1000 },
];
// One badge per backdrop that is an easter egg to find. Water is the default,
// so arriving there earns nothing on its own — it only counts toward the set.
const MODE_BADGES = {
  geo: 'cartographer',
  tech: 'pipeline-operator',
  stars: 'space-nerd',
  pgh: 'steel-city',
};
const TOOLKIT_GROUPS = ['hh', 'gis', 'coding', 'eng'];
const STARS_TARGET = 25;
// Ten, against 25 for stars: a span is a far heavier mark than a star.
const SPANS_TARGET = 10;
const DOCK_AUTOHIDE_MS = 8000;

const parseStoredState = (rawValue) => {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    return {
      unlockedIds: Array.isArray(parsed.unlockedIds) ? parsed.unlockedIds : [],
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [],
      bubbleCount: Number.isFinite(parsed.bubbleCount) ? parsed.bubbleCount : 0,
      projectReads: Array.isArray(parsed.projectReads) ? parsed.projectReads : [],
      projectTotal: Number.isFinite(parsed.projectTotal) ? parsed.projectTotal : 0,
      jobReads: Array.isArray(parsed.jobReads) ? parsed.jobReads : [],
      jobTotal: Number.isFinite(parsed.jobTotal) ? parsed.jobTotal : 0,
      // Dropped links stay in a returning visitor's storage, so a stale id
      // would otherwise still count toward Footer Friend.
      footerClicks: (Array.isArray(parsed.footerClicks) ? parsed.footerClicks : [])
        .filter((id) => FOOTER_LINK_IDS.includes(id)),
      visitedSections: Array.isArray(parsed.visitedSections) ? parsed.visitedSections : [],
      timeSpentMs: Number.isFinite(parsed.timeSpentMs) ? parsed.timeSpentMs : 0,
      // Added after v2 shipped; absent for anyone with existing progress, so
      // these default rather than invalidating their unlocks.
      modesSeen: Array.isArray(parsed.modesSeen) ? parsed.modesSeen : [],
      toolkitGroups: Array.isArray(parsed.toolkitGroups) ? parsed.toolkitGroups : [],
      starsPlaced: Number.isFinite(parsed.starsPlaced) ? parsed.starsPlaced : 0,
      spansBuilt: Number.isFinite(parsed.spansBuilt) ? parsed.spansBuilt : 0,
    };
  } catch {
    return null;
  }
};

export default function BadgeCollection() {
  const [unlocked, setUnlocked] = useState(new Set());
  const [dismissed, setDismissed] = useState(new Set());
  const [recentlyUnlocked, setRecentlyUnlocked] = useState(new Set());
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [isDockInteracting, setIsDockInteracting] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [progressSnapshot, setProgressSnapshot] = useState({
    bubbleCount: 0,
    projectReads: 0,
    projectTotal: TOTAL_PROJECT_CARDS,
    jobReads: 0,
    jobTotal: 0,
    footerClicks: 0,
    timeSpentMs: 0,
    modesSeen: 0,
    toolkitGroups: 0,
    starsPlaced: 0,
    spansBuilt: 0,
  });
  const bubbleCountRef = useRef(0);
  const projectReadsRef = useRef(new Set());
  const projectTotalRef = useRef(0);
  const jobReadsRef = useRef(new Set());
  const jobTotalRef = useRef(0);
  const footerClicksRef = useRef(new Set());
  const visitedSectionsRef = useRef(new Set());
  const timeSpentMsRef = useRef(0);
  const modesSeenRef = useRef(new Set());
  const toolkitGroupsRef = useRef(new Set());
  const starsPlacedRef = useRef(0);
  const spansBuiltRef = useRef(0);
  const buddaTimerRef = useRef(null);
  const isInHeadZoneRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const badgeScrollerRef = useRef(null);
  const badgeItemRefs = useRef(new Map());
  const centeringFrameRef = useRef(null);

  const checkScroll = () => {
    if (badgeScrollerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = badgeScrollerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  // Fades the scroller's own badges out at whichever edge still has more to
  // scroll to, rather than painting an overlay rectangle over them.
  const scrollerMaskImage = canScrollLeft
    ? canScrollRight
      ? 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)'
      : 'linear-gradient(to right, transparent, black 24px)'
    : canScrollRight
      ? 'linear-gradient(to right, black calc(100% - 24px), transparent)'
      : undefined;



  const centerBadgeInView = (badgeId, behavior = 'smooth', force = false) => {
    const scroller = badgeScrollerRef.current;
    const badgeElement = badgeItemRefs.current.get(badgeId);
    if (!scroller || !badgeElement) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const badgeRect = badgeElement.getBoundingClientRect();
    const safetyPadding = 24;

    const isFullyVisible =
      badgeRect.left >= scrollerRect.left + safetyPadding &&
      badgeRect.right <= scrollerRect.right - safetyPadding;

    // A touch-opened badge should move to the centre even when its collapsed
    // bubble happened to be visible already. Forced calls use its current
    // rendered geometry while the chip transition runs.
    if (isFullyVisible && !force) return;

    const targetScrollLeft =
      badgeElement.offsetLeft - (scroller.clientWidth / 2) + (badgeElement.clientWidth / 2);

    scroller.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior,
    });
  };

  // Opening one chip while another closes changes both the new chip's width
  // and its offset for the full CSS transition. Follow the rendered geometry
  // until that transition finishes instead of predicting it from the initial
  // (possibly expanded) layout.
  const centerBadgeThroughTransition = (badgeId) => {
    if (centeringFrameRef.current) cancelAnimationFrame(centeringFrameRef.current);

    const startedAt = performance.now();
    const followBadge = (now) => {
      centerBadgeInView(badgeId, 'auto', true);
      if (now - startedAt < 450) {
        centeringFrameRef.current = requestAnimationFrame(followBadge);
      } else {
        centeringFrameRef.current = null;
      }
    };

    centeringFrameRef.current = requestAnimationFrame(followBadge);
  };

  useEffect(() => () => {
    if (centeringFrameRef.current) cancelAnimationFrame(centeringFrameRef.current);
  }, []);

  const unlockedIds = useMemo(() => new Set(unlocked), [unlocked]);

  const scrollLeftAmount = () => {
    if (badgeScrollerRef.current) {
      badgeScrollerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRightAmount = () => {
    if (badgeScrollerRef.current) {
      badgeScrollerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const scroller = badgeScrollerRef.current;
    if (!scroller) return;

    checkScroll();
    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(scroller);
    if (scroller.firstElementChild) {
      resizeObserver.observe(scroller.firstElementChild);
    }
    return () => resizeObserver.disconnect();
  }, [unlockedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');

    const updateInputMode = () => {
      setIsTouchMode(mediaQuery.matches);
      if (mediaQuery.matches) {
        setHoveredBadge(null);
      } else {
        setSelectedBadge(null);
      }
    };

    updateInputMode();
    mediaQuery.addEventListener('change', updateInputMode);

    return () => mediaQuery.removeEventListener('change', updateInputMode);
  }, []);

  useEffect(() => {
    const activeBadgeId = isTouchMode ? selectedBadge : hoveredBadge;
    if (!activeBadgeId) return;

    centerBadgeInView(activeBadgeId, isTouchMode ? 'smooth' : 'auto');
  }, [hoveredBadge, selectedBadge, isTouchMode]);

  const persistBadgeState = () => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
      BADGE_STORAGE_KEY,
      JSON.stringify({
        unlockedIds: Array.from(unlocked),
        dismissedIds: Array.from(dismissed),
        bubbleCount: bubbleCountRef.current,
        projectReads: Array.from(projectReadsRef.current),
        projectTotal: projectTotalRef.current,
        jobReads: Array.from(jobReadsRef.current),
        jobTotal: jobTotalRef.current,
        footerClicks: Array.from(footerClicksRef.current),
        visitedSections: Array.from(visitedSectionsRef.current),
        timeSpentMs: timeSpentMsRef.current,
        modesSeen: Array.from(modesSeenRef.current),
        toolkitGroups: Array.from(toolkitGroupsRef.current),
        starsPlaced: starsPlacedRef.current,
        spansBuilt: spansBuiltRef.current,
      })
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = parseStoredState(window.localStorage.getItem(BADGE_STORAGE_KEY));
    if (!stored) return;

    const unlockedFromStorage = new Set(stored.unlockedIds);
    const dismissedFromStorage = new Set(stored.dismissedIds);

    // If the page refreshes while a badge is still expanded, treat it as dismissed.
    // This prevents older badges from getting stuck open after reloads.
    unlockedFromStorage.forEach((id) => dismissedFromStorage.add(id));

    setUnlocked(unlockedFromStorage);
    setDismissed(dismissedFromStorage);
    bubbleCountRef.current = stored.bubbleCount;
    projectReadsRef.current = new Set(stored.projectReads);
    jobReadsRef.current = new Set(stored.jobReads);
    footerClicksRef.current = new Set(stored.footerClicks);
    visitedSectionsRef.current = new Set(stored.visitedSections);
    modesSeenRef.current = new Set(stored.modesSeen);
    toolkitGroupsRef.current = new Set(stored.toolkitGroups);
    starsPlacedRef.current = stored.starsPlaced;
    spansBuiltRef.current = stored.spansBuilt;
    setProgressSnapshot({
      bubbleCount: stored.bubbleCount,
      projectReads: stored.projectReads.length,
      projectTotal: TOTAL_PROJECT_CARDS,
      jobReads: stored.jobReads.length,
      jobTotal: Number.isFinite(stored.jobTotal) ? stored.jobTotal : 0,
      footerClicks: stored.footerClicks.length,
      timeSpentMs: stored.timeSpentMs,
      modesSeen: stored.modesSeen.length,
      toolkitGroups: stored.toolkitGroups.length,
      starsPlaced: stored.starsPlaced,
      spansBuilt: stored.spansBuilt,
    });
    projectTotalRef.current = TOTAL_PROJECT_CARDS;
    jobTotalRef.current = Number.isFinite(stored.jobTotal) ? stored.jobTotal : 0;
    timeSpentMsRef.current = stored.timeSpentMs;
  }, []);

  useEffect(() => {
    persistBadgeState();
  }, [unlocked, dismissed]);

  const dismissBadge = (id) => {
    setDismissed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const unlockBadge = (id) => {
    // Check if already unlocked to prevent re-triggering animation
    if (unlocked.has(id)) return;

    setUnlocked((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setRecentlyUnlocked((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setIsDockVisible(true);

    window.setTimeout(() => {
      setRecentlyUnlocked((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
      // Auto-dismiss after animation completes
      dismissBadge(id);
      setHoveredBadge((prev) => (prev === id ? null : prev));
    }, 5000);
  };

  useEffect(() => {
    if (recentlyUnlocked.size === 0) return;

    const latestBadgeId = Array.from(recentlyUnlocked).at(-1);
    if (!latestBadgeId) return;

    const scroller = badgeScrollerRef.current;
    const badgeElement = badgeItemRefs.current.get(latestBadgeId);
    if (!scroller || !badgeElement) return;

    badgeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [recentlyUnlocked]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;

      if (delta < -6) {
        setIsDockVisible(true);
      } else if (delta > 10) {
        setIsDockVisible(false);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isDockVisible) return undefined;
    if (isProgressOpen || isDockInteracting || recentlyUnlocked.size > 0) return undefined;

    const timer = window.setTimeout(() => {
      setIsDockVisible(false);
    }, DOCK_AUTOHIDE_MS);

    return () => window.clearTimeout(timer);
  }, [isDockVisible, isProgressOpen, isDockInteracting, recentlyUnlocked]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleBubbleCollect = (event) => {
      const totalCount = event.detail?.count;
      const increment = event.detail?.increment;

      if (Number.isFinite(increment) && increment > 0) {
        bubbleCountRef.current += increment;
      } else if (Number.isFinite(totalCount)) {
        bubbleCountRef.current = Math.max(bubbleCountRef.current, totalCount);
      }

      setProgressSnapshot((prev) => ({ ...prev, bubbleCount: bubbleCountRef.current }));
      persistBadgeState();
      if (bubbleCountRef.current >= 100) {
        unlockBadge('bubble-collector-100');
      }
      if (bubbleCountRef.current >= 1000) {
        unlockBadge('bubble-collector-1000');
      }
      if (bubbleCountRef.current >= 5000) {
        unlockBadge('bubble-collector-5000');
      }
    };

    const handleProjectOpen = (event) => {
      const id = event.detail?.id;
      if (!id) return;
      projectReadsRef.current.add(id);
      projectTotalRef.current = TOTAL_PROJECT_CARDS;
      setProgressSnapshot((prev) => ({
        ...prev,
        projectReads: projectReadsRef.current.size,
        projectTotal: TOTAL_PROJECT_CARDS,
      }));
      persistBadgeState();
      if (projectReadsRef.current.size >= 1) {
        unlockBadge('project-first-steps');
      }
      if (projectReadsRef.current.size >= 10) {
        unlockBadge('project-explorer');
      }
      if (projectReadsRef.current.size >= TOTAL_PROJECT_CARDS) {
        unlockBadge('project-completionist');
      }
    };

    const handleJobOpen = (event) => {
      const id = event.detail?.id;
      const total = event.detail?.total;
      if (!id) return;
      jobReadsRef.current.add(id);
      if (typeof total === 'number') {
        jobTotalRef.current = Math.max(jobTotalRef.current, total);
      }
      setProgressSnapshot((prev) => ({
        ...prev,
        jobReads: jobReadsRef.current.size,
        jobTotal: Math.max(jobTotalRef.current, prev.jobTotal),
      }));
      persistBadgeState();
      if (typeof total === 'number' && jobReadsRef.current.size >= total) {
        unlockBadge('journeyman');
      }
    };

    // Each backdrop that has to be discovered carries its own badge, and
    // seeing all four earns the set. This listens to the mode event rather
    // than the legacy space-nerd one so every backdrop is covered by the
    // same path — siteMode still fires both.
    const recordMode = (mode) => {
      if (!MODES.includes(mode)) return;
      const badgeId = MODE_BADGES[mode];
      if (badgeId) unlockBadge(badgeId);
      if (modesSeenRef.current.has(mode)) return;
      modesSeenRef.current.add(mode);
      setProgressSnapshot((prev) => ({ ...prev, modesSeen: modesSeenRef.current.size }));
      persistBadgeState();
      if (modesSeenRef.current.size >= MODES.length) {
        unlockBadge('mode-collector');
      }
    };

    const handleModeChange = (event) => recordMode(event.detail?.mode);

    const handleToolkitGroup = (event) => {
      const group = event.detail?.group;
      if (!TOOLKIT_GROUPS.includes(group) || toolkitGroupsRef.current.has(group)) return;
      toolkitGroupsRef.current.add(group);
      setProgressSnapshot((prev) => ({ ...prev, toolkitGroups: toolkitGroupsRef.current.size }));
      persistBadgeState();
      if (toolkitGroupsRef.current.size >= TOOLKIT_GROUPS.length) {
        unlockBadge('toolsmith');
      }
    };

    const handleStarPlace = () => {
      starsPlacedRef.current += 1;
      setProgressSnapshot((prev) => ({ ...prev, starsPlaced: starsPlacedRef.current }));
      persistBadgeState();
      if (starsPlacedRef.current >= STARS_TARGET) {
        unlockBadge('stargazer');
      }
    };

    // Counted here rather than read from the event, so the tally survives a
    // reload the way the star count does — the scene's own span list does not.
    const handleSpanPlace = () => {
      spansBuiltRef.current += 1;
      setProgressSnapshot((prev) => ({ ...prev, spansBuilt: spansBuiltRef.current }));
      persistBadgeState();
      if (spansBuiltRef.current >= SPANS_TARGET) {
        unlockBadge('bridge-builder');
      }
    };

    const handleThemeToggle = () => unlockBadge('lights-out');

    // A mode restored from storage fires no event, so seed from what's stored.
    recordMode(readMode());

    window.addEventListener('bubble-collect', handleBubbleCollect);
    window.addEventListener('project-open', handleProjectOpen);
    window.addEventListener('job-open', handleJobOpen);
    window.addEventListener(MODE_EVENT, handleModeChange);
    window.addEventListener('toolkit-group', handleToolkitGroup);
    window.addEventListener('star-place', handleStarPlace);
    window.addEventListener('span-place', handleSpanPlace);
    window.addEventListener('theme-toggle', handleThemeToggle);

    return () => {
      window.removeEventListener('bubble-collect', handleBubbleCollect);
      window.removeEventListener('project-open', handleProjectOpen);
      window.removeEventListener('job-open', handleJobOpen);
      window.removeEventListener(MODE_EVENT, handleModeChange);
      window.removeEventListener('toolkit-group', handleToolkitGroup);
      window.removeEventListener('star-place', handleStarPlace);
      window.removeEventListener('span-place', handleSpanPlace);
      window.removeEventListener('theme-toggle', handleThemeToggle);
    };
  }, [unlockedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            visitedSectionsRef.current.add(entry.target.id);
            persistBadgeState();
            if (visitedSectionsRef.current.size >= SECTION_IDS.length) {
              unlockBadge('section-scout');
            }
          }
        });
      },
      // Keep threshold low enough that very tall sections can still be marked visited.
      // A high ratio can be impossible to reach on short viewports.
      { threshold: 0.15 }
    );

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [unlockedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let lastTick = Date.now();

    const tick = () => {
      const now = Date.now();
      if (!document.hidden) {
        timeSpentMsRef.current += now - lastTick;
        setProgressSnapshot((prev) => ({ ...prev, timeSpentMs: timeSpentMsRef.current }));
        TIME_BADGE_THRESHOLDS.forEach(({ id, ms }) => {
          if (timeSpentMsRef.current >= ms) {
            unlockBadge(id);
          }
        });
        persistBadgeState();
      }
      lastTick = now;
    };

    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [unlockedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Throttle helper to limit how often the handler runs
    let lastCall = 0;
    const throttleMs = 50;

    const handlePointerMove = (event) => {
      const now = Date.now();
      if (now - lastCall < throttleMs) return;
      lastCall = now;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const portrait = target.closest('[data-badge-target="portrait"]');

      if (portrait) {
        const rect = portrait.getBoundingClientRect();
        // Head zone: Top 45% of the image
        const headZone = rect.top + rect.height * 0.45;
        const inHeadZone = event.clientY <= headZone &&
          event.clientX >= rect.left &&
          event.clientX <= rect.right;

        if (inHeadZone) {
          if (!isInHeadZoneRef.current) {
            isInHeadZoneRef.current = true;
            // Start timer
            if (!buddaTimerRef.current) {
              buddaTimerRef.current = window.setTimeout(() => {
                unlockBadge('magic-lamp');
                buddaTimerRef.current = null;
              }, 10000); // 10 seconds
            }
          }
        } else {
          if (isInHeadZoneRef.current) {
            isInHeadZoneRef.current = false;
            if (buddaTimerRef.current) {
              window.clearTimeout(buddaTimerRef.current);
              buddaTimerRef.current = null;
            }
          }
        }
      } else {
        // Left the element entirely
        if (isInHeadZoneRef.current) {
          isInHeadZoneRef.current = false;
          if (buddaTimerRef.current) {
            window.clearTimeout(buddaTimerRef.current);
            buddaTimerRef.current = null;
          }
        }
      }
    };

    document.addEventListener('pointermove', handlePointerMove);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      if (buddaTimerRef.current) {
        window.clearTimeout(buddaTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleClick = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const actionEl = target.closest('[data-badge-action]');
      if (!actionEl) return;

      const action = actionEl.getAttribute('data-badge-action');
      if (action === 'journal-link') {
        unlockBadge('journal-reader');
      }
      if (action === 'footer-link') {
        const footerId = actionEl.getAttribute('data-footer-id');
        if (FOOTER_LINK_IDS.includes(footerId)) {
          footerClicksRef.current.add(footerId);
          setProgressSnapshot((prev) => ({ ...prev, footerClicks: footerClicksRef.current.size }));
          persistBadgeState();
        }
        if (footerClicksRef.current.size >= TOTAL_FOOTER_LINKS) {
          unlockBadge('footer-friend');
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [unlockedIds]);

  const unlockedBadges = BADGES.filter((badge) => unlockedIds.has(badge.id));
  const nextBubbleTier = BUBBLE_THRESHOLDS.find((threshold) => progressSnapshot.bubbleCount < threshold);

  const resetProgress = () => {
    setUnlocked(new Set());
    setDismissed(new Set());
    setRecentlyUnlocked(new Set());
    setHoveredBadge(null);
    setSelectedBadge(null);
    bubbleCountRef.current = 0;
    projectReadsRef.current = new Set();
    projectTotalRef.current = 0;
    jobReadsRef.current = new Set();
    jobTotalRef.current = 0;
    footerClicksRef.current = new Set();
    visitedSectionsRef.current = new Set();
    timeSpentMsRef.current = 0;
    modesSeenRef.current = new Set();
    toolkitGroupsRef.current = new Set();
    starsPlacedRef.current = 0;
    spansBuiltRef.current = 0;
    setProgressSnapshot({ bubbleCount: 0, projectReads: 0, projectTotal: 0, jobReads: 0, jobTotal: 0, footerClicks: 0, timeSpentMs: 0, modesSeen: 0, toolkitGroups: 0, starsPlaced: 0, spansBuilt: 0 });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(BADGE_STORAGE_KEY);
      window.localStorage.removeItem('bubbleCollectCount');
    }
  };

  return (
    <div
      className={`fixed inset-x-0 z-50 px-3 transition-transform duration-300 ease-out md:px-4 ${isDockVisible ? 'translate-y-0' : '-translate-y-[140%]'}`}
      style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
      onMouseEnter={() => setIsDockInteracting(true)}
      onMouseLeave={() => setIsDockInteracting(false)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        {/* One row at every width, so the pill stays a shallow stadium its
            children nest inside. The mobile stack this replaced put the radius
            at ~61px and left the middle grid cell of its top row empty — 89px
            of dead space that no padding could justify. Mobile only gets wider
            px, because 8px reads tighter against 382px than against 1280px. */}
        <div className="flex items-center gap-2 overflow-x-hidden overflow-y-visible rounded-full border border-slate-200/90 bg-white/85 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-700/90 dark:bg-slate-900/85 md:p-2">
          {/* Matches HomeButton/ThemeToggle's box math rather than setting a
              flat h-11: they are py-1.5 around a 30px core (an 18px icon in a
              p-1.5 ring), so the same padding and a 30px line box here keeps
              the three pills equal at any devicePixelRatio — a fixed height
              drifts from them once a 1px border renders as 1.33px.

              Mobile shows the bare count. Spelling out "Badges 11/22" cost
              115px of a 347px bar, and the strip beside it needs every pixel;
              the total still reads in full in the panel this opens. */}
          <button
            type="button"
            className="shrink-0 whitespace-nowrap rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-semibold leading-[30px] text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
            aria-label={`Badges ${unlockedBadges.length} of ${BADGES.length}. Show progress.`}
            onClick={() => setIsProgressOpen((prev) => !prev)}
          >
            <span className="md:hidden">{unlockedBadges.length}</span>
            <span className="hidden md:inline">Badges {unlockedBadges.length}/{BADGES.length}</span>
          </button>

          <div className="relative flex min-w-0 flex-1 items-center">
            {/* Fading the scroller's own content (via mask) rather than painting a
                translucent overlay on top of it avoids double-compounding opacity
                against the pill's already-translucent backdrop-blur background,
                which is what produced the hard-edged rectangle this replaces. */}
            <div
              ref={badgeScrollerRef}
              onScroll={checkScroll}
              className="scrollbar-hide -my-1 flex-1 overflow-x-auto py-1"
              style={{
                maskImage: scrollerMaskImage,
                WebkitMaskImage: scrollerMaskImage,
              }}
            >
              <div className="flex w-max min-w-full items-center gap-2 px-1">
                {unlockedBadges.length === 0 && (
                  <p className="truncate px-2 text-xs text-slate-500 dark:text-slate-400">
                    Unlock badges by exploring the site.
                  </p>
                )}
                {unlockedBadges.map((badge) => {
                  const isDismissed = dismissed.has(badge.id);
                  const isRecent = recentlyUnlocked.has(badge.id);
                  const isActive = (isTouchMode ? selectedBadge : hoveredBadge) === badge.id;
                  const isOpen = !isDismissed || isActive;

                  return (
                    <button
                      key={badge.id}
                      type="button"
                      ref={(element) => {
                        if (element) {
                          badgeItemRefs.current.set(badge.id, element);
                        } else {
                          badgeItemRefs.current.delete(badge.id);
                        }
                      }}
                      className={`badge-chip shrink-0 ${isRecent ? 'badge-pop' : ''} ${isOpen ? 'is-open' : 'badge-collapsed'}`}
                      onMouseEnter={() => {
                        if (!isDismissed || isTouchMode) return;
                        setHoveredBadge(badge.id);
                      }}
                      onMouseLeave={() => {
                        if (isTouchMode) return;
                        setHoveredBadge(null);
                      }}
                      onClick={() => {
                        if (isDismissed) {
                          if (isTouchMode) {
                            const isOpening = selectedBadge !== badge.id;
                            setSelectedBadge(isOpening ? badge.id : null);
                            if (isOpening) {
                              centerBadgeThroughTransition(badge.id);
                            }
                          } else {
                            centerBadgeInView(badge.id);
                          }
                        }
                      }}
                      aria-pressed={isActive}
                    >
                      <div
                        className={`shrink-0 rounded-full ring-1 p-1 ${badge.iconAccent || 'bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-300/70 dark:bg-fuchsia-500/20 dark:text-fuchsia-200 dark:ring-fuchsia-400/40'}`}
                      >
                        {/* Sized up from h-10/h-7: each icon's viewBox now
                            reserves room for its drop shadow, so the badge
                            fills 77% of the box rather than 94%. These keep
                            the drawn badge the size it was before. */}
                        <img
                          src={badge.icon.src || badge.icon}
                          alt={badge.name}
                          className={`badge-chip__icon ${isOpen ? 'h-12 w-12' : 'h-8 w-8'}`}
                        />
                      </div>
                      {/* Always mounted, and clipped by the wrapper when
                          collapsed, so the chip's width has something to ease
                          against. The inner width is fixed to the wrapper's
                          open max-width so the text does not reflow mid-reveal. */}
                      <div className="badge-chip__label">
                        <div className="w-[9.5rem]">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">{badge.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-300">{badge.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Small round chips (matching the Badges/Home/Theme buttons) instead
                of full-height overlays, so the affordance reads as part of the
                pill's own button language rather than a separate painted layer. */}
            {canScrollLeft && unlockedBadges.length > 0 && (
              <button
                onClick={scrollLeftAmount}
                className="absolute left-0.5 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-indigo-600 dark:border-slate-700/90 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:text-indigo-400"
                aria-label="Scroll left"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {canScrollRight && unlockedBadges.length > 0 && (
              <button
                onClick={scrollRightAmount}
                className="absolute right-0.5 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-indigo-600 dark:border-slate-700/90 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:text-indigo-400"
                aria-label="Scroll right"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <HomeButton />
            <ThemeToggle />
          </div>
        </div>

        {isProgressOpen && (
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <p className="font-semibold text-slate-900 dark:text-slate-50">Progress</p>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Unlocked: {unlockedBadges.length}/{BADGES.length}</p>
            <p className="text-slate-600 dark:text-slate-300">Project cards opened: {progressSnapshot.projectReads}/{Math.max(progressSnapshot.projectTotal, progressSnapshot.projectReads)}</p>
            <p className="text-slate-600 dark:text-slate-300">Roles opened: {progressSnapshot.jobReads}/{Math.max(progressSnapshot.jobTotal, progressSnapshot.jobReads)}</p>
            <p className="text-slate-600 dark:text-slate-300">Footer links clicked: {progressSnapshot.footerClicks}/{TOTAL_FOOTER_LINKS}</p>
            <p className="text-slate-600 dark:text-slate-300">Backdrops tried: {progressSnapshot.modesSeen}/{MODES.length}</p>
            <p className="text-slate-600 dark:text-slate-300">Toolkit groups explored: {progressSnapshot.toolkitGroups}/{TOOLKIT_GROUPS.length}</p>
            <p className="text-slate-600 dark:text-slate-300">Stars placed: {Math.min(progressSnapshot.starsPlaced, STARS_TARGET)}/{STARS_TARGET}</p>
            <p className="text-slate-600 dark:text-slate-300">Spans thrown: {Math.min(progressSnapshot.spansBuilt, SPANS_TARGET)}/{SPANS_TARGET}</p>
            <p className="text-slate-600 dark:text-slate-300">Time on page: {Math.floor(progressSnapshot.timeSpentMs / 60000)}m {Math.floor((progressSnapshot.timeSpentMs % 60000) / 1000)}s</p>
            {nextBubbleTier ? (
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Next bubble badge in {nextBubbleTier - progressSnapshot.bubbleCount} bubbles ({progressSnapshot.bubbleCount}/{nextBubbleTier}).
              </p>
            ) : (
              <p className="mt-1 text-slate-600 dark:text-slate-300">Bubble track complete ({progressSnapshot.bubbleCount} collected).</p>
            )}
            <button
              type="button"
              onClick={resetProgress}
              className="mt-3 rounded-md border border-rose-200 px-2 py-1 font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              Reset progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
