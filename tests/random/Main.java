import java.util.Random;

public class Main {
    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        
        Random rand = new Random();
        // nextInt is normally exclusive of the top value,
        // so add 1 to make it inclusive
        int randomNum = rand.nextInt((5 - 1) + 1) + 1;
    
        System.out.println(randomNum);
    }
}