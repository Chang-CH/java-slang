package Reference;

public class Reference {
    public int a;

    public Reference(int a) {
        this.a = a;
    }

    public static void main(String[] args) {
        Reference[] numbers = { new Reference(1) };
        numbers[0].a = 99;
    }
}
