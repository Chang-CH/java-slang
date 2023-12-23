# JVM-slang
Dev:

```sh
npm run dev
```

[ ] - Signature polymorphic handling
[ ] - handle classfile attributes: innerclasses, annotations etc.
[ ] - jni import system
[ ] - inner classes access check

[ ] - Threadpool + scheduler
[ ] - MethodHandle Field resolution 
[ ] - MethodHandle Signature polymorphic resolution
[ ] - signature polymorphic invocation
[ ] - Indy CSS resolution
[ ] - async register natives
[ ] - TDD tableswitch/lookupswitch
[ ] - DRY
[ ] - prune initial library loads
[ ] - logger tool
[ ] - javap

INDY: see openjdk-jdk8u\hotspot\src\share\vm\interpreter\linkResolver.cpp LinkResolver::resolve_invokedynamic
openjdk-jdk8u\hotspot\src\share\vm\classfile\systemDictionary.cpp:2709