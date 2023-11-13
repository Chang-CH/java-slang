class Node<T> {
  data: T;
  next: Node<T>;
  prev: Node<T>;

  constructor(data: T, prev: Node<T>, next: Node<T>) {
    this.data = data;
    this.next = next;
    this.prev = prev;
  }
}

export class Deque<T> {
  private head: Node<T>;
  private tail: Node<T>;
  private size: number;

  constructor() {
    // Initialize dummy nodes so we do not need to check for nulls
    this.head = new Node<T>(
      null as T,
      null as unknown as Node<T>,
      null as unknown as Node<T>
    );
    this.tail = new Node<T>(
      null as T,
      null as unknown as Node<T>,
      null as unknown as Node<T>
    );

    this.head.next = this.tail;
    this.tail.prev = this.head;

    this.size = 0;
  }

  pushFront(data: T): void {
    const prevHead = this.head.next;
    const node = new Node<T>(data, this.head, prevHead);
    this.head.next = node;
    this.size += 1;
  }

  pushBack(data: T): void {
    const prevTail = this.tail.prev;
    const node = new Node<T>(data, prevTail, this.tail);
    this.tail.prev = node;
    this.size += 1;
  }

  popFront(): T {
    if (this.size === 0) {
      throw new Error('Deque is empty');
    }

    const node = this.head.next;
    const nextNode = node.next;

    this.head.next = nextNode;
    nextNode.prev = this.head;

    this.size -= 1;

    return node.data;
  }

  popBack(): T {
    if (this.size === 0) {
      throw new Error('Deque is empty');
    }

    const node = this.tail.prev;
    const prevNode = node.prev;

    this.tail.prev = prevNode;
    prevNode.next = this.tail;

    this.size -= 1;

    return node.data;
  }
}
