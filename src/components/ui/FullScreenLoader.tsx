import { Spinner } from './Spinner';

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-brand">
      <Spinner className="size-8" />
    </div>
  );
}
