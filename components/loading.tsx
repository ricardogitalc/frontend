export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-border"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    </div>
  );
}
