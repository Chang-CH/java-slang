package modules.runes;

import java.util.function.Function;

public class Rune {

    public static final Rune circle;
    public static final Rune blank;
    public static final Rune corner;
    public static final Rune heart;
    public static final Rune nova;
    public static final Rune pentagram;
    public static final Rune rcross;
    public static final Rune ribbon;
    public static final Rune sail;
    public static final Rune square;

    static {
        circle = new Rune();
        linkRune(circle, "circle");
        blank = new Rune();
        linkRune(blank, "blank");
        corner = new Rune();
        linkRune(corner, "corner");
        heart = new Rune();
        linkRune(heart, "heart");
        nova = new Rune();
        linkRune(nova, "nova");
        pentagram = new Rune();
        linkRune(pentagram, "pentagram");
        rcross = new Rune();
        linkRune(rcross, "rcross");
        ribbon = new Rune();
        linkRune(ribbon, "ribbon");
        sail = new Rune();
        linkRune(sail, "sail");
        square = new Rune();
        linkRune(square, "square");
    }

    /**
     * Add js native rune as native field.
     * @param rune
     * @param shape
     */
    private static native void linkRune(Rune rune, String shape);

    public static native void anaglyph(Rune rune);
    public static native Rune beside(Rune rune1, Rune rune2);
    public static native Rune beside_frac(double frac, Rune rune1, Rune rune2);
    public static native Rune black(Rune rune);
    public static native Rune blue(Rune rune);
    public static native Rune brown(Rune rune);
    public static native Rune color(Rune rune, double r,double g, double b);
    public static native Rune flip_horiz(Rune rune);
    public static native Rune flip_vert(Rune rune);
    public static native Rune green(Rune rune);
    public static native void hollusion(Rune rune);
    public static native Rune indigo(Rune rune);
    public static native Rune make_cross(Rune rune);
    public static native Rune orange(Rune rune);
    public static native Rune overlay(Rune rune1, Rune rune2);
    public static native Rune overlay_frac(double frac, Rune rune1, Rune rune2);
    public static native Rune pink(Rune rune);
    public static native Rune purple(Rune rune);
    public static native Rune quarter_turn_left(Rune rune);
    public static native Rune quarter_turn_right(Rune rune);
    public static native Rune random_color(Rune rune);
    public static native Rune red(Rune rune);

    public static Rune repeat_pattern(int n, Function<Rune, Rune> f, Rune initial) {
        Rune ret = initial;
        for(; n > 0; n--) {
            ret = f.apply(ret);
        }
        return ret;
    }

    public static native Rune rotate(double rad, Rune rune);
    public static native Rune scale(double ratio, Rune rune);
    public static native Rune scale_independent(double ratio_x, double ratio_y, Rune rune);
    public static native void show(Rune rune);
    public static native Rune stack(Rune rune1, Rune rune2);
    public static native Rune stack_frac(double frac, Rune rune1, Rune rune2);
    public static native Rune stackn(int n, Rune rune);
    public static native Rune translate(double x, double y, Rune rune);
    public static native Rune turn_upside_down(Rune rune);
    public static native Rune white(Rune rune);
    public static native Rune yellow(Rune rune);
}


