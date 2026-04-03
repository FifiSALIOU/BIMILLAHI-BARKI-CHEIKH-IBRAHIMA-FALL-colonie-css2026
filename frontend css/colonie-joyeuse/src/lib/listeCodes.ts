/** Aligné sur `ListeCode` côté FastAPI (valeurs enum). */

export type ListeUi = 'principale' | 'attente_n1' | 'attente_n2';

export type ListeApi = 'PRINCIPALE' | 'ATTENTE_N1' | 'ATTENTE_N2';

export function listeUiToApi(ui: ListeUi): ListeApi {
  if (ui === 'principale') return 'PRINCIPALE';
  if (ui === 'attente_n1') return 'ATTENTE_N1';
  return 'ATTENTE_N2';
}

/** Normalise la valeur renvoyée par l’API (`liste.code`) vers les clés UI. */
export function listeApiToUi(code: string | undefined | null): ListeUi {
  const u = String(code || '').toUpperCase().replace(/-/g, '_');
  if (u === 'PRINCIPALE') return 'principale';
  if (u === 'ATTENTE_N1') return 'attente_n1';
  return 'attente_n2';
}

export function statutLabelFromListeUi(liste: ListeUi): 'Titulaire' | 'Suppléant N1' | 'Suppléant N2' {
  if (liste === 'principale') return 'Titulaire';
  if (liste === 'attente_n1') return 'Suppléant N1';
  return 'Suppléant N2';
}
