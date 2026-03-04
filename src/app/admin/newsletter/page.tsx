import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin — Newsletter" };

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
          Newsletter
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
          {subscribers.length} inscritos
        </p>
      </div>

      {/* Export hint */}
      <div
        className="rounded-xl p-4 mb-6 text-sm"
        style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", color: "#9A9A9A" }}
      >
        💡 Para exportar a lista, use o Prisma Studio:{" "}
        <code className="text-xs" style={{ color: "#D4AF37" }}>npx prisma studio</code>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(212,175,55,0.15)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                backgroundColor: "#0F2E1E",
                borderBottom: "1px solid rgba(212,175,55,0.1)",
              }}
            >
              {["E-mail", "Confirmado em", "Inscrito em"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold tracking-wider uppercase"
                  style={{ color: "rgba(200,187,168,0.4)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#0A2419" }}>
            {subscribers.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "rgba(200,187,168,0.4)" }}
                >
                  Nenhum inscrito ainda.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr
                  key={sub.id}
                  style={{ borderBottom: "1px solid rgba(212,175,55,0.06)" }}
                >
                  <td className="px-5 py-4 text-sm" style={{ color: "#F5F5F5" }}>
                    {sub.email}
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "rgba(200,187,168,0.6)" }}>
                    {sub.confirmedAt
                      ? new Date(sub.confirmedAt).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "rgba(200,187,168,0.6)" }}>
                    {new Date(sub.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
