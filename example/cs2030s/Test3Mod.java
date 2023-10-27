
class Test3Mod {
    public static void main(String[] args) {

        Booking b1 = new Booking(new Cab("SHA1234", 3), new JustRide(), new Request(20, 3, 1000));
        Booking b2 = new Booking(new Cab("SBC8888", 5), new JustRide(), new Request(20, 3, 1000));
        Booking b3 = new Booking(new PrivateCar("SU4032", 5), new ShareARide(),
                new Request(20, 3, 1000));

        Source.display("ok");
        // boolean ok = false;
        // try {
        // new Booking(new Cab("SHA1234", 2), new ShareARide(), new Request(20, 3,
        // 1000));
        // } catch (Exception e) {
        // ok = (e instanceof IllegalArgumentException);
        // }
        // i.expect("Invalid Booking should throw Exception",
        // ok, true);

        // try {
        // new Booking(new Cab("SHA1234", 2), new ShareARide(), new Request(20, 3,
        // 1000));
        // } catch (Exception e) {
        // i.expect("Exception should contain appropriate message",
        // e.getMessage(), "Cab SHA1234 (2 mins away) does not provide the ShareARide
        // service.");
        // }
    }
}
