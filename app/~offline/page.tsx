export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[430px] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.14em] text-secondary">
        Offline
      </p>
      <h1 className="mt-2 text-2xl font-medium">Timer</h1>
      <p className="mt-3 text-sm text-secondary">
        Reconnect to load the app. Your saved workouts stay on this phone.
      </p>
    </main>
  );
}
