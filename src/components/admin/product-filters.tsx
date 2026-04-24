"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Category { id: string; name: string; }

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const update = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v); else params.delete(k);
    }
    params.delete("page");
    router.replace(`/admin/produtos?${params.toString()}`);
  }, [sp, router]);

  return (
    <div className="flex gap-3 mb-5 flex-wrap items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
          update({ q });
        }}
        className="flex gap-2"
      >
        <input
          name="q"
          defaultValue={sp.get("q") ?? ""}
          placeholder="Buscar por nome..."
          className="border px-3 py-1.5 text-sm outline-none bg-white w-52"
          style={{ borderColor: "rgba(13,11,11,0.2)" }}
        />
        <button type="submit" className="px-3 py-1.5 text-[10px] tracking-widest uppercase text-white flex-shrink-0" style={{ backgroundColor: "#0D0B0B" }}>
          Buscar
        </button>
      </form>
      <select
        value={sp.get("cat") ?? ""}
        onChange={(e) => update({ cat: e.target.value })}
        className="border px-3 py-1.5 text-sm outline-none bg-white"
        style={{ borderColor: "rgba(13,11,11,0.2)" }}
      >
        <option value="">Todas as categorias</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select
        value={sp.get("status") ?? ""}
        onChange={(e) => update({ status: e.target.value })}
        className="border px-3 py-1.5 text-sm outline-none bg-white"
        style={{ borderColor: "rgba(13,11,11,0.2)" }}
      >
        <option value="">Todos</option>
        <option value="ativo">Ativos</option>
        <option value="inativo">Inativos</option>
      </select>
    </div>
  );
}
