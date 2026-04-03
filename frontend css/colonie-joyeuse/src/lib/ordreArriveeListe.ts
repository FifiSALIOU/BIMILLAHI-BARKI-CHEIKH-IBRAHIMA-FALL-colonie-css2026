/**
 * Règle unique pour l’affichage du « rang d’arrivée » (gestionnaire + parents) :
 * même logique que la colonne Rang de Gestion des listes — indépendante de `rang_dans_liste`.
 */
import type { Enfant } from '@/data/mockData';

export type OrdreArriveeInput = {
  id: string;
  demandeId?: number;
  dateInscription: string;
  updatedAt?: string | null;
  reinscrit?: boolean;
};

export function instantOrdreArrivee(row: OrdreArriveeInput): number {
  if (row.reinscrit && row.updatedAt) {
    const tu = new Date(row.updatedAt).getTime();
    if (!Number.isNaN(tu)) return tu;
  }
  const t = new Date(row.dateInscription).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function compareOrdreArrivee(a: OrdreArriveeInput, b: OrdreArriveeInput): number {
  const ia = instantOrdreArrivee(a);
  const ib = instantOrdreArrivee(b);
  if (ia !== ib) return ia - ib;
  const da = a.demandeId ?? Number.parseInt(a.id, 10);
  const db = b.demandeId ?? Number.parseInt(b.id, 10);
  const na = Number.isNaN(da) ? 0 : da;
  const nb = Number.isNaN(db) ? 0 : db;
  return na - nb;
}

export function enfantToOrdreInput(e: Enfant): OrdreArriveeInput {
  return {
    id: e.id,
    demandeId: e.demandeId,
    dateInscription: e.dateInscription,
    updatedAt: e.updatedAt ?? null,
    reinscrit: !!e.reinscrit,
  };
}

export function compareEnfantsOrdreArrivee(a: Enfant, b: Enfant): number {
  return compareOrdreArrivee(enfantToOrdreInput(a), enfantToOrdreInput(b));
}

/** Tri stable pour affichage : ordre d’arrivée réel (réinscription via `updated_at`). */
export function trierEnfantsParOrdreArrivee(enfants: Enfant[]): Enfant[] {
  return [...enfants].sort(compareEnfantsOrdreArrivee);
}

export function idDemandePourRang(e: Enfant): number {
  const d = e.demandeId ?? Number.parseInt(e.id, 10);
  return Number.isNaN(d) ? -1 : d;
}

/**
 * Rang affiché 1…n pour un sous-ensemble de lignes (ex. après filtres), aligné sur l’ordre d’arrivée.
 */
export function rangAfficheParDemandeIdPourEnfants(enfants: Enfant[]): Map<number, number> {
  const sorted = trierEnfantsParOrdreArrivee(enfants);
  const m = new Map<number, number>();
  sorted.forEach((e, i) => {
    const did = idDemandePourRang(e);
    if (did >= 0) m.set(did, i + 1);
  });
  return m;
}
