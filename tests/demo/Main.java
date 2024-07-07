import modules.rune.Rune;

enum Operation {
    RANDOM_COLOUR, GRID
}

class RuneModifier {
    Operation operation;
    int count;

    public RuneModifier(Operation operation, int count) {
        this.operation = operation;
        this.count = count;
    }

    public void modify(int step) {
        switch (this.operation) {
            case RANDOM_COLOUR:
                Main.base = Rune.random_color(Main.base);
                break;
            case GRID:
                if (Main.intermediate == null) {
                    Main.intermediate = Rune.stackn(this.count * 2, Main.base);
                }
                Main.intermediate = Rune.beside_frac(1.0 / step, Rune.stackn(this.count * 2, Main.base), Main.intermediate);
                break;
        }
    }
}

class SyncTask extends RuneModifier implements Runnable {
    public SyncTask(Operation operation, int count) {
        super(operation, count);
    }

    @Override
    public void run() {
        synchronized (Main.base) {
            for (int i = 0; i < this.count; i++) {
                this.modify(i + 1);
                try {
                    Thread.sleep(10); // Simulate some work
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}


class NonSyncTask extends RuneModifier implements Runnable {
    public NonSyncTask(Operation operation, int count) {
        super(operation, count);
    }

    @Override
    public void run() {
        for (int i = 0; i < this.count; i++) {
            this.modify(i + 1);
            try {
                Thread.sleep(10); // Simulate some work
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}


public class Main {
    public static Rune intermediate;
    public static Rune result;
    public static Rune base = Rune.blue(Rune.heart);

    public static void main(String[] args) {
        SyncTask s1 = new SyncTask(Operation.GRID, 5);
        SyncTask s2 = new SyncTask(Operation.RANDOM_COLOUR, 5);
        
        Thread thread1 = new Thread(s1);
        Thread thread2 = new Thread(s2);

        thread1.start();
        thread2.start();
        
        try {
            thread1.join();
            thread2.join();
            Main.result = Main.intermediate;
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        NonSyncTask s3 = new NonSyncTask(Operation.GRID, 5);
        NonSyncTask s4 = new NonSyncTask(Operation.RANDOM_COLOUR, 5);
        
        Thread thread3 = new Thread(s3);
        Thread thread4 = new Thread(s4);

        thread3.start();
        thread4.start();
        
        try {
            thread3.join();
            thread4.join();
            Rune.show(Rune.beside(Main.result, Main.intermediate));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
