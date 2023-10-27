package source;

public class Factorial {
    public static int fact(int n) {
        int res = 1;
        for (int i = 2; i <= n; i++)
            res *= i;
        return res;
    }

    public static void main(String args[]) {
        int n = 5;
        n = fact(n);
        Source.display(n);
    }
}
