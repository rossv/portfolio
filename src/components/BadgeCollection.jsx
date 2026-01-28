import { useEffect, useMemo, useRef, useState } from 'react';
import badgeSections from '../assets/badges/badge-sections.svg';
import badgeBubbles from '../assets/badges/badge-bubbles.svg';
import badgeBudda from '../assets/badges/badge-budda.svg';
import badgeProject10 from '../assets/badges/badge-project-10.svg';
import badgeProjectAll from '../assets/badges/badge-project-all.svg';
import badgeJournal from '../assets/badges/badge-journal.svg';
import badgeJourneyman from '../assets/badges/badge-journeyman.svg';
import badgeFooter from '../assets/badges/badge-footer.svg';
import badgeTime1 from '../assets/badges/badge-time-1.svg';
import badgeTime5 from '../assets/badges/badge-time-5.svg';
import badgeTime15 from '../assets/badges/badge-time-15.svg';

// Badges reset on page reload - no localStorage persistence

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
    id: 'budda-badge',
    name: 'Budda Badge',
    description: 'Rubbed the portrait head area.',
    icon: badgeBudda,
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
    icon: badgeTime1,
  },
  {
    id: 'quarter-hour',
    name: 'Quarter Hour',
    description: 'Spent fifteen minutes on the page.',
    icon: badgeTime5,
  },
  {
    id: 'hour-mark',
    name: 'Hour Mark',
    description: 'Spent one hour on the page.',
    icon: badgeTime15,
  },
];

const SECTION_IDS = ['skills', 'timeline', 'achievements', 'projects', 'footer'];

export default function BadgeCollection() {
  const [unlocked, setUnlocked] = useState(new Set());
  const [dismissed, setDismissed] = useState(new Set());
  const [recentlyUnlocked, setRecentlyUnlocked] = useState(new Set());
  const bubbleCountRef = useRef(0);
  const projectReadsRef = useRef(new Set());
  const jobReadsRef = useRef(new Set());
  const footerClicksRef = useRef(new Set());
  const visitedSectionsRef = useRef(new Set());
  const rubCountRef = useRef(0);
  const rubTimeoutRef = useRef(null);

  // No localStorage loading - badges reset on page reload

  const unlockedIds = useMemo(() => new Set(unlocked), [unlocked]);

  // No persistence functions needed - badges reset on reload

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
    }, 1600);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleBubbleCollect = (event) => {
      bubbleCountRef.current = Math.max(bubbleCountRef.current, event.detail?.count ?? 0);
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
      if (typeof total === 'number' && jobReadsRef.current.size >= total) {
        unlockBadge('journeyman');
      }
    };

    window.addEventListener('bubble-collect', handleBubbleCollect);
    window.addEventListener('project-open', handleProjectOpen);
    window.addEventListener('job-open', handleJobOpen);

    return () => {
      window.removeEventListener('bubble-collect', handleBubbleCollect);
      window.removeEventListener('project-open', handleProjectOpen);
      window.removeEventListener('job-open', handleJobOpen);
    };
  }, [unlockedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            visitedSectionsRef.current.add(entry.target.id);
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
    if (typeof window === 'undefined') return undefined;

    const timers = [
      { id: 'five-minute-mark', delay: 5 * 60 * 1000 },
      { id: 'quarter-hour', delay: 15 * 60 * 1000 },
      { id: 'hour-mark', delay: 60 * 60 * 1000 },
    ].map(({ id, delay }) => {
      if (unlockedIds.has(id)) return null;
      return window.setTimeout(() => unlockBadge(id), delay);
    });

    return () => {
      timers.forEach((timer) => timer && window.clearTimeout(timer));
    };
  }, [unlockedIds]);

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
        }
        if (footerClicksRef.current.size >= 4) {
          unlockBadge('footer-friend');
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [unlockedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const portrait = document.querySelector('[data-badge-target="portrait"]');
    if (!portrait) return undefined;

    const handlePointerMove = (event) => {
      const rect = portrait.getBoundingClientRect();
      const headZone = rect.top + rect.height * 0.45;
      if (event.clientY > headZone || event.clientX < rect.left || event.clientX > rect.right) {
        return;
      }

      rubCountRef.current += 1;
      if (rubCountRef.current >= 35) {
        unlockBadge('budda-badge');
      }

      if (rubTimeoutRef.current) {
        window.clearTimeout(rubTimeoutRef.current);
      }
      rubTimeoutRef.current = window.setTimeout(() => {
        rubCountRef.current = 0;
      }, 1500);
    };

    portrait.addEventListener('pointermove', handlePointerMove);
    return () => {
      portrait.removeEventListener('pointermove', handlePointerMove);
      if (rubTimeoutRef.current) window.clearTimeout(rubTimeoutRef.current);
    };
  }, [unlockedIds]);

  const unlockedBadges = BADGES.filter((badge) => unlockedIds.has(badge.id));

  if (unlockedBadges.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col items-end gap-3">
      {unlockedBadges.map((badge) => {
        const isDismissed = dismissed.has(badge.id);
        const isRecent = recentlyUnlocked.has(badge.id);

        return (
          <div
            key={badge.id}
            className={`badge-chip ${isRecent ? 'badge-pop' : ''} ${isDismissed ? 'badge-collapsed' : ''}`}
            title={`${badge.name} — ${badge.description}`}
          >
            <img src={badge.icon.src || badge.icon} alt="" className={isDismissed ? "h-8 w-8" : "h-10 w-10"} />
            {!isDismissed && (
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
