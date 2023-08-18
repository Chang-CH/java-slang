import MemoryArea from "../MemoryArea";
import NativeThreadGroup from "./NativeThreadGroup";

export default class ExecutionEngine {
    memoryArea: MemoryArea;
    nativeThreadGroup: NativeThreadGroup;
    constructor(memoryArea: MemoryArea) {
        this.memoryArea = memoryArea;
        this.nativeThreadGroup = new NativeThreadGroup();
    }
    runClass(className: string) {
        console.warn('ExecutionEngine.runClass not implemented.');
    }
}