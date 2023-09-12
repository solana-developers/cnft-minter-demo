/**
 * Debug logger for use in development mode, or when DEBUG is enabled
 */
export function debug(...props: any) {
  if (
    !process ||
    process?.env?.DEBUG === undefined ||
    process?.env?.NEXT_PUBLIC_DEBUG === undefined ||
    process?.env.NODE_ENV != "development"
  )
    return;

  console.debug("[DEBUG]", ...props);
}
