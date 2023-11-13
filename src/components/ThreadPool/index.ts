import Thread, { ThreadStatus } from '../Thread/Thread';
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
}

export class RoundRobinThreadPool extends AbstractThreadPool {
  private threadQueue: Deque<Thread>;

  constructor(onEmpty: () => void) {
    super(onEmpty);
    this.threadQueue = new Deque<Thread>();
  }

  addThread(thread: Thread): void {
    this.threads.push(thread);

    // TODO: check thread is runnable before pushing
    this.threadQueue.pushBack(thread);

    if (this.currentThread === null) {
      this.currentThread = this.threadQueue.popFront();
    }
  }

  updateStatus(thread: Thread, oldStatus: ThreadStatus): void {
    throw new Error('Method not implemented.');
  }

  quantumOver(thread: Thread): void {
    // TODO: check thread is runnable before pushing
    this.threadQueue.pushBack(thread);
  }
}
