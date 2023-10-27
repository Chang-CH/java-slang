public class Lambda {
    public static void main(String[] args) {
        // Declaring a lambda expression and assigning it to a functional interface
        fi myLambda = (x) -> x * 2;

        // Invoking the lambda expression
        int x = myLambda.meth(20);
    }
}

// Functional interface with a single abstract method
interface fi {
    Integer meth(Integer i);
}