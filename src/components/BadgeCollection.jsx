import { useEffect, useMemo, useRef, useState } from 'react';
import badgeSections from '../assets/badges/badge-sections.svg';
import badgeBubbles from '../assets/badges/badge-bubbles.svg';
import badgeBudda from '../assets/badges/badge-budda.svg';
import badgeSpaceNerd from '../assets/badges/badge-space-nerd.svg';
import badgeProject10 from '../assets/badges/badge-project-10.svg';
import badgeProjectAll from '../assets/badges/badge-project-all.svg';
import badgeJournal from '../assets/badges/badge-journal.svg';
import badgeJourneyman from '../assets/badges/badge-journeyman.svg';
import badgeFooter from '../assets/badges/badge-footer.svg';
import badgeTime1 from '../assets/badges/badge-time-1.svg';
import badgeTime5 from '../assets/badges/badge-time-5.svg';
import badgeTime15 from '../assets/badges/badge-time-15.svg';

const BADGE_STORAGE_KEY = 'portfolio-badges';

const BADGES = [
  {
    id: 'section-scout',
    name: 'Section Scout',
    description: 'Visited every main section.',
    icon: badgeSections,
  },
  {
    id: 'bubble-collector',
    name: 'Bubble Collector',
    description: 'Collected 50 floating bubbles.',
    icon: badgeBubbles,
  },
  {
    id: 'budda-badge',
    name: 'Budda Badge',
    description: 'Rubbed the portrait head area.',
    icon: badgeBudda,
  },
  {
    id: 'space-nerd-more',
    name: 'Space Nerd More',
    description: 'Found the Space Nerd more button.',
    icon: badgeSpaceNerd,
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
    id: 'minute-mark',
    name: 'Minute Mark',
    description: 'Spent one minute on the page.',
    icon: badgeTime1,
  },
  {
    id: 'five-minute-drift',
    name: 'Five Minute Drift',
    description: 'Spent five minutes on the page.',
    icon: badgeTime5,
  },
  {
    id: 'quarter-hour',
    name: 'Quarter Hour',
    description: 'Spent fifteen minutes on the page.',
    icon: badgeTime15,
  },
];

const SECTION_IDS = ['skills', 'timeline', 'achievements', 'projects', 'footer'];

export default function BadgeCollection() {
  const [unlocked, setUnlocked] = useState(new Set());
  const [recentlyUnlocked, setRecentlyUnlocked] = useState(new Set());
  const bubbleCountRef = useRef(0);
  const projectReadsRef = useRef(new Set());
  const jobReadsRef = useRef(new Set());
  const footerClicksRef = useRef(new Set());
  const visitedSectionsRef = useRef(new Set());
  const rubCountRef = useRef(0);
  const rubTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(BADGE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setUnlocked(new Set(parsed));
    }
  }, []);

  const unlockedIds = useMemo(() => new Set(unlocked), [unlocked]);

  const persistUnlocked = (next) => {
    window.localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify([...next]));
  };

  const unlockBadge = (id) => {
    setUnlocked((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      if (typeof window !== 'undefined') {
        persistUnlocked(next);
      }
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
    }, 1600);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleBubbleCollect = (event) => {
      bubbleCountRef.current = Math.max(bubbleCountRef.current, event.detail?.count ?? 0);
      if (bubbleCountRef.current >= 50) {
        unlockBadge('bubble-collector');
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
      { id: 'minute-mark', delay: 60 * 1000 },
      { id: 'five-minute-drift', delay: 5 * 60 * 1000 },
      { id: 'quarter-hour', delay: 15 * 60 * 1000 },
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
      if (action === 'space-nerd') {
        unlockBadge('space-nerd-more');
      }
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
      {unlockedBadges.map((badge) => (
        <div
          key={badge.id}
          className={`badge-chip ${recentlyUnlocked.has(badge.id) ? 'badge-pop' : ''}`}
          title={`${badge.name} — ${badge.description}`}
        >
          <img src={badge.icon.src || badge.icon} alt="" className="h-10 w-10" />
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">{badge.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 max-w-[140px]">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
