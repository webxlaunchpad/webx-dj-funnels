import noctisD from "./img/designs/noctis-site-desktop.jpg";
import noctisP from "./img/designs/noctis-site-phone.jpg";
import nocturneD from "./img/designs/nocturne-site-desktop.jpg";
import nocturneP from "./img/designs/nocturne-site-phone.jpg";
import voltaD from "./img/designs/volta-site-desktop.jpg";
import voltaP from "./img/designs/volta-site-phone.jpg";
import augustD from "./img/designs/august-vale-site-desktop.jpg";
import augustP from "./img/designs/august-vale-site-phone.jpg";
import noctisDF from "./img/designs/noctis-desktop-full.jpg";
import noctisPF from "./img/designs/noctis-phone-full.jpg";
import nocturneDF from "./img/designs/nocturne-desktop-full.jpg";
import nocturnePF from "./img/designs/nocturne-phone-full.jpg";
import voltaDF from "./img/designs/volta-desktop-full.jpg";
import voltaPF from "./img/designs/volta-phone-full.jpg";
import augustDF from "./img/designs/august-vale-desktop-full.jpg";
import augustPF from "./img/designs/august-vale-phone-full.jpg";


// The four WebX DJ designs (same names Core and DJ Hub use). Pictures are real screenshots of each
// design with its demo content; the -full ones are the whole page, scrolled inside the preview frames. DJs can switch designs anytime in DJ Hub.
export const DESIGNS = [
  { id: "nocturne", name: "Nocturne", vibe: "Dark, cinematic, made for club and festival sets", desktop: nocturneD, phone: nocturneP, desktopFull: nocturneDF, phoneFull: nocturnePF },
  { id: "noctis", name: "Noctis", vibe: "City lights and rooftop energy", desktop: noctisD, phone: noctisP, desktopFull: noctisDF, phoneFull: noctisPF },
  { id: "volta", name: "Volta", vibe: "Bold color and big-room power", desktop: voltaD, phone: voltaP, desktopFull: voltaDF, phoneFull: voltaPF },
  { id: "august-vale", name: "August Vale", vibe: "Elegant, for weddings and private events", desktop: augustD, phone: augustP, desktopFull: augustDF, phoneFull: augustPF },
] as const;
export type DesignId = (typeof DESIGNS)[number]["id"];
