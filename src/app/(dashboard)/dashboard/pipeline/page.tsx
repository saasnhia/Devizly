import { KanbanBoard } from "@/components/pipeline/kanban-board";

export const metadata = {
  title: "Pipeline CRM — Worthifast",
};

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos prospects et devis par étape.
        </p>
      </div>

      <KanbanBoard />
    </div>
  );
}
