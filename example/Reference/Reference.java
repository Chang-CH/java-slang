package Reference;

public class Reference {
    public int a;

    public Reference(int a) {
        this.a = a;
    }

    public static void main(String[] args) {
        char[] c = { 'a', 'b', 'c' };
        String s = new String(c);
        // Reference r = new Reference(0);
        // r.a = 99;
    }
}
