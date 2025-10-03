export function debounceSearch(
  func: (query: string) => void,
  wait: number
): (query: string) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (query: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(query);
    }, wait);
  };
}
