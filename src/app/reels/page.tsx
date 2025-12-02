import { ReelItem } from "@/components/feed/ReelItem";

export default function ReelsPage() {
  // Simulate a feed of 10 items
  const reels = Array.from({ length: 10 }, (_, i) => i);

  return (
    <main className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar">
      {reels.map((i) => (
        <ReelItem key={i} index={i} />
      ))}
    </main>
  );
}
