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

const BADGE_STORAGE_KEY = 'badgeState:v1';

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

const SECTION_IDS = ['skills', 'timeline', 'achievements', 'projects', 'footer'];
const TOTAL_FOOTER_LINKS = 4;
const BUBBLE_THRESHOLDS = [100, 1000, 5000];

const parseStoredState = (rawValue) => {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    return {
      unlockedIds: Array.isArray(parsed.unlockedIds) ? parsed.unlockedIds : [],
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [],
      bubbleCount: Number.isFinite(parsed.bubbleCount) ? parsed.bubbleCount : 0,
      projectReads: Array.isArray(parsed.projectReads) ? parsed.projectReads : [],
      jobReads: Array.isArray(parsed.jobReads) ? parsed.jobReads : [],
      footerClicks: Array.isArray(parsed.footerClicks) ? parsed.footerClicks : [],
      visitedSections: Array.isArray(parsed.visitedSections) ? parsed.visitedSections : [],
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
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressSnapshot, setProgressSnapshot] = useState({
    bubbleCount: 0,
    projectReads: 0,
    jobReads: 0,
    footerClicks: 0,
  });
  const bubbleCountRef = useRef(0);
  const projectReadsRef = useRef(new Set());
  const jobReadsRef = useRef(new Set());
  const footerClicksRef = useRef(new Set());
  const visitedSectionsRef = useRef(new Set());
  const buddaTimerRef = useRef(null);
  const isInHeadZoneRef = useRef(false);

  const persistBadgeState = () => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
      BADGE_STORAGE_KEY,
      JSON.stringify({
        unlockedIds: Array.from(unlocked),
        dismissedIds: Array.from(dismissed),
        bubbleCount: bubbleCountRef.current,
        projectReads: Array.from(projectReadsRef.current),
        jobReads: Array.from(jobReadsRef.current),
        footerClicks: Array.from(footerClicksRef.current),
        visitedSections: Array.from(visitedSectionsRef.current),
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
      jobReads: stored.jobReads.length,
      footerClicks: stored.footerClicks.length,
    });
  }, []);

  const unlockedIds = useMemo(() => new Set(unlocked), [unlocked]);

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
    if (typeof window === 'undefined') return undefined;

    const handleBubbleCollect = (event) => {
      bubbleCountRef.current = Math.max(bubbleCountRef.current, event.detail?.count ?? 0);
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
      const total = event.detail?.total;
      if (!id) return;
      projectReadsRef.current.add(id);
      setProgressSnapshot((prev) => ({ ...prev, projectReads: projectReadsRef.current.size }));
      persistBadgeState();
      if (projectReadsRef.current.size >= 1) {
        unlockBadge('project-first-steps');
      }
      if (projectReadsRef.current.size >= 10) {
        unlockBadge('project-explorer');
      }
      if (typeof total === 'number' && projectReadsRef.current.size >= total) {
        unlockBadge('project-completionist');
      }
    };

    const handleJobOpen = (event) => {
      const id = event.detail?.id;
      const total = event.detail?.total;
      if (!id) return;
      jobReadsRef.current.add(id);
      setProgressSnapshot((prev) => ({ ...prev, jobReads: jobReadsRef.current.size }));
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
      { threshold: 0.45 }
    );

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [unlockedIds]);

  useEffect(() => {
    // Timers should not reset when other badges are unlocked
    if (typeof window === 'undefined') return undefined;

    const timers = [
      { id: 'five-minute-mark', delay: 5 * 60 * 1000 },
      { id: 'quarter-hour', delay: 15 * 60 * 1000 },
      { id: 'hour-mark', delay: 60 * 60 * 1000 },
    ].map(({ id, delay }) => {
      // We check inside the timeout if it's already done
      return window.setTimeout(() => unlockBadge(id), delay);
    });

    return () => {
      timers.forEach((timer) => timer && window.clearTimeout(timer));
    };
  }, []); // Empty dependency array ensures timers persist

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
    bubbleCountRef.current = 0;
    projectReadsRef.current = new Set();
    jobReadsRef.current = new Set();
    footerClicksRef.current = new Set();
    visitedSectionsRef.current = new Set();
    setProgressSnapshot({ bubbleCount: 0, projectReads: 0, jobReads: 0, footerClicks: 0 });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(BADGE_STORAGE_KEY);
    }
  };

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col items-end gap-3">
      <button
        type="button"
        className="rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
        onClick={() => setIsProgressOpen((prev) => !prev)}
      >
        Badges {unlockedBadges.length}/{BADGES.length}
      </button>

      {isProgressOpen && (
        <div className="w-72 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <p className="font-semibold text-slate-900 dark:text-slate-50">Progress</p>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Unlocked: {unlockedBadges.length}/{BADGES.length}</p>
          <p className="text-slate-600 dark:text-slate-300">Project cards opened: {progressSnapshot.projectReads}</p>
          <p className="text-slate-600 dark:text-slate-300">Roles opened: {progressSnapshot.jobReads}</p>
          <p className="text-slate-600 dark:text-slate-300">Footer links clicked: {progressSnapshot.footerClicks}/{TOTAL_FOOTER_LINKS}</p>
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

      {unlockedBadges.map((badge) => {
        const isDismissed = dismissed.has(badge.id);
        const isRecent = recentlyUnlocked.has(badge.id);
        const isHovered = hoveredBadge === badge.id;

        return (
          <div
            key={badge.id}
            className={`badge-chip ${isRecent ? 'badge-pop' : ''} ${isDismissed && !isHovered ? 'badge-collapsed' : ''}`}
            onMouseEnter={() => isDismissed && setHoveredBadge(badge.id)}
            onMouseLeave={() => setHoveredBadge(null)}
          >
            <img src={badge.icon.src || badge.icon} alt="" className={isDismissed && !isHovered ? "h-6 w-6" : "h-8 w-8"} />
            {(!isDismissed || isHovered) && (
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">{badge.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-300 max-w-[140px]">{badge.description}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
