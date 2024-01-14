class Task1 implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println("Task 1 - Count: " + i);
            try {
                Thread.sleep(40); // Simulate some work
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

class Task2 implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println("Task 2 - Count: " + i);
            try {
                Thread.sleep(60); // Simulate some work
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

public class Main {
    public static void main(String[] args) {
        // Create instances of the tasks
        Task1 task1 = new Task1();
        Task2 task2 = new Task2();
        
        // Create threads and associate with tasks
        Thread thread1 = new Thread(task1);
        Thread thread2 = new Thread(task2);
        
        // Start the threads
        thread1.start();
        thread2.start();
        
        try {
            // Wait for the threads to finish before exiting
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        
        System.out.println("Main thread exiting.");
    }
}
