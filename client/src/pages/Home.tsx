import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { weddingApi, type TableAvailability } from "@/lib/api";
import { Users, MapPin, Minus, Plus, SendHorizontal, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SEAL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/88306074/mwrNRhRAgBrtZ3TnyqG9SP/monogram-seal-9DHfjCGCpJEWr5NThfwrog.webp";
const CUPID_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/88306074/mwrNRhRAgBrtZ3TnyqG9SP/cupid-illustration-Ko33StVJEtx9KhHynz9E6G.webp";
const HERO_IMAGE = "/background.png";
const WEDDING_DATE = new Date("2026-07-25T00:00:00+02:00");
const WEDDING_DATE_LABEL = "25 July 2026";
const WEDDING_LOCATION = "Chaussée de Gand 389, 1080 Molenbeek-Saint-Jean";
const WELCOME_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1492716731623-1906dc9f3b7f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80",
];
const DAY_PROGRAMME_KEYS = [
  { time: "10:00", key: "arrival" as const, side: "right" as const },
  { time: "13:00", key: "ceremony" as const, side: "left" as const },
  { time: "16:00", key: "cocktails" as const, side: "right" as const },
  { time: "18:00", key: "dinner" as const, side: "left" as const },
  { time: "20:00", key: "cuttingCake" as const, side: "right" as const },
];

type CountdownState = { days: number; hours: number; minutes: number };

type RSVPState = {
  attending: "yes" | "no";
  numberOfGuests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  childrenAttending: "yes" | "no";
  numberOfChildren: number;
  message: string;
  tableId: string;
};

function getCountdown(targetDate: Date): CountdownState {
  const diffMs = Math.max(targetDate.getTime() - Date.now(), 0);
  return {
    days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diffMs / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diffMs / (1000 * 60)) % 60),
  };
}

type Lang = "en" | "rw";

