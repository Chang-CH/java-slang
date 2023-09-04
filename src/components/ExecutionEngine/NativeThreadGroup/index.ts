import NativeThread from './NativeThread';

export default class NativeThreadGroup {
  threads: NativeThread[] = [];

  // TODO: check java threadgroup behaviour
  addThread(initialThread: NativeThread) {
    this.threads.push(initialThread);
  }

  /**
   * Picks a thread to run
   * TODO: May want to do thread scheduling in another class
   * @returns picked thread
   */
  getThread() {
    // TODO: check daemon threads
    console.warn('NativeThreadGroup.getThread: not implemented.');
    return this.threads[0];
  }
}
