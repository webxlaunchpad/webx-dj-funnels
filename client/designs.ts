import noctisD from "./img/designs/noctis-site-desktop.jpg";
import noctisP from "./img/designs/noctis-site-phone.jpg";
import nocturneD from "./img/designs/nocturne-site-desktop.jpg";
import nocturneP from "./img/designs/nocturne-site-phone.jpg";
import voltaD from "./img/designs/volta-site-desktop.jpg";
import voltaP from "./img/designs/volta-site-phone.jpg";
import augustD from "./img/designs/august-vale-site-desktop.jpg";
import augustP from "./img/designs/august-vale-site-phone.jpg";

// The four WebX DJ designs (same names Core and DJ Hub use). Pictures are real screenshots of each
// design with its demo content. DJs can switch designs anytime in DJ Hub.
export const DESIGNS = [
  { id: "nocturne", name: "Nocturne", vibe: "Dark, cinematic, made for club and festival sets", desktop: nocturneD, phone: nocturneP },
  { id: "noctis", name: "Noctis", vibe: "City lights and rooftop energy", desktop: noctisD, phone: noctisP },
  { id: "volta", name: "Volta", vibe: "Bold color and big-room power", desktop: voltaD, phone: voltaP },
  { id: "august-vale", name: "August Vale", vibe: "Elegant, for weddings and private events", desktop: augustD, phone: augustP },
] as const;
export type DesignId = (typeof DESIGNS)[number]["id"];
