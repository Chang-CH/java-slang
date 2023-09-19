import NativeThread from './NativeThread';

export default class NativeThreadGroup {
  private threads: NativeThread[] = [];

  addThread(initialThread: NativeThread) {
    this.threads.push(initialThread);
  }

  getThread() {
    return this.threads[0];
  }
}
