import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUsers } from "@/actions/users";
import { formatPrice } from "@/lib/utils";
import { Users, Search, ShoppingBag } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Usuários" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await getAdminUsers(q);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F0E6" }}>
            Usuários
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
            {users.length} cliente{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl max-w-sm"
          style={{
            backgroundColor: "#0F2E1E",
            border: "1px solid rgba(201,162,39,0.2)",
          }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: "rgba(201,162,39,0.5)" }} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome ou email..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(200,187,168,0.3)]"
            style={{ color: "#F5F0E6" }}
          />
        </div>
      </form>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(201,162,39,0.15)" }}
      >
        {users.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            style={{ backgroundColor: "#0A2419" }}
          >
            <Users className="h-10 w-10" style={{ color: "rgba(201,162,39,0.2)" }} />
            <p className="text-sm" style={{ color: "rgba(200,187,168,0.4)" }}>
              {q ? "Nenhum usuário encontrado para essa busca." : "Nenhum usuário cadastrado."}
            </p>
            {q && (
              <Link
                href="/admin/users"
                className="text-xs"
                style={{ color: "#C9A227" }}
              >
                Limpar busca
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.08)", backgroundColor: "#0F2E1E" }}>
                {["Nome / Email", "Pedidos", "Total gasto", "Cadastro", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase"
                    style={{ color: "rgba(200,187,168,0.4)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "#0A2419" }}>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-[rgba(201,162,39,0.03)]"
                  style={{ borderBottom: "1px solid rgba(201,162,39,0.06)" }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                          style={{ backgroundColor: "rgba(201,162,39,0.15)", color: "#C9A227" }}
                        >
                          {(user.firstName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#F5F0E6" }}>
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5" style={{ color: "rgba(201,162,39,0.5)" }} />
                      <span style={{ color: "#C8BBA8" }}>{user.orderCount}</span>
                      {user.paidOrderCount > 0 && (
                        <span className="text-xs" style={{ color: "rgba(200,187,168,0.4)" }}>
                          ({user.paidOrderCount} pago{user.paidOrderCount !== 1 ? "s" : ""})
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 font-semibold" style={{ color: "#C9A227" }}>
                    {user.totalSpent > 0 ? formatPrice(user.totalSpent) : "—"}
                  </td>

                  <td className="px-6 py-4 text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        backgroundColor: "rgba(201,162,39,0.08)",
                        color: "#C9A227",
                        border: "1px solid rgba(201,162,39,0.2)",
                      }}
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
