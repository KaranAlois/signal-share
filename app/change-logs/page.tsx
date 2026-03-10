import { AppShell } from '@/components/share/app-shell';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon as ArrowLeftIcon, Calendar01Icon as CalendarIcon, DocumentCodeIcon as DocumentTextIcon, Rocket02Icon as RocketIcon, PenTool02Icon as ToolIcon } from '@hugeicons/core-free-icons';
import Link from 'next/link';

export const metadata = {
  title: 'Changelog | SignalShare',
  description: 'Latest updates, features, and improvements to SignalShare.',
};

const changelogs = [
  {
    date: 'March 10, 2026',
    version: 'v1.2.0',
    changes: [
      {
        type: 'feature',
        title: 'Global Drag & Drop',
        description: 'You can now drag and drop files anywhere on the application window to instantly initiate a transfer, featuring a stunning new blur overlay.',
      },
      {
        type: 'feature',
        title: 'Folder & Directory Uploads',
        description: 'Drop entire folders into SignalShare! The client will now automatically zip the directory structure before transmitting it over WebRTC.',
      },
      {
        type: 'feature',
        title: 'Transfer History',
        description: 'A new local History page keeps track of all your past sent and received transfers securely using IndexedDB. No server required.',
      },
      {
        type: 'improvement',
        title: 'UI Polish & Grid Layouts',
        description: 'Centered the "Incoming Signal" prompt, added user avatars to the navigation bar, and completely redesigned the "Awaiting Connection" screen to use a responsive grid layout.',
      },
      {
        type: 'improvement',
        title: 'Enhanced QR Codes & E2E Badges',
        description: 'QR codes are now rendered dynamically using next/image with a premium glowing design. Added explicit "100% End-to-End Encrypted" badges to build trust during transmissions.',
      },
      {
        type: 'fix',
        title: 'Theme Favicons',
        description: 'Favicon now dynamically respects system dark/light modes using native prefers-color-scheme CSS inside the SVG.',
      }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <AppShell>
      <div className="w-full max-w-3xl mx-auto px-6 pt-32 pb-24 flex flex-col gap-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-xs uppercase tracking-widest w-fit">
          <HugeiconsIcon icon={ArrowLeftIcon} className="w-4 h-4" />
          Back to Scanner
        </Link>

        <div>
          <div className="flex items-center gap-3 mb-4 text-primary">
            <HugeiconsIcon icon={CalendarIcon} className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-widest uppercase text-foreground">Change Logs</h1>
          </div>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            Stay up to date with the latest features, improvements, and bug fixes in SignalShare.
          </p>
        </div>

        <div className="space-y-12">
          {changelogs.map((log, index) => (
            <div key={index} className="relative pl-8 md:pl-0">
              {/* Timeline line on mobile */}
              <div className="absolute left-[11px] top-2 bottom-0 w-px bg-border/50 md:hidden" />
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                {/* Date/Version Marker */}
                <div className="md:w-48 shrink-0 flex flex-col gap-1 relative z-10">
                  <div className="absolute -left-8 md:static md:left-auto flex items-center justify-center w-6 h-6 rounded-full bg-background border-2 border-primary/50 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)] md:hidden">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{log.date}</h3>
                  <span className="text-xs font-mono uppercase tracking-widest text-primary/80 bg-primary/10 w-fit px-2 py-0.5 rounded-full border border-primary/20">
                    {log.version}
                  </span>
                </div>

                {/* Changes List */}
                <div className="flex flex-col gap-6 w-full">
                  {log.changes.map((change, cIdx) => (
                    <div key={cIdx} className="bg-card/20 border border-primary/10 p-5 rounded-2xl backdrop-blur-sm hover:bg-card/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                          change.type === 'feature' ? 'bg-emerald-500/10 text-emerald-400' :
                          change.type === 'improvement' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {change.type === 'feature' ? <HugeiconsIcon icon={RocketIcon} className="w-4 h-4" /> :
                           change.type === 'improvement' ? <HugeiconsIcon icon={ToolIcon} className="w-4 h-4" /> :
                           <HugeiconsIcon icon={DocumentTextIcon} className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold tracking-wider text-foreground/90 uppercase">
                            {change.title}
                          </h4>
                          <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                            {change.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
