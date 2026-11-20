-- Starter FAQ knowledge for the Chocolate Concierge (Gemini + Admin-editable).
-- Keep answers conservative; prices and stock stay catalog-driven at runtime.
-- Skip seeding when FAQs already exist so admin edits are not duplicated on re-run.

insert into public.chat_faqs (question, answer, active)
select seed.question, seed.answer, true
from (
  values
    (
      'How long does shipping take?',
      'Delivery timing depends on your PIN code and the courier options available at checkout. After payment (or COD confirmation), we arrange dispatch through our shipping partner. You will receive tracking details once a shipment is booked. For urgent dates, message us on WhatsApp with your city and preferred delivery day.'
    ),
    (
      'Do your chocolates contain dairy, nuts, or other allergens?',
      'Many Khushhal Delight products may contain or be processed around dairy, nuts, or other allergens. Always check the product page ingredients and allergen notes before ordering. If you have a severe allergy, please confirm directly with our team on WhatsApp before you buy—catalog text can change and cross-contamination is possible in shared kitchens.'
    ),
    (
      'Do you offer corporate or bulk gifting?',
      'Yes. We support corporate gifting, bulk orders, and branded gift presentations. Share your quantity, budget, occasion, and delivery city via WhatsApp or the Corporate page, and our team will help with assortments and timelines. Large orders may need extra lead time.'
    ),
    (
      'Can I personalize chocolates or order a custom name bar?',
      'Yes—custom name bars and personalization options are available through our Custom Name Bar builder on the website when that product is active. Spellings are taken from what you enter at checkout, so double-check names before paying. For special packaging or large personalized runs, contact us on WhatsApp.'
    ),
    (
      'How should I store the chocolates?',
      'Keep chocolates in a cool, dry place away from direct sunlight and strong odours. Ideal storage is around room temperature in a sealed container; avoid refrigerating unless your climate is very hot, and if you do chill them, let sealed packs return to room temperature before opening to reduce condensation.'
    ),
    (
      'What is the shelf life?',
      'Shelf life varies by product. Check the product packaging and listing for best-before guidance. For the freshest experience, enjoy soon after delivery and store as recommended. If a listing does not show a date, ask our team before ordering large quantities.'
    ),
    (
      'What if my order arrives damaged?',
      'Please contact us promptly with your order number (KD-...) and clear photos of the packaging and product. Our support team will review the case and guide you on a replacement or other resolution where appropriate. Do not discard packaging until we have reviewed the claim.'
    ),
    (
      'What payment methods do you accept?',
      'Checkout supports the payment methods enabled on our Razorpay checkout (cards, UPI, and other methods shown at payment time). Cash on Delivery is offered only when the courier and PIN code support COD at checkout. Coupons must be applied before payment; the final amount is always recalculated on the server.'
    ),
    (
      'How can I track my order?',
      'After your shipment is booked you can track it from the Tracking page on our website using your order details, or ask our WhatsApp assistant with your KD-... order number from the same phone used at checkout. Tracking appears only after an AWB is assigned by the courier.'
    ),
    (
      'Can I talk to a human instead of the AI assistant?',
      'Yes. Tap “Prefer a person? Request human support” in the chat, or say you want a human agent. You can also message us directly on WhatsApp for immediate help with orders, allergies, or corporate requests.'
    )
) as seed(question, answer)
where not exists (select 1 from public.chat_faqs limit 1);
