import Thread from '#jvm/components/Threads/Thread';

export default class NativeThreadGroup {
  private threads: Thread[] = [];

  addThread(initialThread: Thread) {
    this.threads.push(initialThread);
  }

  getThread() {
    return this.threads[0];
  }
}
