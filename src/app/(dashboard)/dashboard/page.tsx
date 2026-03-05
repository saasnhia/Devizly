import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Send, CheckCircle, Euro, Plus } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils/quote";
import type { QuoteWithClient } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*, clients(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allQuotes = (quotes || []) as QuoteWithClient[];
  const recentQuotes = allQuotes.slice(0, 5);

  const totalQuotes = allQuotes.length;
  const sentQuotes = allQuotes.filter((q) => q.status === "envoyé").length;
  const signedQuotes = allQuotes.filter(
    (q) => q.status === "signé" || q.status === "accepté"
  ).length;
  const totalRevenue = allQuotes
    .filter((q) => q.status === "signé" || q.status === "accepté")
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  const stats = [
    { label: "Total devis", value: totalQuotes, icon: FileText, color: "text-blue-600" },
    { label: "Devis envoyés", value: sentQuotes, icon: Send, color: "text-amber-600" },
    { label: "Devis signés", value: signedQuotes, icon: CheckCircle, color: "text-green-600" },
    { label: "CA total", value: formatCurrency(totalRevenue), icon: Euro, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/devis/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg bg-slate-100 p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Devis récents</CardTitle>
        </CardHeader>
        <CardContent>
          {recentQuotes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto mb-2 h-10 w-10 opacity-50" />
              <p>Aucun devis pour le moment</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/devis/nouveau">Créer votre premier devis</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-sm">
                      DEV-{String(quote.number).padStart(4, "0")}
                    </TableCell>
                    <TableCell>
                      <Link href={`/devis/nouveau?edit=${quote.id}`} className="hover:underline">
                        {quote.title}
                      </Link>
                    </TableCell>
                    <TableCell>{quote.clients?.name || "—"}</TableCell>
                    <TableCell>{formatCurrency(Number(quote.total_ttc))}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(quote.status)}>
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(quote.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
