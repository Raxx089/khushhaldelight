import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import type { Product } from "../data/products";

type BarType = "single" | "message" | "blocks";
type Inclusion = "almonds" | "hazelnuts" | "pistachio";

const barTypes: { id: BarType; label: string; detail: string; price: number }[] = [
  { id: "single", label: "Single Name Bar", detail: "Up to 8 characters", price: 399 },
  { id: "message", label: "Message Slab", detail: "Up to 2 lines · 20 characters", price: 599 },
  { id: "blocks", label: "Alphabet Letter Blocks", detail: "4–12 blocks · first 4 included", price: 799 },
];

const flavors = [
  { id: "dark55", label: "Rich Dark", detail: "55% Pure Cocoa", color: "#42231c" },
  { id: "dark70", label: "Intense Dark", detail: "70% Cocoa", color: "#241613" },
  { id: "milk", label: "Creamy Milk", detail: "Smooth & mellow", color: "#9b6542" },
  { id: "white", label: "White Vanilla Bean", detail: "Delicately sweet", color: "#e8d8bd" },
];

const inclusionOptions: { id: Inclusion; label: string; price: number }[] = [
  { id: "almonds", label: "Roasted California Almonds", price: 40 },
  { id: "hazelnuts", label: "Roasted Hazelnuts", price: 60 },
  { id: "pistachio", label: "Roasted Pistachio & Sea Salt", price: 60 },
];

const giftBoxes = [
  { id: "classic", label: "Classic Khushhal Matte Black & Gold Box", price: 0 },
  { id: "festive", label: "Festive Red Keepsake Magnetic Box", price: 99 },
  { id: "wooden", label: "Rustic Wooden Box", price: 149 },
];

const finishes = [
  { id: "gold", label: "Edible Gold Dust Finish" },
  { id: "silver", label: "Edible Silver Shimmer" },
  { id: "natural", label: "Natural Embossed (No Color)" },
];

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1592290321458-49b80f943a26?auto=format&fit=crop&w=1400&q=90",
    alt: "Artisanal dark chocolate bar, ready for custom gold lettering",
    caption: "Your words, cast in chocolate",
  },
  {
    src: "https://images.unsplash.com/photo-1613669146965-507d0e72a688?auto=format&fit=crop&w=1400&q=90",
    alt: "Close-up of the smooth, glossy texture of dark chocolate",
    caption: "Tempered for a clean, satisfying snap",
  },
  {
    src: "https://images.unsplash.com/photo-1548741487-18d363dc4469?auto=format&fit=crop&w=1400&q=90",
    alt: "Chocolate selection arranged in premium gift packaging",
    caption: "Ribbon-tied, cushioned and insulated for delivery",
  },
];

