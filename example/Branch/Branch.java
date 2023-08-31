package Branch;

public class Branch {

    public static void main(String[] args) {
        double a = 20;
        int b = 30;
        if (a > b) {
            double c = 30;
            a = c + a;
        } else {
            int d = 40;
            b = d + b;
        }

        double e = a + b;
    }
}
