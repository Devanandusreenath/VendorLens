import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, FlaskConical, Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { useMode } from "@/lib/mode";
import { saveDemoDraft } from "@/data/demoData";

export const Route = createFileRoute("/investigate")({
  head: () => ({
    meta: [
      { title: "New Investigation — VendorLens" },
      { name: "description", content: "Enter a supplier and the claims you want to verify against public evidence." },
      { property: "og:title", content: "New Investigation — VendorLens" },
      { property: "og:description", content: "Start a supplier due-diligence investigation." },
    ],
  }),
  component: InvestigatePage,
});

const schema = z.object({
  supplier_name: z.string().trim().min(2, "Enter the supplier or company name.").max(200),
  website: z
    .string()
    .trim()
    .max(300)
    .refine((v) => !v || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "Enter a full URL starting with http:// or https://"),
  category: z.string().trim().min(2, "Enter a product or service category.").max(120),
  region: z.string().trim().max(120),
  description: z.string().trim().max(2000),
  claims: z
    .array(z.object({ value: z.string().trim().max(500) }))
    .refine((a) => a.some((c) => c.value.length >= 3), "Add at least one claim to investigate."),
  additional_context: z.string().trim().max(3000),
  acknowledged: z.boolean().refine((v) => v, "Please confirm you understand how findings are produced."),
});
type FormValues = z.infer<typeof schema>;

const EXAMPLES = [
  "Holds a particular industry certification",
  "Offers a stated product specification",
  "Is an authorized distributor",
  "Provides a stated delivery timeline",
  "Has a publicly documented business history",
];

function FieldError({ msg }: { msg?: string | undefined }) {
  if (!msg) return null;
  return <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" />{msg}</p>;
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-6">
      <h2 className="flex items-center gap-3 text-base font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent font-mono text-xs text-accent-foreground">{n}</span>
        {title}
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function InvestigatePage() {
  const mode = useMode();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, control, handleSubmit, setValue, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { supplier_name: "", website: "", category: "", region: "", description: "", claims: [{ value: "" }], additional_context: "", acknowledged: false },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "claims" });
  const e = formState.errors;
  const ack = watch("acknowledged");

  const onSubmit = async (v: FormValues) => {
    setSubmitError(null);
    const payload = {
      supplier_name: v.supplier_name,
      website: v.website,
      category: v.category,
      region: v.region,
      description: v.description,
      claims: v.claims.map((c) => c.value).filter((c) => c.length >= 3),
      additional_context: v.additional_context,
    };
    try {
      if (mode === "demo") {
        const draft = saveDemoDraft(payload);
        toast.success("Saved in Demo Mode", { description: "No search was run. Connect the backend to investigate." });
        await qc.invalidateQueries({ queryKey: ["investigations"] });
        navigate({ to: "/investigations/$id", params: { id: draft.id } });
        return;
      }
      const { id } = await api.createInvestigation(payload);
      toast.success("Investigation submitted");
      await qc.invalidateQueries({ queryKey: ["investigations"] });
      navigate({ to: "/investigations/$id", params: { id } });
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  };

  return (
    <AppShell>
      <PageHeader title="New supplier investigation" description="Describe the supplier and list each claim separately. Each claim is assessed on its own." />
      {mode === "demo" && (
        <div className="mb-6 flex gap-3 rounded-lg border border-demo/25 bg-demo-soft p-4 text-sm">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-demo" />
          <p><strong>Demo Mode:</strong> submitting will save your entry locally to preview the report layout. No searches are performed and no findings are generated.</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Section n={1} title="Supplier details">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="supplier_name">Supplier or company name *</Label>
              <Input id="supplier_name" className="mt-1.5" aria-invalid={!!e.supplier_name} {...register("supplier_name")} />
              <FieldError msg={e.supplier_name?.message} />
            </div>
            <div>
              <Label htmlFor="website">Supplier website</Label>
              <Input id="website" className="mt-1.5" placeholder="https://" aria-invalid={!!e.website} {...register("website")} />
              <FieldError msg={e.website?.message} />
            </div>
            <div>
              <Label htmlFor="category">Product or service category *</Label>
              <Input id="category" className="mt-1.5" placeholder="e.g. Industrial components" aria-invalid={!!e.category} {...register("category")} />
              <FieldError msg={e.category?.message} />
            </div>
            <div>
              <Label htmlFor="region">Country or region</Label>
              <Input id="region" className="mt-1.5" {...register("region")} />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Product or service description</Label>
            <Textarea id="description" rows={3} className="mt-1.5" {...register("description")} />
          </div>
        </Section>

        <Section n={2} title="Claims to investigate">
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <Label htmlFor={`claim-${i}`} className="sr-only">Claim {i + 1}</Label>
                <Input id={`claim-${i}`} placeholder={EXAMPLES[i % EXAMPLES.length]} {...register(`claims.${i}.value` as const)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} disabled={fields.length === 1} aria-label={`Remove claim ${i + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <FieldError msg={e.claims?.root?.message ?? e.claims?.message} />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} disabled={fields.length >= 15}>
              <Plus className="h-4 w-4" /> Add claim
            </Button>
            <span className="text-xs text-muted-foreground">Examples:</span>
            {EXAMPLES.slice(0, 3).map((ex) => (
              <button key={ex} type="button" onClick={() => append({ value: ex })} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted">
                {ex}
              </button>
            ))}
          </div>
        </Section>

        <Section n={3} title="Additional context">
          <div>
            <Label htmlFor="additional_context">Anything else the analysis should consider</Label>
            <Textarea id="additional_context" rows={3} className="mt-1.5" placeholder="e.g. order size, required standards, deadlines" {...register("additional_context")} />
          </div>
          <div>
            <div className="flex items-start gap-3">
              <Checkbox id="ack" checked={ack} onCheckedChange={(c) => setValue("acknowledged", c === true, { shouldValidate: formState.isSubmitted })} aria-invalid={!!e.acknowledged} />
              <Label htmlFor="ack" className="text-sm font-normal leading-snug">
                I understand that findings are based on available public evidence, may be incomplete or outdated, and require human judgement.
              </Label>
            </div>
            <FieldError msg={e.acknowledged?.message} />
          </div>
        </Section>

        {submitError && (
          <div role="alert" className="rounded-lg border border-contradicted/25 bg-contradicted-soft p-4 text-sm">
            <p className="font-medium">The investigation could not be started.</p>
            <p className="mt-1 text-muted-foreground">{submitError}</p>
            <p className="mt-1 text-muted-foreground">You can retry, or switch to Demo Mode in Settings to preview the interface.</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={formState.isSubmitting}>
            {formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {formState.isSubmitting ? "Submitting…" : "Start Investigation"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
