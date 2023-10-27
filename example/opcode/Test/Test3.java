package Test;

public class Test3 extends Test {
    @Override
    public void Y() {
        System.out.println("Test3.Y");
    }

    public static void main(String[] args) {
        Test3 a = new Test3();
        a.Y();
    }
}
