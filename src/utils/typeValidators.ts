import type { Library } from '../types/library';
import type { Project } from '../types/project';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isLibrary(value: unknown): value is Library {
  if (!isObject(value)) return false;

  return (
    isString(value.id) && isString(value.name) && isArray(value.components)
  );
}

export function validateProject(data: unknown): asserts data is Project {
  if (!isObject(data)) {
    throw new ValidationError('Invalid project: Data must be an object');
  }

  if (!isString(data.name) || data.name.trim() === '') {
    throw new ValidationError('Invalid project: Missing or empty "name" field');
  }

  if (!isString(data.createdAt)) {
    throw new ValidationError('Invalid project: Missing "createdAt" field');
  }

  if (!isString(data.updatedAt)) {
    throw new ValidationError('Invalid project: Missing "updatedAt" field');
  }

  if (!isArray(data.colors)) {
    throw new ValidationError(
      'Invalid project: "colors" field must be an array'
    );
  }

  if (!data.colors.every(isString)) {
    throw new ValidationError(
      'Invalid project: All items in "colors" must be strings'
    );
  }

  if (!isArray(data.libraries)) {
    throw new ValidationError(
      'Invalid project: "libraries" field must be an array'
    );
  }

  if (!data.libraries.every(isLibrary)) {
    throw new ValidationError(
      'Invalid project: Invalid library format in "libraries" array'
    );
  }

  if (data.version !== undefined && typeof data.version !== 'number') {
    throw new ValidationError('Invalid project: "version" must be a number');
  }

  if (data.placedComponents !== undefined && !isArray(data.placedComponents)) {
    throw new ValidationError(
      'Invalid project: "placedComponents" must be an array'
    );
  }

  if (data.wires !== undefined && !isArray(data.wires)) {
    throw new ValidationError('Invalid project: "wires" must be an array');
  }
}