function localDateAfterHours(hours: number) {
  const date = new Date(Date.now() + hours * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function CustomNameBar() {
  const { dispatch } = useCart();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [barType, setBarType] = useState<BarType>("single");
  const [text, setText] = useState("");
  const [flavor, setFlavor] = useState("dark55");
  const [inclusions, setInclusions] = useState<Inclusion[]>([]);
  const [plain, setPlain] = useState(false);
  const [finish, setFinish] = useState("gold");
  const [giftBox, setGiftBox] = useState("classic");
  const [giftNote, setGiftNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);

  const selectedBar = barTypes.find((option) => option.id === barType)!;
  const selectedFlavor = flavors.find((option) => option.id === flavor)!;
  const selectedFinish = finishes.find((option) => option.id === finish)!;
  const selectedBox = giftBoxes.find((option) => option.id === giftBox)!;
  const characterLimit = barType === "single" ? 8 : barType === "message" ? 20 : 12;
  const minCharacters = barType === "blocks" ? 4 : 1;
  const lineCount = text.split("\n").length;
  const validText = text.length >= minCharacters
    && text.length <= characterLimit
    && (barType !== "message" || lineCount <= 2)
    && (barType !== "blocks" || /^[\p{L}&♥]{4,12}$/u.test(text));
  const minDeliveryDate = useMemo(() => localDateAfterHours(48), []);
  const inclusionsPrice = inclusions.reduce(
    (total, id) => total + inclusionOptions.find((option) => option.id === id)!.price,
    0,
  );
  const extraBlockPrice = barType === "blocks" ? Math.max(0, text.length - 4) * 50 : 0;
  const totalPrice = selectedBar.price + extraBlockPrice + inclusionsPrice + selectedBox.price;

  const toggleInclusion = (id: Inclusion) => {
    setPlain(false);
    setInclusions((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id]);
  };

  const setSelectedBarType = (type: BarType) => {
    setBarType(type);
    const limit = type === "single" ? 8 : type === "message" ? 20 : 12;
    setText((current) => current.slice(0, limit));
  };

  const validateForm = () => {
    const form = formRef.current;
    if (!form) return false;
    if (!validText) {
      toast.error(barType === "blocks"
        ? "Enter 4–12 letters or symbols for the gift box."
        : barType === "message"
          ? "Keep your message to 20 characters and no more than 2 lines."
          : "Enter a name of up to 8 characters.");
      return false;
    }
    return form.reportValidity();
  };

  const getCustomProduct = (): Product => {
    const customization = {
      barType: selectedBar.label,
      text,
      flavor: selectedFlavor.label,
      inclusions: plain ? ["Plain / Smooth"] : inclusions.map(
        (id) => inclusionOptions.find((option) => option.id === id)!.label,
      ),
      finish: selectedFinish.label,
      giftBox: selectedBox.label,
      giftNote: giftNote.trim() || "None",
      deliveryDate,
    };
    const customizations = [
      { label: "Bar type", value: customization.barType },
      { label: "Text", value: customization.text },
      { label: "Chocolate", value: customization.flavor },
      { label: "Inclusions", value: customization.inclusions.join(", ") || "Plain / Smooth" },
      { label: "Finish", value: customization.finish },
      { label: "Gift box", value: customization.giftBox },
      ...(giftNote.trim() ? [{ label: "Gift note", value: giftNote.trim() }] : []),
      { label: "Delivery date", value: customization.deliveryDate },
    ];
    const name = barType === "blocks"
      ? `Alphabet Letter Blocks — ${text}`
      : barType === "message"
        ? `Custom Message Slab — ${text.replace(/\n/g, " / ")}`
        : `Custom Name Bar — ${text}`;

    return {
      id: `custom-name-bar-${encodeURIComponent(JSON.stringify(customization))}`,
      name,
      subtitle: `${selectedFlavor.label} · ${selectedFinish.label} · ${selectedBox.label}`,
      price: totalPrice,
      image: gallery[0].src,
      images: gallery.map((image) => image.src),
      category: "Custom Chocolates",
      flavor: selectedFlavor.label,
      weight: barType === "blocks" ? `${text.length} blocks` : "100g",
      rating: 5,
      reviewCount: 0,
      description: customizations.map((item) => `${item.label}: ${item.value}`).join("\n"),
      ingredients: "Chocolate made with pure cocoa butter. Inclusion and allergen details are confirmed with your order.",
      allergens: "May contain milk and tree nuts. Please contact us about allergen requirements.",
      inStock: true,
      stockCount: 100,
      tags: ["custom", "personalised", "made-to-order"],
      customizations,
    };
  };

  const addToCart = () => {
    if (!validateForm()) return false;
    dispatch({ type: "ADD_ITEM", product: getCustomProduct() });
    toast.success("Your custom chocolate is in the cart.", {
      description: `${formatPrice(totalPrice)} · Delivery requested for ${deliveryDate}`,
    });
    return true;
  };

  const orderViaWhatsApp = () => {
    if (!validateForm()) return;
    const inclusionsText = plain
      ? "Plain / Smooth"
      : inclusions.length
        ? inclusions.map((id) => inclusionOptions.find((option) => option.id === id)!.label).join(", ")
        : "None selected";
    const orderMessage = [
      "Hello Khushhal Delight! I'd like to order a custom chocolate:",
      `Bar type: ${selectedBar.label}`,
      `Text (case-sensitive): ${text}`,
      `Chocolate: ${selectedFlavor.label} (${selectedFlavor.detail})`,
      `Inclusions: ${inclusionsText}`,
      `Finish: ${selectedFinish.label}`,
      `Gift box: ${selectedBox.label}`,
      `Gift note: ${giftNote.trim() || "None"}`,
      `Required delivery date: ${deliveryDate}`,
      `Estimated total: ${formatPrice(totalPrice)}`,
      "Please confirm availability and delivery details.",
    ].join("\n");
    window.open(`https://wa.me/918796729435?text=${encodeURIComponent(orderMessage)}`, "_blank", "noopener,noreferrer");
  };

  const buyNow = () => {
    if (!validateForm()) return;
    dispatch({ type: "ADD_ITEM", product: getCustomProduct() });
    dispatch({ type: "CLOSE_CART" });
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[var(--muted-foreground)]">
          <a href="/" className="hover:text-[var(--choco-800)]">Home</a>
          <span className="mx-2">/</span>
          <a href="/shop" className="hover:text-[var(--choco-800)]">Shop</a>
          <span className="mx-2">/</span>
          <span className="text-[var(--choco-800)]">Custom Name Bar</span>
        </nav>

        <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-14">
          <section aria-label="Custom chocolate gallery" className="lg:sticky lg:top-24">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-[#2b1912] shadow-xl">
              <img
                src={gallery[galleryIndex].src}
                alt={gallery[galleryIndex].alt}
                className="h-full w-full object-cover"
              />
              {galleryIndex === 0 && (
                <div className="absolute inset-x-5 bottom-5 rounded-xl border border-[#d6b455]/50 bg-[#24140f]/80 px-4 py-3 text-center backdrop-blur-sm">
                  <p className="mb-1 text-[9px] uppercase tracking-[0.3em] text-[#e7d4a0]">A little preview</p>
                  <p className="break-words font-serif text-2xl text-[#eed277] sm:text-3xl">
                    {text || "Your name"}
                  </p>
                </div>
              )}
              <button
                type="button"
                aria-label="Previous product image"
                onClick={() => setGalleryIndex((index) => (index + gallery.length - 1) % gallery.length)}
                className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--choco-900)] shadow"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next product image"
                onClick={() => setGalleryIndex((index) => (index + 1) % gallery.length)}
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--choco-900)] shadow"
              >
                <ChevronRight size={18} />
              </button>
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--choco-800)]">
                Made to order
              </span>
            </div>
            <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">{gallery[galleryIndex].caption}</p>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button
                  type="button"
                  key={image.src}
                  aria-label={`View image ${index + 1}: ${image.caption}`}
                  aria-pressed={galleryIndex === index}
                  onClick={() => setGalleryIndex(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors sm:h-20 sm:w-24 ${
                    galleryIndex === index ? "border-[var(--gold-500)]" : "border-transparent"
                  }`}
                >
                  <img src={image.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {["Food-grade inner foil", "Satin ribbon", "Insulated thermo-pack"].map((item) => (
                <div key={item} className="rounded-xl border border-[var(--border)] bg-white px-2 py-3 text-[10px] font-medium text-[var(--choco-700)] sm:text-xs">
                  <Check size={14} className="mx-auto mb-1 text-[var(--gold-600)]" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-6">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gold-600)]">
                <Sparkles size={14} /> Personalised, just for them
              </p>
              <h1 className="text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.45rem)", fontWeight: 700 }}>
                Make it meaningfully theirs.
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Choose every detail. We temper, cast and finish your chocolate to order.
              </p>
            </div>

            <form ref={formRef} onSubmit={(event) => { event.preventDefault(); addToCart(); }} className="space-y-7">
              <fieldset>
                <legend className="mb-1 text-sm font-semibold text-[var(--choco-800)]">1. Select Bar Type</legend>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">Choose single name bar or multi-letter box.</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {barTypes.map((option) => (
                    <label
                      key={option.id}
                      className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                        barType === option.id ? "border-[var(--gold-500)] bg-[var(--gold-100)]" : "border-[var(--border)] bg-white hover:border-[var(--gold-400)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="barType"
                        value={option.id}
                        checked={barType === option.id}
                        onChange={() => setSelectedBarType(option.id)}
                        className="sr-only"
                      />
                      <span className="block text-xs font-semibold text-[var(--choco-800)]">{option.label}</span>
                      <span className="mt-1 block text-[10px] text-[var(--muted-foreground)]">{option.detail}</span>
                      <span className="mt-2 block text-xs font-semibold text-[var(--gold-600)]">From {formatPrice(option.price)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="bar-text" className="mb-1 block text-sm font-semibold text-[var(--choco-800)]">2. Enter Name / Text</label>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">Type exactly as you want it cast (case-sensitive). Special characters allowed: &amp;, ♥.</p>
                {barType === "message" ? (
                  <textarea
                    id="bar-text"
                    required
                    rows={2}
                    maxLength={20}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    aria-describedby="bar-text-count"
                    placeholder={"Happy\nBirthday"}
                    className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                  />
                ) : (
                  <input
                    id="bar-text"
                    required
                    type="text"
                    maxLength={characterLimit}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    aria-describedby="bar-text-count"
                    placeholder={barType === "blocks" ? "e.g. AARAV" : "e.g. Aanya"}
                    pattern={barType === "blocks" ? "[A-Za-z&♥]{4,12}" : undefined}
                    title={barType === "blocks" ? "Enter 4 to 12 letters, ampersands or hearts, without spaces." : undefined}
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                  />
                )}
                <div id="bar-text-count" className="mt-1 flex justify-between text-[10px] text-[var(--muted-foreground)]">
                  <span>{barType === "blocks" ? "First 4 blocks included; +₹50 per extra block. Use letters, & or ♥ (no spaces)." : barType === "message" ? "Maximum 2 lines." : "Maximum 8 characters."}</span>
                  <span>{text.length}/{characterLimit}</span>
                </div>
                {!validText && text.length > 0 && <p className="mt-1 text-xs text-red-600" role="status">Please check the text length and format above.</p>}
              </div>

              <fieldset>
                <legend className="mb-1 text-sm font-semibold text-[var(--choco-800)]">3. Chocolate Base Flavor</legend>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">100% vegetarian &amp; made with pure cocoa butter.</p>
                <div className="grid grid-cols-2 gap-2">
                  {flavors.map((option) => (
                    <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 ${flavor === option.id ? "border-[var(--gold-500)] ring-1 ring-[var(--gold-500)]" : "border-[var(--border)]"}`}>
                      <input type="radio" name="flavor" value={option.id} checked={flavor === option.id} onChange={() => setFlavor(option.id)} className="sr-only" />
                      <span className="h-8 w-8 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: option.color }} />
                      <span>
                        <span className="block text-xs font-semibold text-[var(--choco-800)]">{option.label}</span>
                        <span className="block text-[10px] text-[var(--muted-foreground)]">{option.detail}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1 text-sm font-semibold text-[var(--choco-800)]">4. Crunch &amp; Inclusions</legend>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">Finely roasted nuts blended into the base slab.</p>
                <div className="space-y-2 rounded-xl border border-[var(--border)] bg-white p-3">
                  {inclusionOptions.map((option) => (
                    <label key={option.id} className="flex cursor-pointer items-center gap-3 py-1 text-xs text-[var(--choco-800)]">
                      <input type="checkbox" checked={inclusions.includes(option.id)} onChange={() => toggleInclusion(option.id)} disabled={plain} className="h-4 w-4 accent-[var(--gold-500)]" />
                      <span className="flex-1">{option.label}</span>
                      <span className="font-medium">+{formatPrice(option.price)}</span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--choco-800)]">
                    <input type="checkbox" checked={plain} onChange={(event) => { setPlain(event.target.checked); if (event.target.checked) setInclusions([]); }} className="h-4 w-4 accent-[var(--gold-500)]" />
                    <span>Plain / Smooth (No Inclusions)</span>
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-[var(--choco-800)]">5. Foil / Lettering Finish</legend>
                <div className="space-y-2">
                  {finishes.map((option) => (
                    <label key={option.id} className="flex cursor-pointer items-center gap-3 text-xs text-[var(--choco-800)]">
                      <input type="radio" name="finish" value={option.id} checked={finish === option.id} onChange={() => setFinish(option.id)} className="h-4 w-4 accent-[var(--gold-500)]" />
                      {option.label}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">Safe, food-grade edible shimmer accents.</p>
              </fieldset>

              <fieldset>
                <legend className="mb-1 text-sm font-semibold text-[var(--choco-800)]">6. Gift Box Style</legend>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">Includes secure inner cushioning and luxury satin ribbon.</p>
                <div className="grid gap-2">
                  {giftBoxes.map((option) => (
                    <label key={option.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white p-3 text-xs ${giftBox === option.id ? "border-[var(--gold-500)] ring-1 ring-[var(--gold-500)]" : "border-[var(--border)]"}`}>
                      <span className="flex items-center gap-3">
                        <input type="radio" name="giftBox" value={option.id} checked={giftBox === option.id} onChange={() => setGiftBox(option.id)} className="h-4 w-4 accent-[var(--gold-500)]" />
                        <span className="text-[var(--choco-800)]">{option.label}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-[var(--choco-700)]">{option.price === 0 ? "Included" : `+${formatPrice(option.price)}`}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="gift-note" className="mb-1 block text-sm font-semibold text-[var(--choco-800)]">7. Custom Gift Note <span className="font-normal text-[var(--muted-foreground)]">(Optional)</span></label>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">Printed on premium textured cardstock inside the box.</p>
                <textarea id="gift-note" rows={3} maxLength={150} value={giftNote} onChange={(event) => setGiftNote(event.target.value)} placeholder="Write a little something..." className="w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
                <p className="mt-1 text-right text-[10px] text-[var(--muted-foreground)]">{giftNote.length}/150</p>
              </div>

              <div>
                <label htmlFor="delivery-date" className="mb-1 block text-sm font-semibold text-[var(--choco-800)]">8. Required Delivery Date</label>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">Custom bars require 24–48 hours for tempering and curing. Choose a date at least 48 hours from now.</p>
                <input id="delivery-date" required type="date" min={minDeliveryDate} value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--choco-800)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
              </div>

              <div className="sticky bottom-0 z-10 -mx-4 border-t border-[var(--border)] bg-[var(--cream-50)]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Your custom chocolate</p>
                    <p className="mt-0.5 text-xs text-[var(--choco-800)]">{selectedBar.label} · {selectedFlavor.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-[var(--choco-900)]">{formatPrice(totalPrice)}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={orderViaWhatsApp} className="flex items-center justify-center gap-2 rounded-xl bg-[#1f6b46] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#18583a]">
                    <MessageCircle size={17} /> Order via WhatsApp
                  </button>
                  <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8d5a3] px-4 py-3.5 text-sm font-semibold text-[var(--choco-950)]">
                    <ShoppingBag size={17} /> Add to Cart
                  </button>
                </div>
                <button type="button" onClick={buyNow} className="mt-2 w-full py-2 text-xs font-semibold text-[var(--choco-700)] underline underline-offset-4 hover:text-[var(--gold-600)]">
                  Buy now with card or UPI
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
