import { BotMessageSquare } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/planner" className="flex items-center gap-2" prefetch={false}>
      <BotMessageSquare className="h-7 w-7 text-primary" />
      <span className="text-xl font-bold text-foreground group-data-[collapsible=icon]:hidden">
        Sosyal AI
      </span>
    </Link>
  );
}
