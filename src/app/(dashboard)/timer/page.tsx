"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Play,
  Square,
  Pause,
  Trash2,
  FileText,
  Timer as TimerIcon,
  Clock,
  Euro,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/quote";

interface Client {
  id: string;
  name: string;
}

interface Quote {
  id: string;
  title: string;
  number: number;
}

interface TimeEntry {
  id: string;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  hourly_rate: number | null;
  billed: boolean;
  client_id: string | null;
  quote_id: string | null;
  clients: { name: string } | null;
  quotes: { title: string; number: number } | null;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function TimerPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [hourlyRate, setHourlyRate] = useState("50");
  const startTimeRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedElapsedRef = useRef(0);

  // Bill modal
  const [billQuoteId, setBillQuoteId] = useState("");
  const [billRate, setBillRate] = useState("50");
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [billing, setBilling] = useState(false);
  const [billSuccess, setBillSuccess] = useState(false);

  const loadData = useCallback(async () => {
    const [entriesRes, clientsRes, quotesRes] = await Promise.all([
      fetch("/api/time-entries"),
      fetch("/api/clients"),
      fetch("/api/quotes"),
    ]);
    const [entriesData, clientsData, quotesData] = await Promise.all([
      entriesRes.json(),
      clientsRes.json(),
      quotesRes.json(),
    ]);
    setEntries(Array.isArray(entriesData) ? entriesData : []);
    setClients(Array.isArray(clientsData) ? clientsData : []);
    // Quotes API returns { data: [...] } — filter to brouillon only for billing target
    const allQuotes = quotesData?.data || quotesData || [];
    setQuotes(
      Array.isArray(allQuotes)
        ? allQuotes.filter((q: { status?: string }) => q.status === "brouillon")
        : []
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused]);

  async function handleStart() {
    startTimeRef.current = new Date().toISOString();
    setElapsed(0);
    pausedElapsedRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
  }

  function handlePause() {
    if (isPaused) {
      // Resume — adjust start time
      startTimeRef.current = new Date(
        Date.now() - pausedElapsedRef.current * 1000
      ).toISOString();
      setIsPaused(false);
    } else {
      pausedElapsedRef.current = elapsed;
      setIsPaused(true);
    }
  }

  async function handleStop() {
    if (!startTimeRef.current) return;
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const endedAt = new Date().toISOString();
    const durationMinutes = Math.round(elapsed / 60);

    await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: description || null,
        client_id: clientId && clientId !== "none" ? clientId : null,
        quote_id: quoteId && quoteId !== "none" ? quoteId : null,
        started_at: startTimeRef.current,
        ended_at: endedAt,
        duration_minutes: durationMinutes,
        hourly_rate: Number(hourlyRate) || null,
      }),
    });

    startTimeRef.current = null;
    setElapsed(0);
    setDescription("");
    await loadData();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/time-entries/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntries((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function toggleEntry(id: string) {
    setSelectedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBill() {
    if (!billQuoteId || selectedEntries.size === 0) return;
    setBilling(true);
    try {
      const res = await fetch("/api/time-entries/bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_ids: [...selectedEntries],
          quote_id: billQuoteId,
          hourly_rate: Number(billRate) || 50,
        }),
      });
      if (res.ok) {
        setBillSuccess(true);
        setSelectedEntries(new Set());
        await loadData();
        setTimeout(() => setBillSuccess(false), 3000);
      }
    } finally {
      setBilling(false);
    }
  }

  // Stats
  const unbilledEntries = entries.filter((e) => !e.billed && e.duration_minutes);
  const totalUnbilledMinutes = unbilledEntries.reduce(
    (sum, e) => sum + (e.duration_minutes || 0),
    0
  );
  const totalUnbilledRevenue = unbilledEntries.reduce(
    (sum, e) => sum + ((e.duration_minutes || 0) / 60) * (e.hourly_rate || 50),
    0
  );
  const totalBilledMinutes = entries
    .filter((e) => e.billed)
    .reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suivi du temps</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Non facture</p>
              <p className="text-2xl font-bold">{formatDuration(totalUnbilledMinutes)}</p>
              <p className="text-xs text-muted-foreground">
                {unbilledEntries.length} entree(s)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Euro className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenus potentiels</p>
              <p className="text-2xl font-bold">{formatCurrency(totalUnbilledRevenue)}</p>
              <p className="text-xs text-muted-foreground">a facturer</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deja facture</p>
              <p className="text-2xl font-bold">{formatDuration(totalBilledMinutes)}</p>
              <p className="text-xs text-muted-foreground">
                {entries.filter((e) => e.billed).length} entree(s)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimerIcon className="h-5 w-5" />
            Chronometre
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer display */}
          <div className="flex items-center justify-center gap-6">
            <span
              className={`font-mono text-5xl font-bold tabular-nums ${
                isRunning && !isPaused
                  ? "text-emerald-600"
                  : isPaused
                    ? "text-amber-600"
                    : "text-muted-foreground"
              }`}
            >
              {formatElapsed(elapsed)}
            </span>
          </div>

          {/* Timer controls */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Demarrer
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePause}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-5 w-5" />
                      Reprendre
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <Square className="h-5 w-5" />
                  Arreter
                </Button>
              </>
            )}
          </div>

          {/* Timer options */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="timer-desc">Description</Label>
              <Input
                id="timer-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Que faites-vous ?"
              />
            </div>
            <div>
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Devis</Label>
              <Select value={quoteId} onValueChange={setQuoteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {quotes.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      DEV-{String(q.number).padStart(4, "0")} — {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timer-rate">Taux horaire (EUR)</Label>
              <Input
                id="timer-rate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill section — C2 */}
      {unbilledEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facturer ces heures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Lignes ajoutees au devis avec succes !
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[200px]">
                <Label>Ajouter au devis</Label>
                <Select value={billQuoteId} onValueChange={setBillQuoteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un devis" />
                  </SelectTrigger>
                  <SelectContent>
                    {quotes.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        DEV-{String(q.number).padStart(4, "0")} — {q.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[140px]">
                <Label>Taux horaire (EUR)</Label>
                <Input
                  type="number"
                  value={billRate}
                  onChange={(e) => setBillRate(e.target.value)}
                  min={0}
                />
              </div>
              <Button
                onClick={handleBill}
                disabled={!billQuoteId || selectedEntries.size === 0 || billing}
              >
                {billing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Facturer {selectedEntries.size} entree(s)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time entries table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <TimerIcon className="mx-auto mb-2 h-10 w-10 opacity-50" />
              <p>Aucune entree de temps</p>
              <p className="mt-1 text-sm">
                Demarrez le chronometre pour commencer.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Description</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Devis</TableHead>
                  <TableHead className="text-right">Duree</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const amount =
                    ((entry.duration_minutes || 0) / 60) *
                    (entry.hourly_rate || 0);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {!entry.billed && entry.duration_minutes ? (
                          <input
                            type="checkbox"
                            checked={selectedEntries.has(entry.id)}
                            onChange={() => toggleEntry(entry.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entry.description || "—"}
                      </TableCell>
                      <TableCell>{entry.clients?.name || "—"}</TableCell>
                      <TableCell>
                        {entry.quotes
                          ? `DEV-${String(entry.quotes.number).padStart(4, "0")}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.duration_minutes
                          ? formatDuration(entry.duration_minutes)
                          : "En cours"}
                      </TableCell>
                      <TableCell className="text-right">
                        {amount > 0 ? formatCurrency(amount) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            entry.billed
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {entry.billed ? "Facture" : "Non facture"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
