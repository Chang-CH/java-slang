import { ThreadStatus } from './thread/constants';
import type Thread from './thread/thread';

export default class Monitor {
  notifyArray: { thread: Thread; locks: number; timeout?: number }[] = [];
  acquireArray: { thread: Thread; locks: number; timeout?: number }[] = [];
  owner: Thread | null = null;
  locks: number = 0;

  /**
   * Sets the thread to wait until notify or notifyAll is called.
   * @param thread
   */
  wait(thread: Thread, timeout: number = 0, nanos: number = 0) {
    if (this.owner !== thread) {
      thread.throwNewException(
        'java.lang.IllegalMonitorStateException',
        'current thread is not owner'
      );
    }

    thread.setStatus(ThreadStatus.WAITING);
    const state: { thread: Thread; locks: number; timeout?: number } = {
      thread,
      locks: this.locks,
    };
    this.notifyArray.push(state);

    // revoke ownership
    this.owner = null;
    this.locks = 0;

    // wait for notify
    if (timeout > 0 || nanos > 0) {
      timeout += Math.min(nanos, 1); // settimeout uses millis
      state.timeout = setTimeout(() => {}, timeout) as any;
    }

    // unblock a thread
    if (this.acquireArray.length > 0) {
      const state = this.acquireArray.shift()!;
      state.thread.setStatus(ThreadStatus.RUNNABLE);
      this.owner = state.thread;
      this.locks = state.locks;
    }
  }

  notifyAll() {
    for (const state of this.notifyArray) {
      const thread = state.thread;
      thread.setStatus(ThreadStatus.RUNNABLE);
    }
  }
}
