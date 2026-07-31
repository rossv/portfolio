import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="footer" className="relative py-12">

            <div className="container mx-auto px-6 relative z-10 text-center">
                <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} Ross Volkwein. All rights reserved.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500/60 dark:text-slate-400/60">
                        Connect
                    </span>
                    <div className="flex justify-center gap-8 items-center rounded-full bg-white/70 px-4 py-3 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900/60 dark:ring-slate-700/60">
                        <a
                            href="https://stackexchange.com/users/3363150/rossv?tab=accounts"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-badge-action="footer-link"
                            data-footer-id="stackexchange"
                            className="text-slate-500 dark:text-slate-300 hover:text-[#1E5397] transition-all duration-300 transform hover:scale-110 bg-white/80 dark:bg-slate-900/70 ring-1 ring-slate-200/70 dark:ring-slate-700/70 shadow-sm hover:shadow-md rounded-full p-3"
                            aria-label="Stack Exchange"
                        >
                            <svg role="img" viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                                <title>Stack Exchange</title>
                                <path d="M21.728 15.577v1.036c0 1.754-1.395 3.177-3.1 3.177h-.904L13.645 24v-4.21H5.371c-1.704 0-3.099-1.423-3.099-3.181v-1.032h19.456zM2.275 10.463h19.323v3.979H2.275v-3.979zm0-5.141h19.323v3.979H2.275V5.322zM18.575 0c1.681 0 3.023 1.42 3.023 3.178v1.034H2.275V3.178C2.275 1.422 3.67 0 5.375 0h13.2z" />
                            </svg>
                        </a>

                        <a
                            href="https://www.linkedin.com/in/rossvolkwein/"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-badge-action="footer-link"
                            data-footer-id="linkedin"
                            className="text-slate-500 dark:text-slate-300 hover:text-[#0A66C2] transition-all duration-300 transform hover:scale-110 bg-white/80 dark:bg-slate-900/70 ring-1 ring-slate-200/70 dark:ring-slate-700/70 shadow-sm hover:shadow-md rounded-full p-3"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-7 h-7" />
                        </a>

                        <a
                            href="https://github.com/rossv/"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-badge-action="footer-link"
                            data-footer-id="github"
                            className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 transform hover:scale-110 bg-white/80 dark:bg-slate-900/70 ring-1 ring-slate-200/70 dark:ring-slate-700/70 shadow-sm hover:shadow-md rounded-full p-3"
                            aria-label="GitHub"
                        >
                            <Github className="w-7 h-7" />
                        </a>

                        <a
                            href="mailto:ross.volkwein@gmail.com"
                            data-badge-action="footer-link"
                            data-footer-id="email"
                            className="text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-sky-400 transition-all duration-300 transform hover:scale-110 bg-white/80 dark:bg-slate-900/70 ring-1 ring-slate-200/70 dark:ring-slate-700/70 shadow-sm hover:shadow-md rounded-full p-3"
                            aria-label="Email Ross Volkwein"
                        >
                            <Mail className="w-7 h-7" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
