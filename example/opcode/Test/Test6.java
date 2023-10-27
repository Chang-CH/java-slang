package Test;

public class Test6 implements Test2 {
    // public static void X() {
    // System.out.println("Test6.X");
    // }
    public static void mein() {
        // X();
    }

    public int nonSMethod() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'nonSMethod'");
    }

    public static void main(String[] args) {
        Test5 t5 = new Test5();
        t5.Z();
        mein();
    }
}
