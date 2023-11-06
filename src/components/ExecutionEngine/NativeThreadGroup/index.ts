import Thread, { ThreadStatus } from '#jvm/components/Thread/Thread';

export default class NativeThreadGroup {
  private threads: Thread[] = [];

  private removeTerminated() {
    this.threads = this.threads.filter(
      thread => thread.getStatus() !== ThreadStatus.TERMINATED
    );
  }

  addThread(initialThread: Thread) {
    this.threads.push(initialThread);
  }

  getThread(filter?: (thread: Thread) => boolean) {
    this.removeTerminated();

    if (filter) {
      return this.threads.filter(filter)[0];
    }

    return this.threads[0];
  }

  hasThreads() {
    this.removeTerminated();
    return this.threads.length > 0;
  }
}
