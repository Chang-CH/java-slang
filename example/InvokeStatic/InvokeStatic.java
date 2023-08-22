package InvokeStatic;

public class InvokeStatic {
    static int addNumbers(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int a = 10;
        int b = -5;
        int c = addNumbers(a, b);
    }
}
