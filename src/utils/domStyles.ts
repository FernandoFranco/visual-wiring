export function getComputedStyles(
  element: Element,
  properties: string | string[]
): string | Record<string, string> {
  const computedStyle = window.getComputedStyle(element);

  if (typeof properties === 'string') {
    return computedStyle.getPropertyValue(properties);
  }

  const result: Record<string, string> = {};
  for (const property of properties) {
    result[property] = computedStyle.getPropertyValue(property);
  }

  return result;
}
