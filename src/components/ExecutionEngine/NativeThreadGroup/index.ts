import JvmThread from '#types/reference/Thread';

export default class NativeThreadGroup {
  private threads: JvmThread[] = [];

  addThread(initialThread: JvmThread) {
    this.threads.push(initialThread);
  }

  getThread() {
    return this.threads[0];
  }
}
