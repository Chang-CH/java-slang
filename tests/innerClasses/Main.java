

public class Main {
    private static class InnerClass {
        private static String value = "INNER";
        private void print() {
            System.out.println("InnerClass.print()");
        }
    
        private static void staticPrint() {
            System.out.println("InnerClass.staticPrint()");
        }
    
        public void run() {
            Main.staticOuter();
            Main m = new Main();
            m.outer();
            System.out.println(Main.value);
            System.out.println("InnerClass.run() finished");
        }
    
    }

    private static String value = "OUTER";

    private static void staticOuter() {
        System.out.println("Main.staticOuter()");
    }

    private void outer() {
        System.out.println("Main.outer()");
    }

    public static void main(String[] args) {
        InnerClass.staticPrint();
        InnerClass ic = new InnerClass();
        ic.print();
        System.out.println(InnerClass.value);
        ic.run();
        System.out.println("Main.main() finished");
    }
}