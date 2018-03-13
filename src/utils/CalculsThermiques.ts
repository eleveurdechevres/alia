// Calculs : https://www.energieplus-lesite.be/index.php?id=11243#c5641+c5642+c5647

// courbes Psychrométriques :
// - Recommanded
// - A1
// - A2
// - A3
// - A4
// http://blog.thehigheredcio.com/ashrae-tc-9-9-new-thermal-guidelines-for-data-centers/

// x:     Humidité absolue______________________kg eau / kg d'air sec
// η:     Temperature___________________________°C
// φ:     Humidité relative_____________________%
// Pv :   Pression partielle de vaporisation____Pa
// Pvs :  Pression de vapeur saturante__________Pa
// Patm : Pression atmosphérique________________Pa
// h :    Enthalpie_____________________________kJ/kg d'air sec
// ηh :   Température du bulbe humide___________°C
// Pvsηh : la pression de vapeur saturante correspondant à ηh
//                    7.625 η
//          2.7877 + ---------
// Pvs = 10^         241.6 + η
//
// φ = Pv / Pvs
//
// x = 0.622 Pv/(Patm -Pv)
// 
// h = 1.006 η + x(2501 + 1.83η)
//
// Pv = Pvsηh - K.P (η - ηh)
//
// K = 6,6 x 10-4
// P = 101 300 Pa
const Patm = 101300;
const K = 0.00066;
const P = Patm;

export function get_x_from_η_φ (η: number, φ: number) {
    η = η * 1;
    φ = φ / 100;
    var Pvs = get_Pvs_from_η(η);
    var Pv = get_Pv_from_φ_Pvs(φ, Pvs);
    var x = 0.622 * (Pv / (Patm - Pv));

    return x * 1000;
}

function get_Pvs_from_η(η: number) {
    η = η * 1;
    var Pvs = Math.pow(10, (2.7877 + ((7.625 * η) / (241.6 + η))));
    return Pvs;
}

function get_Pv_from_φ_Pvs(φ: number, Pvs: number) {
    φ = φ * 1;
    Pvs = Pvs * 1;
    return φ * Pvs;
}

export function get_η(h: number, x: number) {
    h = h * 1;
    x = x * 1;
    return (h - 2501 * x) / (1.006 + 1.83 * x)
}

// function get_η_from_ηh(ηh: number) {
//     var Pvsηh = get_Pvs_from_η(ηh);
// }

export function get_η_from_ηh_φ(ηh: number, φ: number) {
    var Pvsηh = get_Pvs_from_η(ηh);
    var Pv = get_Pv_from_φ_Pvs(φ, Pvsηh);
    return (Pvsηh - Pv) / (K * P) + ηh;
}

export function get_η_from_φ_x(φ: number, x: number) {
    φ = φ / 100;
    x = x / 1000;
    var Pv = get_Pv_from_x(x);
    var Pvs = get_Pvs_from_φ_Pv(φ, Pv);
    return get_η_from_Pvs(Pvs);
}

// x = 0.622 Pv/(Patm -Pv)
function get_Pv_from_x(x: number) {
    x = x * 1;
    return x * Patm / (0.622 + x);
}

// φ = Pv / Pvs
function get_Pvs_from_φ_Pv(φ: number, Pv: number) {
    φ = φ * 1;
    Pv = Pv * 1;
    return Pv / φ;
}
function get_η_from_Pvs(Pvs: number) {
    return 241.6 * (Math.log10(Pvs) - 2.7877) / (7.625 - Math.log10(Pvs) + 2.7877);
}