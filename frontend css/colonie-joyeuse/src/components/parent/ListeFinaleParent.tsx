import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInscription } from '@/contexts/InscriptionContext';
import { calculateAge, type Enfant, type Parent } from '@/data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Award } from 'lucide-react';

interface ListeFinaleParentProps {
  apiListeFinale?: Enfant[];
  apiParents?: Parent[];
  /** Si false en mode API : la liste n'est pas encore publiée (ex. avant clôture). */
  apiListeFinalePubliee?: boolean;
}

export default function ListeFinaleParent({ apiListeFinale, apiParents, apiListeFinalePubliee = true }: ListeFinaleParentProps = {}) {
  const { getListeFinale, parents: ctxParents, listeFinaleGeneree } = useInscription();
  const [searchTerm, setSearchTerm] = useState('');

  const useApi = apiListeFinale !== undefined;
  const parents = apiParents ?? ctxParents;
  const listeFinale = useApi ? apiListeFinale! : getListeFinale();

  if (useApi && !apiListeFinalePubliee) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Liste finale des retenus</h1>
              <p className="text-muted-foreground mt-1">La liste finale sera publiée après la clôture des inscriptions.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!useApi && !listeFinaleGeneree) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Liste finale des retenus</h1>
              <p className="text-muted-foreground mt-1">La liste finale n'est pas encore disponible.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const filtered = listeFinale.filter(e => {
    if (!searchTerm) return true;
    const p = parents.find(x => x.matricule === e.parentMatricule);
    const s = searchTerm.toLowerCase();
    return (
      e.parentMatricule.toLowerCase().includes(s) ||
      e.nom.toLowerCase().includes(s) ||
      e.prenom.toLowerCase().includes(s) ||
      (p?.nom || '').toLowerCase().includes(s) ||
      (p?.prenom || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Liste finale des retenus</h1>
            <p className="text-muted-foreground mt-1">{listeFinale.length} enfant(s) retenus pour la Colonie de Vacances</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">
          <strong className="text-emerald-700">✅ Liste officielle :</strong> Voici la liste des enfants retenus pour la Colonie de Vacances. Cette liste est en consultation uniquement.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher par matricule, nom..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 rounded-lg" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card border border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold w-16">N°</TableHead>
                <TableHead className="font-semibold">Matricule</TableHead>
                <TableHead className="font-semibold">Nom du parent</TableHead>
                <TableHead className="font-semibold">Prénom du parent</TableHead>
                <TableHead className="font-semibold">Service</TableHead>
                <TableHead className="font-semibold">Prénom Enfant</TableHead>
                <TableHead className="font-semibold">Nom Enfant</TableHead>
                <TableHead className="font-semibold">Âge</TableHead>
                <TableHead className="font-semibold">Sexe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Aucun résultat</TableCell></TableRow>
              ) : (
                filtered.map((e, idx) => {
                  const p = parents.find(x => x.matricule === e.parentMatricule);
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-bold text-foreground text-center">{idx + 1}</TableCell>
                      <TableCell className="font-mono tabular-nums text-sm">{e.parentMatricule}</TableCell>
                      <TableCell>{p?.nom || '—'}</TableCell>
                      <TableCell>{p?.prenom || '—'}</TableCell>
                      <TableCell className="text-sm">{p?.service || '—'}</TableCell>
                      <TableCell>{e.prenom}</TableCell>
                      <TableCell className="font-medium">{e.nom}</TableCell>
                      <TableCell>{calculateAge(e.dateNaissance)} ans</TableCell>
                      <TableCell>{e.sexe === 'M' ? 'M' : 'F'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
