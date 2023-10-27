package Test;

public class Test implements Interface {
    @Override
    public int nonSMethod() {
        int y = 10;
        return y;
    }

    public void Y() {
        System.out.println("Test.Y");
    }

    public static void main(String[] args) {
        Interface.X();
    }
}
