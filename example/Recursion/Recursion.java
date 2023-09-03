package Recursion;

public class Recursion {
    public static double addToTen(double a) {
        if (a < 10) {
            return addToTen(a + 1);
        } else {
            return a;
        }
    }

    public static void main(String[] args) {
        double a = 1;
        double b = addToTen(a);
    }
}