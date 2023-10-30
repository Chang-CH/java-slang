import { ClassRef } from '#types/ClassRef';
import NodeSystem from '#utils/NodeSystem';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ClassLoader from './components/ClassLoader/ClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import NativeThread from './components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from './components/JNI';

export default class JVM {
  private bootstrapClassLoader: BootstrapClassLoader;
  private applicationClassLoader: ClassLoader;
  private engine: ExecutionEngine;
  private nativeSystem: NodeSystem;
  private jni: JNI;

  constructor(nativeSystem: NodeSystem) {
    this.nativeSystem = nativeSystem;
    this.bootstrapClassLoader = new BootstrapClassLoader(
      this.nativeSystem,
      'natives'
    );
    // native classes loaded with bscl loaded as null classloader
    //   private java.lang.Class(java.lang.ClassLoader, java.lang.Class<?> array class, null otherwise);

    // this.applicationClassLoader = new ClassLoader(
    //   this.nativeSystem,
    //   'example',
    //   this.bootstrapClassLoader
    // );
    this.jni = new JNI();
    this.engine = new ExecutionEngine(this.jni);

    // const threadCls =
    //   this.bootstrapClassLoader.getClassRef('java/lang/Thread').result;
    // this.bootstrapClassLoader.getClassRef('java/lang/System').result;
    // const sysCls =
    //   this.bootstrapClassLoader.getClassRef('java/lang/System').result;
    // this.engine.runMethod(
    //   threadCls as ClassRef,
    //   sysCls as ClassRef,
    //   'initializeSystemClass()V'
    // );

    // this.jni.registerNativeMethod(
    //   'source/Source',
    //   'println(I)V',
    //   (thread: NativeThread, locals: any[]) => console.log(locals[0])
    // );
  }

  runClass(classPath: string) {
    let classDir: any = classPath.split('/');
    const className = classDir.pop();
    classDir = classDir.join('/');
    console.log(classDir);

    this.applicationClassLoader = new ClassLoader(
      this.nativeSystem,
      classDir,
      this.bootstrapClassLoader
    );

    // convert args to Java String[]
    const mainRes = this.applicationClassLoader.getClassRef(className);

    const threadRes =
      this.applicationClassLoader.getClassRef('java/lang/Thread');

    if (threadRes.error || !threadRes.result) {
      throw new Error('Thread class not found');
    }

    if (mainRes.error || !mainRes.result) {
      throw new Error('Main class not found');
    }

    this.engine.runClass(threadRes.result, mainRes.result);
  }
}
