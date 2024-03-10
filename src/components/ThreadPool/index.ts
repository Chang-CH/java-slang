import { ThreadStatus } from '#jvm/constants';
import Thread from '../thread';
import { Deque } from './utils/deque';

export abstract class AbstractThreadPool {
  protected threads: Thread[] = [];
  protected currentThread: Thread | null = null;
  protected onEmpty: () => void;

  constructor(onEmpty: () => void) {
    this.onEmpty = onEmpty;
  }

  /**
   * Adds a new thread to the threadpool.
   * Schedules the thread if the status is runnable.
   */
  abstract addThread(thread: Thread): void;

  /**
   * Updates the status of a thread.
   * Thread will be scheduled/unscheduled based on the new status.
   * If thread status becomes terminated and no more threads are in the threadpool,
   * the onEmpty callback will be called.
   */
  abstract updateStatus(thread: Thread, oldStatus: ThreadStatus): void;

  abstract quantumOver(thread: Thread): void;

  abstract run(onFinish?: () => void): void;

  /**
   * Gets all threads in the threadpool.
   */
  getThreads(): Thread[] {
    return this.threads;
  }

  /**
   * Gets the current scheduled thread.
   */
  getCurrentThread(): Thread | null {
    return this.currentThread;
  }

  hasThreads(): boolean {
    this.clearTerminated();
    return this.currentThread !== null || this.threads.length > 0;
  }

  clearTerminated() {
    this.threads = this.threads.filter(
      x => x.getStatus() !== ThreadStatus.TERMINATED
    );
  }
}

export class RoundRobinThreadPool extends AbstractThreadPool {
  private threadQueue: Deque<Thread>;

  constructor(onEmpty: () => void) {
    super(onEmpty);
    this.threadQueue = new Deque<Thread>();
  }

  addThread(thread: Thread): void {
    this.threads.push(thread);

    if (thread.getStatus() === ThreadStatus.RUNNABLE) {
      if (this.currentThread === null) {
        this.currentThread = this.threadQueue.popFront();
      } else {
        this.threadQueue.pushBack(thread);
      }
    }
  }

  nextThread() {
    if (this.threadQueue.isEmpty()) {
      this.currentThread = null;
    } else {
      let thread = this.threadQueue.popFront();
      while (thread?.getStatus() !== ThreadStatus.RUNNABLE) {
        if (this.threadQueue.isEmpty()) {
          this.currentThread = null;
          return;
        }
        thread = this.threadQueue.popFront();
      }
      this.currentThread = thread;
    }
  }

  updateStatus(thread: Thread, oldStatus: ThreadStatus): void {
    if (thread.getStatus() === oldStatus) {
      return;
    }

    if (thread.getStatus() === ThreadStatus.TERMINATED) {
      this.clearTerminated();
      this.nextThread();
      return;
    }

    if (thread.getStatus() === ThreadStatus.RUNNABLE) {
      this.threadQueue.pushBack(thread);
      // restart loop
      if (this.currentThread === null) {
        this.nextThread();
      }
    } else if (
      thread === this.currentThread &&
      oldStatus === ThreadStatus.RUNNABLE
    ) {
      this.nextThread();
    }
  }

  quantumOver(thread: Thread): void {
    if (thread.getStatus() === ThreadStatus.TERMINATED) {
      this.clearTerminated();
    } else if (thread.getStatus() === ThreadStatus.RUNNABLE) {
      this.threadQueue.pushBack(thread);
    }

    if (this.currentThread === thread) {
      this.nextThread();
    }
  }

  run(onFinish?: () => void): void {
    const ID = setInterval(() => {
      if (this.currentThread !== null) {
        this.currentThread.runFor(10000);
      }
      if (!this.hasThreads()) {
        clearInterval(ID);
        onFinish?.();
      }
    }, 0);
  }
}
