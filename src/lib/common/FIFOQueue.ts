"use strict";
import {randomUUID} from "node:crypto";

export {};

class FIFOQueue<T> extends Array<T>{
    public queue: T[];
    protected logger: any;
    proxy: any;

    constructor(_logger: any, handler : any = {}) {
        super();
        this.queue = [];
        this.logger = _logger;
        //this.proxy = new Proxy(this, this.handler( p => p.queue,                              //target array
        this.proxy = new Proxy(this.queue, handler(_logger));                              //target array
        /*this.proxy = new Proxy(this.queue, this.handler( p => p.queue,                              //target array
            p => p.x,                                   //getter
            (p, v) => p.x = v                           //setter
        )); // */
        return this.proxy;
    }

    // Ajoute un élément à la fin de la file d'attente
    enqueue(item: T): void {
        //this.queue.push(item);
        // @ts-ignore
        this.push(item);
    }

    // Retire et retourne le premier élément de la file d'attente
    dequeue(): T | undefined {
        //return this.queue.shift();
        // @ts-ignore
        return this.shift();
    }

    // Retourne le premier élément de la file d'attente sans le retirer
    peek(): T | undefined {
        // @ts-ignore
        return this.length > 0 ? this[0]:undefined;
    }

    // Retourne vrai si la file d'attente est vide, faux sinon
    isEmpty(): boolean {
        // @ts-ignore
        return this.length===0;
    }

    // Retourne la taille de la file d'attente
    size(): number {
        // @ts-ignore
        return this.length;
    }

    // Vide la file d'attente
    clear(): void {
        // @ts-ignore
        this.lengrh = 0;
    }

    handler(container, getter, setter) {
        return {
           /*  get: (object, key) => {
                if (key==='length') {
                    return this.queue.length;
                } else if (typeof Array.prototype[key]=='function') { //array methods
                    if (typeof this[key]=='function') {
                        return this[key]();
                    } else {
                        return this.emulateArrayMethod(object, key, container, getter);
                    }
                } else {
                    try {                                               //access array by index
                        if (key===parseInt(key).toString()) {
                            if (0 <= key && key < this.queue.length) {
                                return this.queue[key];
                            } else {
                                throw "index out of bondary";
                            }
                        } else {
                            throw "float index";
                        }
                    } catch (err) {                                   //access to object by literal
                        return Reflect.get(object, key);
                    }
                }
            },

            set: (object, key, value) => {
                this.queue[key] = value;
                return true;
            }
            // */
        }
    }

    emulateArrayMethod(object, key, container, getter) {
        return (...args) => {
            try {
                console.log("Deprecated emulation. Better to define method " + key + "() by hands.");
                return ;
                //return Reflect.apply([][key], container(object), args).map(x => getter(x));
            } catch (err) {
                throw "Array method can not be emulated!";
            }
        }
    }

    /*
    get length() {
        return this.proxy.length;
    }

    slice() {
        return (start, end = this.length) => {
            let result = [];
            for (let i = start; i < end; i++) {
                result.push(this.proxy[i]);
            }
            return result;
        }
    }

    forEach() {
        return (func) => {
            for(let i = 0; i < this.length; i++) {
                func(this.proxy[i], i, this.proxy);
            }
            return this.proxy;
        }
    }

    map() {
        return (op) => {
            let result = [];
            for (let i = 0; i < this.length; i++) {
                result.push(op(this.proxy[i], i, this.proxy));
            }
            return result;
        }
    }

    filter() {
        return (op) => {
            let result = [];
            for (let i = 0; i < this.length; i++) {
                if (op(this.proxy[i], i, this.proxy)) {
                    result.push(this.proxy[i]);
                }
            }
            return result;
        }
    }

    reduce() {
        return (op, init) => {
            let total = init;
            for (let i = 0; i < this.length; i++) {
                total = op(total, this.proxy[i], i, this.proxy);
            }
            return total;
        }
    }

    every() {
        return (op,thisArg=undefined) => {
            let isEvery = true;
            for(let i = 0; i < this.length; i++) {
                if (op.call(thisArg, this.proxy[i], i, this.proxy)) {
                    continue;
                } else {
                    isEvery = false;
                    break;
                }
            }
            return isEvery;
        }
    }

    reverse() {
        return () => {
            for (let i = 0; i < Math.floor(this.length / 2); i++) {
                let temp = this.proxy[i];
                this.proxy[i] = this.proxy[this.length - i - 1];
                this.proxy[this.length - i - 1] = temp;
            }
            return this.proxy;
        }
    }

    join() {
        return (separator = ",") => {
            let result = "";
            for (let i = 0; i < this.length - 1; i++) {
                result += this.proxy[i] + separator;
            }
            return result + this.proxy[this.length - 1];
        }
    }

    toString() {
        return () => {
            let result = "[ ";
            for (let i = 0; i < this.length - 1; i++) {
                result += this.proxy[i] + ", ";
            }
            return result + this.proxy[this.length - 1] + " ]";
        }
    }

    get [Symbol.toStringTag]() {
        return "ObjectHandler";
    }

    // */

/*
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

    unshift(...items: T[]): any {
        return this.queue.unshift(...items);
    }

    values(): IterableIterator<T> {
        return this.queue.values();
    }

    keys(): IterableIterator<number> {
        return this.queue.keys();
    }
// */
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