export function isString(obj: any): obj is string {
  return typeof obj === 'string';
}

export function isArray(obj: any): boolean {
  return Array.isArray(obj);
}

export function isPresent(obj: any): boolean {
  return obj !== undefined && obj !== null;
}
