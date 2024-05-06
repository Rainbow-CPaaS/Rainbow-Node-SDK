"use strict";
import {randomUUID} from "node:crypto";

export {};

class FIFOQueue<T> {
    protected queue: T[];
    protected logger: any;

    constructor(_logger: any) {
        this.queue = [];
        this.logger = _logger;
    }

    // Ajoute un élément à la fin de la file d'attente
    enqueue(item: T): void {
        this.queue.push(item);
    }

    // Retire et retourne le premier élément de la file d'attente
    dequeue(): T | undefined {
        return this.queue.shift();
    }

    // Retourne le premier élément de la file d'attente sans le retirer
    peek(): T | undefined {
        return this.queue.length > 0 ? this.queue[0] : undefined;
    }

    // Retourne vrai si la file d'attente est vide, faux sinon
    isEmpty(): boolean {
        return this.queue.length === 0;
    }

    // Retourne la taille de la file d'attente
    size(): number {
        return this.queue.length;
    }

    // Vide la file d'attente
    clear(): void {
        this.queue = [];
    }

    // Implémentation de toutes les méthodes de Array
    concat(...items: ConcatArray<T>[]): T[];
    concat(...items: (T | ConcatArray<T>)[]): T[];
    concat(...items: any): T[] {
        return this.queue.concat(...items);
    }

    copyWithin(target: number, start: number, end?: number): any {
        return this.queue.copyWithin(target, start, end);
    }

    entries(): IterableIterator<[number, T]> {
        return this.queue.entries();
    }

    every(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean {
        return this.queue.every(callbackfn, thisArg);
    }

    fill(value: T, start?: number, end?: number): any {
        return this.queue.fill(value, start, end);
    }

    filter(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[] {
        return this.queue.filter(callbackfn, thisArg);
    }

    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined {
        return this.queue.find(predicate, thisArg);
    }

    forEach(predicate: any) {
        this.queue.forEach(predicate);
    }

    unshift(...items: T[]) :any {
        return this.queue.unshift(...items);
    }

    values() : IterableIterator<T> {
        return this.queue.values();
    }

    keys(): IterableIterator<number> {
        return this.queue.keys();
    }
}

/*
// Exemple d'utilisation
const fifoQueue = new FIFOQueue<number>();
fifoQueue.enqueue(1);
fifoQueue.enqueue(2);
fifoQueue.enqueue(3);

console.log(fifoQueue.dequeue()); // Output: 1
console.log(fifoQueue.size());    // Output: 2
console.log(fifoQueue.peek());    // Output: 2
console.log(fifoQueue.isEmpty()); // Output: false

fifoQueue.clear();
console.log(fifoQueue.isEmpty()); // Output: true
// */

// Static factories
let createFIFOQueue = function (_logger) {
    return new FIFOQueue(_logger);
};

module.exports.createFIFOQueue = createFIFOQueue;
module.exports.FIFOQueue = FIFOQueue;
export {createFIFOQueue, FIFOQueue};