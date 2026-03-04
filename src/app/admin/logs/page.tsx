import { prisma } from "@/lib/prisma";
import { AlertTriangle, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

async function clearOldLogs() {
  "use server";
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await prisma.errorLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  revalidatePath("/admin/logs");
}

export default async function AdminLogsPage() {
  const logs = await prisma.errorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(212,175,55,0.1)" }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: "#D4AF37" }} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold" style={{ color: "#F5F5F5" }}>
              Logs de Erro
            </h1>
            <p className="text-sm" style={{ color: "rgba(200,187,168,0.6)" }}>
              Últimos {logs.length} erros registrados
            </p>
          </div>
        </div>

        <form action={clearOldLogs}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              border: "1px solid rgba(212,175,55,0.2)",
              color: "rgba(200,187,168,0.7)",
              backgroundColor: "rgba(212,175,55,0.05)",
            }}
          >
            <Trash2 className="h-4 w-4" />
            Limpar &gt;7 dias
          </button>
        </form>
      </div>

      {logs.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(212,175,55,0.1)",
          }}
        >
          <p style={{ color: "rgba(200,187,168,0.5)" }}>
            Nenhum erro registrado. Ótimo sinal! ✓
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(212,175,55,0.15)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "rgba(212,175,55,0.08)" }}>
                <th
                  className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase"
                  style={{ color: "rgba(212,175,55,0.8)" }}
                >
                  Data
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase"
                  style={{ color: "rgba(212,175,55,0.8)" }}
                >
                  Digest
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase"
                  style={{ color: "rgba(212,175,55,0.8)" }}
                >
                  Mensagem
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold tracking-wider text-xs uppercase"
                  style={{ color: "rgba(212,175,55,0.8)" }}
                >
                  Path
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  style={{
                    backgroundColor:
                      i % 2 === 0
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.01)",
                    borderTop: "1px solid rgba(212,175,55,0.06)",
                  }}
                >
                  <td
                    className="px-4 py-3 font-mono whitespace-nowrap"
                    style={{ color: "rgba(200,187,168,0.5)", fontSize: "0.75rem" }}
                  >
                    {log.createdAt.toLocaleString("pt-BR")}
                  </td>
                  <td
                    className="px-4 py-3 font-mono"
                    style={{ color: "#D4AF37", fontSize: "0.75rem" }}
                  >
                    {log.digest ?? "—"}
                  </td>
                  <td
                    className="px-4 py-3 max-w-sm truncate"
                    style={{ color: "#F5F5F5" }}
                    title={log.message}
                  >
                    {log.message}
                  </td>
                  <td
                    className="px-4 py-3 font-mono"
                    style={{ color: "rgba(200,187,168,0.6)", fontSize: "0.75rem" }}
                  >
                    {log.path ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
