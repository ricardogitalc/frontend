export function LoadingSpinner() {
  return (
    <div className="relative">
      <div className="h-12 w-12 animate-spin text-primary">
        <div className="absolute inset-0 rounded-full border-2 border-solid border-primary border-r-transparent" />
      </div>
      <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-primary/20" />
    </div>
  );
}
