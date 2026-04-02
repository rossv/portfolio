import { useEffect, useMemo, useRef, useState } from 'react';
import badgeSections from '../assets/badges/badge-sections.svg';
import badgeBubbles from '../assets/badges/badge-bubbles.svg';
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
import ThemeToggle from './ThemeToggle';
import projects from '../data/project.json';

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
    icon: badgeBubbles,
  },
  {
    id: 'bubble-collector-1000',
    name: 'Bubble Enthusiast',
    description: 'Collected 1,000 floating bubbles.',
    icon: badgeBubbles,
  },
  {
    id: 'bubble-collector-5000',
    name: 'Bubble Master',
    description: 'Collected 5,000 floating bubbles.',
    icon: badgeBubbles,
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
];

const SECTION_IDS = ['skills', 'timeline', 'leadership', 'achievements', 'projects', 'footer'];
const TOTAL_FOOTER_LINKS = 4;
const BUBBLE_THRESHOLDS = [100, 1000, 5000];
const TOTAL_PROJECT_CARDS = projects.length;
const TIME_BADGE_THRESHOLDS = [
  { id: 'one-minute-mark', ms: 1 * 60 * 1000 },
  { id: 'five-minute-mark', ms: 5 * 60 * 1000 },
  { id: 'quarter-hour', ms: 15 * 60 * 1000 },
  { id: 'hour-mark', ms: 60 * 60 * 1000 },
];
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
      footerClicks: Array.isArray(parsed.footerClicks) ? parsed.footerClicks : [],
      visitedSections: Array.isArray(parsed.visitedSections) ? parsed.visitedSections : [],
      timeSpentMs: Number.isFinite(parsed.timeSpentMs) ? parsed.timeSpentMs : 0,
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
  });
  const bubbleCountRef = useRef(0);
  const projectReadsRef = useRef(new Set());
  const projectTotalRef = useRef(0);
  const jobReadsRef = useRef(new Set());
  const jobTotalRef = useRef(0);
  const footerClicksRef = useRef(new Set());
  const visitedSectionsRef = useRef(new Set());
  const timeSpentMsRef = useRef(0);
  const buddaTimerRef = useRef(null);
  const isInHeadZoneRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const badgeScrollerRef = useRef(null);
  const badgeItemRefs = useRef(new Map());

  const checkScroll = () => {
    if (badgeScrollerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = badgeScrollerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };



  const centerBadgeInView = (badgeId, behavior = 'smooth') => {
    const scroller = badgeScrollerRef.current;
    const badgeElement = badgeItemRefs.current.get(badgeId);
    if (!scroller || !badgeElement) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const badgeRect = badgeElement.getBoundingClientRect();
    const safetyPadding = 24;

    const isFullyVisible =
      badgeRect.left >= scrollerRect.left + safetyPadding &&
      badgeRect.right <= scrollerRect.right - safetyPadding;

    if (isFullyVisible) return;

    const targetScrollLeft =
      badgeElement.offsetLeft - (scroller.clientWidth / 2) + (badgeElement.clientWidth / 2);

    scroller.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior,
    });
  };

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
    setProgressSnapshot({
      bubbleCount: stored.bubbleCount,
      projectReads: stored.projectReads.length,
      projectTotal: TOTAL_PROJECT_CARDS,
      jobReads: stored.jobReads.length,
      jobTotal: Number.isFinite(stored.jobTotal) ? stored.jobTotal : 0,
      footerClicks: stored.footerClicks.length,
      timeSpentMs: stored.timeSpentMs,
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

      if (currentY <= 24 || delta < -6) {
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

    const handleSpaceNerdToggle = (event) => {
      if (event.detail?.enabled) {
        unlockBadge('space-nerd');
      }
    };

    window.addEventListener('bubble-collect', handleBubbleCollect);
    window.addEventListener('project-open', handleProjectOpen);
    window.addEventListener('job-open', handleJobOpen);
    window.addEventListener('space-nerd-toggle', handleSpaceNerdToggle);

    return () => {
      window.removeEventListener('bubble-collect', handleBubbleCollect);
      window.removeEventListener('project-open', handleProjectOpen);
      window.removeEventListener('job-open', handleJobOpen);
      window.removeEventListener('space-nerd-toggle', handleSpaceNerdToggle);
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
        if (footerId) {
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
    setProgressSnapshot({ bubbleCount: 0, projectReads: 0, projectTotal: 0, jobReads: 0, jobTotal: 0, footerClicks: 0, timeSpentMs: 0 });
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
        <div className="flex items-center gap-2 overflow-x-hidden overflow-y-visible rounded-full border border-slate-200/90 bg-white/85 p-2 shadow-lg backdrop-blur dark:border-slate-700/90 dark:bg-slate-900/85">
          <button
            type="button"
            className="shrink-0 whitespace-nowrap rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
            onClick={() => setIsProgressOpen((prev) => !prev)}
          >
            Badges {unlockedBadges.length}/{BADGES.length}
          </button>

          <div className="relative min-w-0 flex-1 flex items-center">
            {canScrollLeft && unlockedBadges.length > 0 && (
              <button
                onClick={scrollLeftAmount}
                className="absolute left-0 z-10 flex h-full cursor-pointer items-center bg-gradient-to-r from-white via-white/80 to-transparent pr-4 pl-1 dark:from-slate-900 dark:via-slate-900/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Scroll left"
              >
                <svg className="h-4 w-4 animate-pulse text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div ref={badgeScrollerRef} onScroll={checkScroll} className="scrollbar-hide flex-1 overflow-x-auto">
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
                      className={`badge-chip shrink-0 ${isRecent ? 'badge-pop' : ''} ${isDismissed && !isActive ? 'badge-collapsed' : ''}`}
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
                            setSelectedBadge((prev) => (prev === badge.id ? null : badge.id));
                          }
                          centerBadgeInView(badge.id);
                        }
                      }}
                      aria-pressed={isActive}
                    >
                      <img src={badge.icon.src || badge.icon} alt={badge.name} className={isDismissed && !isActive ? "h-7 w-7" : "h-10 w-10"} />
                      {(!isDismissed || isActive) && (
                        <div className="text-left">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">{badge.name}</p>
                          <p className="max-w-[140px] text-[10px] text-slate-500 dark:text-slate-300">{badge.description}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {canScrollRight && unlockedBadges.length > 0 && (
              <button
                onClick={scrollRightAmount}
                className="absolute right-0 z-10 flex h-full cursor-pointer items-center bg-gradient-to-l from-white via-white/80 to-transparent pl-4 pr-1 dark:from-slate-900 dark:via-slate-900/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Scroll right"
              >
                <svg className="h-4 w-4 animate-pulse text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          <div className="shrink-0">
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
