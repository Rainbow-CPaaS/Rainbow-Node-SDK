"use strict";
import { AsyncLocalStorage } from 'node:async_hooks';

export {};

type CorrelationStore = { id: string; depth: number };

const _storage = new AsyncLocalStorage<CorrelationStore>();

const generateCorrelationId = (prefix: string = 'req'): string => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const rand = Math.random().toString(36).slice(2, 6);
    return `${prefix}-${h}${m}${s}${ms}-${rand}`;
};

// runWithCorrelation auto-increments depth so nested calls keep the same ID
const runWithCorrelation = <T>(id: string, fn: () => T): T => {
    const depth = (_storage.getStore()?.depth ?? 0) + 1;
    return _storage.run({ id, depth }, fn);
};

const getCurrentCorrelationId = (): string | undefined => {
    return _storage.getStore()?.id;
};

const getCorrelationDepth = (): number => {
    return _storage.getStore()?.depth ?? 0;
};

// escapeContext runs fn with no active store so callers don't inherit SDK context
const escapeContext = <T>(fn: () => T): T => {
    return _storage.exit(fn);
};

module.exports.generateCorrelationId = generateCorrelationId;
module.exports.runWithCorrelation = runWithCorrelation;
module.exports.getCurrentCorrelationId = getCurrentCorrelationId;
module.exports.getCorrelationDepth = getCorrelationDepth;
module.exports.escapeContext = escapeContext;
export { generateCorrelationId, runWithCorrelation, getCurrentCorrelationId, getCorrelationDepth, escapeContext };
