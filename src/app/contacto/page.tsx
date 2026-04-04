export default function ContactoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-[#3d464d] mb-2">Contacto</h1>
      <p className="text-[#6c757d] mb-10">
        Completa el formulario y te respondemos a la brevedad.
      </p>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#3d464d] mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                className="w-full border border-[#ced4da] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/25 transition"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3d464d] mb-1.5">
                Empresa
              </label>
              <input
                type="text"
                className="w-full border border-[#ced4da] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/25 transition"
                placeholder="Nombre de tu empresa"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3d464d] mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full border border-[#ced4da] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/25 transition"
              placeholder="correo@empresa.cl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3d464d] mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full border border-[#ced4da] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/25 transition"
              placeholder="+56 9 ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3d464d] mb-1.5">
              Mensaje
            </label>
            <textarea
              rows={5}
              className="w-full border border-[#ced4da] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/25 transition resize-none"
              placeholder="¿En qué te podemos ayudar?"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold py-3 rounded-lg transition-colors"
          >
            Enviar mensaje
          </button>
        </form>
      </div>

      {/* Contact info */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: "📍", label: "Ubicación", value: "Región del Biobío, Chile" },
          { icon: "✉️", label: "Email", value: "contacto@yellowbox.cl" },
          { icon: "📞", label: "Teléfono", value: "+56 9 1234 5678" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm">
            <span className="text-2xl block mb-2">{item.icon}</span>
            <p className="text-xs text-[#6c757d] uppercase tracking-wide font-medium mb-1">
              {item.label}
            </p>
            <p className="text-sm text-[#3d464d] font-medium">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
