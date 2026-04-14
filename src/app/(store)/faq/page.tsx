const faqItems = [
  {
    question: "¿Los precios incluyen IVA?",
    answer: "Sí. Todos los precios públicos del ecommerce se muestran en CLP con IVA incluido.",
  },
  {
    question: "¿El despacho está incluido?",
    answer: "No. El despacho se informa como “Por confirmar” y se coordina según comuna y cobertura.",
  },
  {
    question: "¿Puedo comprar sin crear cuenta?",
    answer: "Sí. El checkout permite compra como invitado.",
  },
];

export default function FaqPage() {
  return (
    <div className="page-shell py-10">
      <p className="section-kicker">FAQ</p>
      <h1 className="mt-3 text-4xl font-semibold">Preguntas frecuentes</h1>
      <div className="mt-8 grid gap-4">
        {faqItems.map((item) => (
          <article key={item.question} className="surface-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold">{item.question}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
