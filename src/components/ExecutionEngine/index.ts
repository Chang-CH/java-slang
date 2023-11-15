import { ClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import { JvmObject } from '#types/reference/Object';
import Thread, { ThreadStatus } from '#jvm/components/Thread/Thread';
import { JNI } from '../JNI';
import Interpreter from './Interpreter';
import { AbstractThreadPool, RoundRobinThreadPool } from '../ThreadPool';
import { assert } from 'console';

export default class ExecutionEngine {
  private threadpool: AbstractThreadPool;
  private interpreter: Interpreter;
  private jni: JNI;

  constructor(jni: JNI) {
    this.jni = jni;
    this.threadpool = new RoundRobinThreadPool(() => {});
    this.interpreter = new Interpreter(this.jni);
  }

  addThread(thread: Thread) {
    this.threadpool.addThread(thread);
  }

  run() {
    while (this.threadpool.hasThreads()) {
      const thread = this.threadpool.getCurrentThread();
      if (!thread) {
        throw new Error('No thread to run');
      }

      this.interpreter.runFor(thread, 100000, () => {
        thread.setStatus(ThreadStatus.TERMINATED);

        console.log('Thread Terminated');
      });
    }
  }

  runThread(thread: Thread) {
    this.interpreter.run(thread, () => {
      console.log('Run Finish');
    });
  }
}
