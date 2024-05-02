"use strict";
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