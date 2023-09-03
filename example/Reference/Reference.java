package Reference;

public class Reference {
    public int a;

    public Reference(int a) {
        this.a = a;
    }

    public static void main(String[] args) {
        Reference[] numbers = { new Reference(1), new Reference(2), new Reference(3) };
        numbers[2].a = 99;
    }
}