const t = {
  en: {
    gettingMarried: "We're Getting Married",
    countdown: "Countdown",
    until: "Until",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    welcome: "Welcome!",
    welcomeText:
      "We warmly invite you to celebrate our wedding day with us in Brussels, Belgium. We look forward to sharing this unforgettable moment with our most special people.",
    howItWorks: "How It Works",
    step1Title: "Send Your RSVP",
    step1Desc: "Confirm your attendance using the RSVP form below. Select a table, enter your name, email, and WhatsApp number.",
    step2Title: "Check Your Table",
    step2Desc: "Already RSVPed? Use the \"Check Your Table\" button and search your name to see your assigned table number.",
    step3Title: "Join Us on the Day",
    step3Desc: "Arrive at Chau. de Gand 389, 1080 Molenbeek-Saint-Jean, find your table, and celebrate this special moment with us.",
    venue: "The Venue",
    venueWhere: "Where we celebrate",
    venueName: "Event Center - Bruxelles",
    openInMaps: "Open in Maps",
    dayProgramme: "Day Programme",
    preWedding: "Pre-Wedding Events",
    preWeddingIntro: "Come Say Hello...",
    preWeddingDesc:
      "These are informal gatherings, feel free to join us if you are in Brussels before the wedding day.",
    dowry: "Dowry Ceremony",
    religiousCeremony: "Religious Ceremony",
    gifts: "Gifts",
    giftsText:
      "Your presence is our greatest gift. If you wish to give us something, please find our bank account information below:",
    rsvp: "RSVP",
    rsvpSub: "Let us know if you can make it",
    thankYou: "Thank you!",
    rsvpReceived: "Your RSVP has been received.",
    attending: "Will you be attending? *",
    yesAttending: "Yes, I'll be there",
    noAttending: "Unfortunately, I can't make it",
    howManyGuests: "How many guests?",
    childrenAttending: "Will any children be attending?",
    yes: "Yes",
    no: "No",
    selectTable: "Select Table *",
    loading: "Loading...",
    chooseTable: "Choose a table",
    seatsLeft: "seats left",
    noSeats: "No table has {n} seats available right now.",
    person1: "Person 1 (Main contact)",
    fullName: "Full name",
    emailAddress: "Email address",
    dietary: "Phone (WhatsApp)",
    dietaryPlaceholder: "e.g. +1 234 567 8900",
    messageCouple: "Message for the couple",
    messagePlaceholder: "Is there anything you'd like to tell us?",
    sending: "Sending...",
    sendRsvp: "Send RSVP",
    checkMyTable: "Check Your Table",
    checkTablePlaceholder: "Enter your name to find your table",
    checkTableSearch: "Search",
    checkTableSearching: "Searching...",
    checkTableResult: "Your table",
    checkTableNotFound: "No booking found for that name.",
    readyCta: "Ready to Celebrate With Us?",
    readyCtaSub: "Reserve your table now and be part of this special celebration",
    rsvpNow: "RSVP Now",
    arrival: "Dowry Ceremony",
    ceremony: "Religous Wedding",
    cocktails: "Cocktails",
    dinner: "Dinner",
    cuttingCake: "Cutting The Cake",
    finish: "Finish",
  },
  rw: {
    gettingMarried: "Dufite Ubukwe",
    countdown: "Iminsi Isigaye",
    until: "Kugeza",
    days: "Iminsi",
    hours: "Amasaha",
    minutes: "Iminota",
    welcome: "Ikaze!",
    welcomeText:
      "Twishimiye kubatumira kwishimana natwe ku munsi w'ubukwe bwacu i Bruxelles mu Bubiligi. Kuza kwifatanya natwe kuri uyu munsi bizatunezeza cyane.",
    howItWorks: "Uko Bigenda",
    step1Title: "Ohereza RSVP Yawe",
    step1Desc: "Emeza ko uzaza ukoresheje ifishi ya RSVP iri hasi. Hitamo ameza, shyiramo amazina, E-mail na nimero ya WhatsApp ubonekaho.",
    step2Title: "Reba Ameza Yawe",
    step2Desc: "Wariyandikishije muri RSVP? Niwibagirwa nunmero y'ameza ushobora kuyareba ushakishije amazina yawe.",
    step3Title: "Twifatanye ku Munsi",
    step3Desc: "Ni karibu kuri Chau. de Gand 389, 1080 Molenbeek-Saint-Jean, ubone ameza yawe twifatanye ku munsi udasanzwe.",
    venue: "Aho bizabera",
    venueWhere: "Aho tuzasezeranira",
    venueName: "Event Center - Bruxelles",
    openInMaps: "Fungura ku ikarita",
    dayProgramme: "Gahunda y'Umunsi",
    preWedding: "Indi mihango",
    preWeddingIntro: "Bana n'imiryango yacu",
    preWeddingDesc:
      "Izi ni nama zidasanzwe, wemerewe kuza niba uri muri Bruxelles mbere y'umunsi w'ubukwe.",
    dowry: "Gusaba no Gukwa",
    religiousCeremony: "Gusezerana Imbere y'Imana",
    gifts: "Impano",
    giftsText:
      "Kubaho kwawe ni impano itangaje ku buzima bwacu. Niba wifuza kudushyigikira birenze kuhaboneka, koresha izo konti",
    rsvp: "Kwitabira",
    rsvpSub: "Dufashe kwitegura niba uzaboneka",
    thankYou: "Urakoze!",
    rsvpReceived: "RSVP yawe yakiriwe neza.",
    attending: "Ese uzaboneka? *",
    yesAttending: "Yego, nzaza",
    noAttending: "Ntibizankundira kuboneka",
    howManyGuests: "Muzaza mungana iki?",
    childrenAttending: "Ese muzazana n'abana?",
    yes: "Yego",
    no: "Oya",
    selectTable: "Hitamo Ameza *",
    loading: "Tegereza...",
    chooseTable: "Hitamo ameza",
    seatsLeft: "Imyanya isigaye",
    noSeats: "Nta meza afite imyanya {n} agihari.",
    person1: "Amazina yombi",
    fullName: "Andika hano amazina",
    emailAddress: "E-mail",
    dietary: "Telefone (WhatsApp)",
    dietaryPlaceholder: "urugero: +250 78 000 0000",
    messageCouple: "Ubutumwa bwihariye",
    messagePlaceholder: "Andikira abategura ubukwe",
    sending: "Kohereza...",
    sendRsvp: "Ohereza",
    checkMyTable: "Reba Ameza Yawe",
    checkTablePlaceholder: "Injiza amazina yawe",
    checkTableSearch: "Shakisha",
    checkTableSearching: "Gushakisha...",
    checkTableResult: "Ameza yawe",
    checkTableNotFound: "Nta meza murafata. Turabategereje ahubwo!",
    readyCta: "Witeguye Kwishimana Natwe?",
    readyCtaSub: "Fata umwanya uzicaramo muri ubu bukwe bwacu",
    rsvpNow: "Kanda hano",
    arrival: "Gusaba no gukwa",
    ceremony: "Umuhango",
    cocktails: "Ibinyobwa",
    dinner: "Amafunguro",
    cuttingCake: "Gukata Gato",
    finish: "Gusoza",
  },
} as const;

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [copiedIban, setCopiedIban] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdown(WEDDING_DATE));
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvp, setRsvp] = useState<RSVPState>({
    attending: "yes",
    numberOfGuests: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    childrenAttending: "no",
    numberOfChildren: 1,
    message: "",
    tableId: "",
  });

  useEffect(() => {
    const id = window.setInterval(() => setCountdown(getCountdown(WEDDING_DATE)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const [tableCheckOpen, setTableCheckOpen] = useState(false);
  const [tableCheckName, setTableCheckName] = useState("");
  const [tableCheckResults, setTableCheckResults] = useState<any[]>([]);
  const [tableCheckFetching, setTableCheckFetching] = useState(false);

  const [availableTables, setAvailableTables] = useState<TableAvailability[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);

  useEffect(() => {
    if (rsvp.attending !== "yes") return;
    setTablesLoading(true);
    weddingApi.getAvailableTables(rsvp.numberOfGuests)
      .then(data => {
        setAvailableTables(data);
        setRsvp(prev => {
          if (prev.tableId && !data.some(t => t.tableId === prev.tableId)) {
            return { ...prev, tableId: "" };
          }
          return prev;
        });
      })
      .catch(() => setAvailableTables([]))
      .finally(() => setTablesLoading(false));
  }, [rsvp.attending, rsvp.numberOfGuests]);

  const handleTableSearch = async (name: string) => {
    if (!name.trim()) return;
    setTableCheckFetching(true);
    try {
      setTableCheckResults(await weddingApi.searchByName(name));
    } catch {
      setTableCheckResults([]);
    } finally {
      setTableCheckFetching(false);
    }
  };

  const updateGuests = (delta: number) =>
    setRsvp(prev => ({ ...prev, numberOfGuests: Math.min(10, Math.max(1, prev.numberOfGuests + delta)) }));

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rsvp.attending === "no") {
      setRsvpSubmitted(true);
      toast.success("Thanks for your response. We will miss you!");
      return;
    }
    if (!rsvp.guestName.trim() || !rsvp.guestEmail.trim()) { toast.error("Please add your name and email."); return; }
    if (!rsvp.tableId) { toast.error("Please select a table."); return; }

    const specialRequests = [
      `Children: ${rsvp.childrenAttending === "yes" ? `yes (${rsvp.numberOfChildren})` : "no"}`,
      rsvp.message ? `Message: ${rsvp.message}` : null,
    ].filter(Boolean).join(" | ");

    setBookingPending(true);
    try {
      await weddingApi.createBooking({
        tableId: rsvp.tableId,
        guestName: rsvp.guestName.trim(),
        guestEmail: rsvp.guestEmail.trim(),
        guestPhone: rsvp.guestPhone || undefined,
        numberOfGuests: rsvp.numberOfGuests,
        specialRequests: specialRequests || undefined,
      });
      setRsvpSubmitted(true);
      toast.success("RSVP sent successfully.");
    } catch (err: any) {
      toast.error(err.message || "Unable to send RSVP. Please try again.");
    } finally {
      setBookingPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-gold-50 font-body">
      {/* ───── Language Switch ───── */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm border border-gold-200 p-0.5 shadow-sm">
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                lang === "en" ? "bg-gold-600 text-white" : "text-dark-500 hover:text-dark"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("rw")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                lang === "rw" ? "bg-gold-600 text-white" : "text-dark-500 hover:text-dark"
              }`}
            >
              RW
            </button>
          </div>
        </div>

      {/* ───── Hero ───── */}
      <section
        className="relative min-h-[90vh] md:min-h-[100vh] flex items-center justify-center px-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="text-md tracking-[0.35em] uppercase text-white/80 text-lg md:text-xl mb-20 md:mb-40 mt-10 md:mt-20">
            {t[lang].gettingMarried}
          </p>
          <h1 className="font-script text-6xl md:text-8xl text-cream leading-tight mb-2">
            Claudine
          </h1>
        
          <p className="text-white text-4xl italic mb-1">&amp;
        
          </p>
          <h1 className="font-script text-6xl md:text-8xl text-cream leading-tight mb-40">
            Anaclet
          </h1>

          {/* <img
            src={CUPID_IMAGE}
            alt="Cupid"
            className="mx-auto w-24 md:w-28 opacity-90 mb-6"
          />
            */}
  <span className="h-px bg-white/70 w-12 md:w-24"></span>
         <p className="text-white/90 text-2xl md:text-3xl tracking-wide mb-10">
            {WEDDING_DATE_LABEL}
          </p>
        
          <span className="h-px bg-white/70 w-12 md:w-24"></span>
          <p className="text-white/70 text-xs tracking-[0.25em] text-xl md:text-2xl uppercase">
            RSVP <span className="inline-block animate-bounce">↓</span>
          </p>
        </div>
      </section>

      {/* ───── Countdown + Welcome ───── */}
      <section className="bg-[#f6f2e9] py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-script text-5xl md:text-6xl text-burgundy mb-1">
              {t[lang].countdown}
            </h2>
            <p className="text-xs tracking-[0.3em] uppercase text-bold text-md md:text-xl text-dark-500">
              {t[lang].until} {WEDDING_DATE_LABEL}
            </p>

            <div className="mt-10 mx-auto max-w-sm grid grid-cols-3 gap-8">
              {[
                { value: countdown.days, label: t[lang].days },
                { value: countdown.hours, label: t[lang].hours },
                { value: countdown.minutes, label: t[lang].minutes },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-4xl md:text-5xl font-light text-dark">{item.value}</p>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-dark-500 mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-gold-100 p-10 md:p-14 mb-12">
            
            <h3 className="font-script text-5xl md:text-6xl text-burgundy text-center mb-5">
              {t[lang].welcome}
            </h3>
            <p className="text-center text-dark-600 text-lg leading-relaxed max-w-2xl mx-auto">
              {t[lang].welcomeText}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {WELCOME_GALLERY_IMAGES.map((src, i) => (
              <div key={`gallery-${i}`} className="overflow-hidden rounded-xl h-36 md:h-44">
                <img src={src} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="bg-white py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <h2 className="font-script text-5xl md:text-6xl text-center text-burgundy mb-16">
            {t[lang].howItWorks}
          </h2>
          <div className="grid md:grid-cols-3 gap-14">
            {[
              { step: 1, title: t[lang].step1Title, desc: t[lang].step1Desc },
              { step: 2, title: t[lang].step2Title, desc: t[lang].step2Desc },
              { step: 3, title: t[lang].step3Title, desc: t[lang].step3Desc },
            ].map(item => (
              <div key={item.step} className="text-center group">
              <div className="w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-bold text-burgundy shadow-md group-hover:shadow-lg transition-shadow">
  {item.step}
</div>
                <h3 className="text-xl font-semibold text-dark mb-3">{item.title}</h3>
                <p className="text-dark-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Venue ───── */}
      <section className="bg-[#be9a63] py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-script text-5xl md:text-6xl text-cream mb-1">{t[lang].venue}</h2>
            <p className="text-cream/80 text-sm">{t[lang].venueWhere}</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden rounded-2xl border border-gold-200 bg-white shadow-xl">
              <div className="p-8 md:p-10 text-center border-b border-gold-100">
                <img
                  src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80"
                  alt="Venue"
                  className="w-full h-56 object-cover rounded-xl mb-6"
                />
                <h3 className="font-script text-3xl md:text-4xl text-dark mb-3">{t[lang].venueName}</h3>
                <p className="text-dark-600">{WEDDING_LOCATION}</p>
              </div>
              <div className="h-64 md:h-72">
                <iframe
                  title="Venue map"
                  src="https://www.google.com/maps?q=Chaussée+de+Gand+389%2C+1080+Molenbeek-Saint-Jean&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="py-4 text-center border-t border-gold-100">
                <a
                  href="https://maps.google.com/?q=Chaussée+de+Gand+389,+1080+Molenbeek-Saint-Jean"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 tracking-[0.15em] text-xs uppercase font-semibold text-dark-600 hover:text-burgundy transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {t[lang].openInMaps}
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── Day Programme ───── */}
      <section className="bg-[#f7f4ec] py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-script text-5xl md:text-6xl text-burgundy mb-2">{t[lang].dayProgramme}</h2>
            <p className="text-gold-700 text-xl">{WEDDING_DATE_LABEL}</p>
          </div>

          <div className="relative mx-auto max-w-xl">
            {/* Vertical center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#D4AF37] -translate-x-1/2" />

            <div className="space-y-0">
              {DAY_PROGRAMME_KEYS.map((item, i) => (
                <div key={`${item.time}-${i}`} className="relative grid grid-cols-[1fr_auto_1fr] items-center">
                  {/* Left side content */}
                  <div className={`py-3 md:py-8 pr-4 md:pr-8 text-right ${item.side === "left" ? "" : "opacity-0"}`}>
                    <p className="text-lg md:text-2xl font-semibold text-dark">{item.time}</p>
                    <p className="text-xs md:text-sm tracking-[0.15em] uppercase text-dark-600">{t[lang][item.key]}</p>
                  </div>

                  {/* Center dot + horizontal line */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-gold-500 border-2 border-white shadow-sm z-10" />
                    <div className={`absolute h-px w-5 md:w-8 bg-gold-300 ${item.side === "left" ? "right-1/2 mr-1.5" : "left-1/2 ml-1.5"}`} />
                  </div>

                  {/* Right side content */}
                  <div className={`py-3 md:py-8 pl-4 md:pl-8 text-left ${item.side === "right" ? "" : "opacity-0"}`}>
                    <p className="text-lg md:text-2xl font-semibold text-dark">{item.time}</p>
                    <p className="text-xs md:text-sm tracking-[0.15em] uppercase text-dark-600">{t[lang][item.key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Pre-Wedding Events 
      <section className="bg-[#be9a63] py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.25em] uppercase text-cream/80 font-semibold mb-4">
              {t[lang].preWedding}
            </p>
            <h2 className="font-script text-5xl md:text-6xl text-cream mb-3">{t[lang].preWeddingIntro}</h2>
            <p className="text-cream/80 max-w-xl mx-auto">
              {t[lang].preWeddingDesc}
            </p>
          </div>

          <div className="space-y-5">
            {[
              { emoji: "🥂", title: t[lang].dowry, date: "Saturday, June 6th, 2026", time: "8:00 PM", venue: "Kigali, Rwanda" },
              { emoji: "☕", title: t[lang].religiousCeremony, date: "Saturday, July 25th, 2026", time: "11:00 AM", venue: "ADEPR Europe, Belgium" },
            ].map(event => (
              <Card key={event.title} className="rounded-2xl border border-gold-100 bg-[#f7f4ec] shadow-lg p-8 text-center">
                <div className="text-4xl mb-3">{event.emoji}</div>
                <h3 className="font-script text-3xl md:text-4xl text-burgundy mb-3">{event.title}</h3>
                <p className="text-dark-600">{event.date}</p>
                <p className="text-dark-600 text-sm mt-0.5">{event.time}</p>
                <p className="text-dark-500 text-sm mt-1">{event.venue}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
───── */}
      {/* ───── Gifts ───── */}
      <section
        className="py-20 px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1800&q=80')" }}
      >
        <div className="container max-w-3xl mx-auto">
          <Card className="bg-[#f7f4ec]/95 backdrop-blur-sm rounded-3xl border border-gold-100 shadow-2xl p-8 md:p-12">
            <h2 className="font-script text-5xl md:text-6xl text-burgundy text-center mb-5">{t[lang].gifts}</h2>
            <p className="text-center text-dark-600 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              {t[lang].giftsText}
            </p>
            <div className="space-y-4">
              {[
                { bank: "Anaclet Nsabimana - ING Bank", iban: "BE05 3631 1987 6175", bic: "" },
                { bank: "Ingabire Claudine - ING Bank", iban: "BE24 3771 4328 8538", bic: "(Amazina: Irebe Rutayisire)" },
              ].map(acc => (
                <Card key={acc.bic} className="bg-[#efede8] border border-gold-100 rounded-xl p-6 shadow-sm">
                  <h3 className="text-base tracking-[0.14em] uppercase font-semibold text-dark mb-3">{acc.bank}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-dark-600 text-sm">IBAN: {acc.iban}   {acc.bic}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(acc.iban.replace(/\s/g, ""));
                        setCopiedIban(acc.iban);
                        setTimeout(() => setCopiedIban(null), 2000);
                      }}
                      className="text-[#be9a63] hover:text-[#a07840] transition-colors"
                      title="Copy IBAN"
                    >
                      {copiedIban === acc.iban ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-dark-600 text-sm">MOTIF: Cadeau Marriage</p>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ───── RSVP ───── */}
      <section id="rsvp" className="bg-[#be9a63] py-20 px-4">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-script text-5xl md:text-6xl text-cream mb-1">{t[lang].rsvp}</h2>
            <p className="text-cream/80">{t[lang].rsvpSub}</p>
          </div>

          <Card className="rounded-2xl border border-gold-100 bg-[#f7f4ec] shadow-xl p-6 md:p-8">
            {rsvpSubmitted ? (
              <div className="text-center py-12">
                <h3 className="font-script text-4xl text-burgundy mb-3">{t[lang].thankYou}</h3>
                <p className="text-dark-600">{t[lang].rsvpReceived}</p>
              </div>
            ) : tableCheckOpen ? (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-gold-700 hover:bg-gold-50 -ml-2"
                  onClick={() => { setTableCheckOpen(false); setTableCheckName(""); setTableCheckResults([]); }}
                >
                  ← {lang === "en" ? "Back to RSVP" : "Subira Gusaba"}
                </Button>
                <h3 className="text-xl font-semibold text-dark">{t[lang].checkMyTable}</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder={t[lang].checkTablePlaceholder}
                    value={tableCheckName}
                    onChange={e => setTableCheckName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleTableSearch(tableCheckName); } }}
                    className="bg-white"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gold-300 text-gold-700 hover:bg-gold-50 shrink-0"
                    onClick={() => handleTableSearch(tableCheckName)}
                    disabled={tableCheckFetching}
                  >
                    {tableCheckFetching ? t[lang].checkTableSearching : t[lang].checkTableSearch}
                  </Button>
                </div>

                {!tableCheckFetching && (
                  tableCheckResults.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {tableCheckResults.map((booking: any) => {
                        const tableNumber = booking.tableNumber;
                        return (
                          <div key={booking._id} className="flex items-center justify-between bg-gold-50 border border-gold-200 rounded-xl px-5 py-4">
                            <span className="font-medium text-dark">{booking.guestName}</span>
                            <span className="text-xl font-bold text-gold-700">
                              {lang === "en" ? "Table" : "Ameza"} {tableNumber}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center pt-2">{t[lang].checkTableNotFound}</p>
                  )
                )}
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-6">
                <div>
                  <p className="text-lg font-semibold text-dark mb-3">{t[lang].attending}</p>
                  <RadioGroup
                    value={rsvp.attending}
                    onValueChange={v => setRsvp(prev => ({ ...prev, attending: v as "yes" | "no", tableId: v === "yes" ? prev.tableId : "" }))}
                    className="gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="att-y" />
                      <Label htmlFor="att-y" className="text-dark-600">{t[lang].yesAttending}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="att-n" />
                      <Label htmlFor="att-n" className="text-dark-600">{t[lang].noAttending}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {rsvp.attending === "yes" && (
                  <>
                    <div>
                      <p className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gold-500" /> {t[lang].howManyGuests}
                      </p>
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" className="h-9 w-9 p-0" onClick={() => updateGuests(-1)} disabled={rsvp.numberOfGuests <= 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-xl font-semibold text-dark">{rsvp.numberOfGuests}</span>
                        <Button type="button" variant="outline" className="h-9 w-9 p-0" onClick={() => updateGuests(1)} disabled={rsvp.numberOfGuests >= 10}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                  <p className="text-lg font-semibold text-dark mb-3">{t[lang].childrenAttending}</p>
                  <RadioGroup value={rsvp.childrenAttending} onValueChange={v => setRsvp(prev => ({ ...prev, childrenAttending: v as "yes" | "no" }))} className="gap-2">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="ch-y" /><Label htmlFor="ch-y" className="text-dark-600">{t[lang].yes}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="ch-n" /><Label htmlFor="ch-n" className="text-dark-600">{t[lang].no}</Label>
                    </div>
                  </RadioGroup>
                  {rsvp.childrenAttending === "yes" && (
                    <div className="mt-3 flex items-center gap-3">
                      <Label className="text-sm text-dark-600 whitespace-nowrap">Number of children:</Label>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setRsvp(prev => ({ ...prev, numberOfChildren: Math.max(1, prev.numberOfChildren - 1) }))} className="w-7 h-7 rounded-full border border-gold-300 flex items-center justify-center text-dark hover:bg-gold-100"><Minus size={12} /></button>
                        <span className="w-6 text-center font-semibold text-dark">{rsvp.numberOfChildren}</span>
                        <button type="button" onClick={() => setRsvp(prev => ({ ...prev, numberOfChildren: prev.numberOfChildren + 1 }))} className="w-7 h-7 rounded-full border border-gold-300 flex items-center justify-center text-dark hover:bg-gold-100"><Plus size={12} /></button>
                      </div>
                    </div>
                  )}
                </div>

                    <div>
                      <Label className="text-lg font-semibold text-dark mb-2 block">{t[lang].selectTable}</Label>
                      <Select value={rsvp.tableId} onValueChange={v => setRsvp(prev => ({ ...prev, tableId: v }))}>
                        <SelectTrigger className="w-full mt-1 bg-white">
                          <SelectValue placeholder={tablesLoading ? t[lang].loading : t[lang].chooseTable} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTables.map(tbl => (
                            <SelectItem key={tbl.tableId} value={tbl.tableId}>
                              {lang === "en"
                                ? `Table ${tbl.tableNumber} — ${tbl.availableSeats} seats left`
                                : `Ameza ya ${tbl.tableNumber} — ${t.rw.seatsLeft} ${tbl.availableSeats}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!tablesLoading && availableTables.length === 0 && (
                        <p className="text-sm text-destructive mt-2">{t[lang].noSeats.replace("{n}", String(rsvp.numberOfGuests))}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="bg-white/60 rounded-xl border border-gold-100 p-5 space-y-4">
                  <p className="font-semibold text-dark">{t[lang].person1}</p>
                  <Input placeholder={t[lang].fullName} value={rsvp.guestName} onChange={e => setRsvp(prev => ({ ...prev, guestName: e.target.value }))} className="bg-white" required={rsvp.attending === "yes"} />
                  <Input type="email" placeholder={t[lang].emailAddress} value={rsvp.guestEmail} onChange={e => setRsvp(prev => ({ ...prev, guestEmail: e.target.value }))} className="bg-white" required={rsvp.attending === "yes"} />
                  <div>
                    <Label className="text-dark-600 text-sm">{t[lang].dietary}</Label>
                    <Input type="tel" placeholder={t[lang].dietaryPlaceholder} value={rsvp.guestPhone} onChange={e => setRsvp(prev => ({ ...prev, guestPhone: e.target.value }))} className="bg-white mt-1" />
                  </div>
                </div>

            
                <div>
                  <Label className="text-lg font-semibold text-dark mb-2 block">{t[lang].messageCouple}</Label>
                  <Textarea value={rsvp.message} onChange={e => setRsvp(prev => ({ ...prev, message: e.target.value }))} placeholder={t[lang].messagePlaceholder} className="bg-white" rows={3} />
                </div>

                <Button type="submit" className="w-full bg-gold-600 hover:bg-gold-700 text-white" disabled={bookingPending}>
                  <SendHorizontal className="h-4 w-4 mr-2" />
                  {bookingPending ? t[lang].sending : t[lang].sendRsvp}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gold-300 text-gold-700 hover:bg-gold-50"
                  onClick={() => { setTableCheckOpen(true); setTableCheckName(""); setTableCheckResults([]); }}
                >
                  {t[lang].checkMyTable}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="bg-gradient-to-r from-burgundy-50 to-gold-50 py-20 px-4">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="font-script text-5xl md:text-6xl text-burgundy mb-4">
            {lang === "en" ? "Ready to Celebrate With Us?" : "Witeguye Gusangira Natwe?"}
          </h2>
          <p className="text-dark-600 text-lg mb-8 max-w-xl mx-auto">
            {lang === "en"
              ? "Reserve your table now and be part of this special celebration"
              : "Tegura umwanya wawe kuri uru rubanza rudasanzwe"}
          </p>
          <a href="#rsvp">
            <Button className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-lg text-lg transition-all hover:shadow-lg">
              {lang === "en" ? "RSVP Now" : "Emeza Aha"}
            </Button>
          </a>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="bg-dark text-cream py-12 px-4">
        <div className="container text-center">
          <p className="text-lg mb-1">Anaclet Nsabimana &amp; Ingabire Claudine</p>
          <p className="text-cream-600 text-sm">© 2026 Crox Events</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .animate-fade-in { animation: fadeIn 1s ease-out; }
      `}</style>
    </div>
  );
}
