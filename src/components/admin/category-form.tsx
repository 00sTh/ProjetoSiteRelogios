"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/actions/admin";
import { MediaPickerInput } from "./media-picker-input";

interface CategoryOption {
  id: string;
  name: string;
}

interface CategoryFormData {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
}

interface CategoryFormProps {
  category?: CategoryFormData;
  allCategories: CategoryOption[];
}

export function CategoryForm({ category, allCategories }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const labelStyle = {
    color: "rgba(200,187,168,0.7)",
    fontSize: "0.75rem",
    fontWeight: 600 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  };

  const inputStyle = {
    backgroundColor: "#0F2E1E",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "0.75rem",
    color: "#F5F5F5",
    padding: "0.625rem 1rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, formData)
        : await createCategory(formData);

      if (!result.success) {
        setError(result.error ?? "Erro desconhecido");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/admin/categories"), 800);
      }
    });
  }

  // Filter out the current category from parent options to avoid self-reference
  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          Categoria salva! Redirecionando...
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nome *</label>
        <input
          name="name"
          defaultValue={category?.name}
          required
          style={inputStyle}
          placeholder="Ex: Hidratantes"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Slug (URL) *</label>
        <input
          name="slug"
          defaultValue={category?.slug}
          required
          pattern="[a-z0-9-]+"
          style={inputStyle}
          placeholder="hidratantes"
        />
        <p className="text-xs" style={{ color: "rgba(200,187,168,0.45)" }}>
          Apenas letras minúsculas, números e hífens. Ex: seruns-faciais
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Categoria pai (opcional)</label>
        <select
          name="parentId"
          defaultValue={category?.parentId ?? ""}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">— Sem categoria pai —</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Imagem da categoria</label>
        <MediaPickerInput
          name="imageUrl"
          defaultValue={category?.imageUrl}
          style={inputStyle}
          placeholder="https://... ou /uploads/..."
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wider transition-all duration-200 disabled:opacity-50"
          style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
        >
          {isPending ? "Salvando..." : category ? "Salvar alterações" : "Criar categoria"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl text-sm"
          style={{ color: "rgba(200,187,168,0.6)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
