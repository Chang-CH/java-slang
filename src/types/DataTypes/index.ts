export enum JavaType {
  byte,
  short,
  int,
  long,
  float,
  double,
  char,
  reference,
}

export interface JavaPrimitive {
  value: any;
  type: JavaType;
}
