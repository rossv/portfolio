import abstractPaperCut from '../assets/abstract-paper-cut.webp';
import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative py-12 overflow-hidden mt-10">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5 pointer-events-none mix-blend-multiply dark:mix-blend-overlay">
                <img src={abstractPaperCut.src} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Gradient Overlay to fade into the page content */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-900/30 z-0"></div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} Ross Volkwein. All rights reserved.
                </p>
                <div className="mt-8 flex justify-center gap-8 items-center">
                    <a
                        href="https://stackexchange.com/users/3363150/rossv?tab=accounts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#1E5397] transition-colors duration-300 transform hover:scale-110"
                        aria-label="Stack Exchange"
                    >
                        <svg role="img" viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                            <title>Stack Exchange</title>
                            <path d="M21.728 15.577v1.036c0 1.754-1.395 3.177-3.1 3.177h-.904L13.645 24v-4.21H5.371c-1.704 0-3.099-1.423-3.099-3.181v-1.032h19.456zM2.275 10.463h19.323v3.979H2.275v-3.979zm0-5.141h19.323v3.979H2.275V5.322zM18.575 0c1.681 0 3.023 1.42 3.023 3.178v1.034H2.275V3.178C2.275 1.422 3.67 0 5.375 0h13.2z" />
                        </svg>
                    </a>

                    <a
                        href="https://www.linkedin.com/in/rossvolkwein/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#0A66C2] transition-colors duration-300 transform hover:scale-110"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="w-6 h-6" />
                    </a>

                    <a
                        href="https://github.com/rossv/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 transform hover:scale-110"
                        aria-label="GitHub"
                    >
                        <Github className="w-6 h-6" />
                    </a>

                    <a
                        href="https://gis-portfolio-volkwein.hub.arcgis.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#007AC2] transition-colors duration-300 transform hover:scale-110"
                        aria-label="ArcGIS Portfolio"
                    >
                        <svg role="img" viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                            <title>ArcGIS</title>
                            <path d="M12 0a.84923.84923 0 0 0-.33766.07031l-8.5183 3.69444C2.1458 4.19776 1.4997 5.1816 1.4997 6.2697v13.2521l10.16264 4.40783c.21517.09333.46015.09407.67532.00073l8.5183-3.6959c.99824-.43301 1.64434-1.41685 1.64434-2.50495V4.47814L12.33766.06958C12.23007.02291 12.11516-.00005 12 0Zm0 4.83705c4.16294 0 7.53757 3.3746 7.53757 7.53757S16.163 19.91218 12 19.91218c-4.163 0-7.53757-3.37462-7.53757-7.53756S7.837 4.83705 12 4.83705zm-.3501 1.38871c-.89685-.02267-2.32742.2409-3.74645 1.6143.34958.55454.64544.97782.49 1.41801-.23127.65503-.5139.51378-1.07083.99466-.39567.34169.2067 1.01292-.31275 1.30595-.51945.29306-1.21315.6636-.94925 1.17557.2639.51196 1.4691.83013 1.95929 1.07522.49018.2451.92812.70605.6072 1.2371-.31403.51948-.53713 1.13083-.60134 1.60917 1.0549.94423 2.44706 1.51909 3.97423 1.51909 3.2928 0 5.81772-2.71048 5.96208-6.00017.04062-.92531-.93924-.93972-1.53447-.93972 0 0 .34061.92356.01831 1.43632-.3223.51278-.84968.76166-.83498 1.37699.01464.61533-.93743 1.5967-1.2598 1.9483-.32223.35163-.9228.74718-1.12796-.0586-.2051-.80579-.12596-1.47799.1084-2.04938.23442-.57136-.2174-.74707-.92068-.76174-.7032-.01463-1.0798-.10795-1.18656-1.19315-.08787-.89369 1.2429-1.84356 1.81426-1.84356.33406 0 1.45485.21963 1.50737-.34058.08056-.8593-.8204-1.04164-1.03934-1.60185C13.2877 7.58747 14.98596 6.60707 12 6.24993c-.10475-.01253-.22199-.02093-.3501-.02417z" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}
