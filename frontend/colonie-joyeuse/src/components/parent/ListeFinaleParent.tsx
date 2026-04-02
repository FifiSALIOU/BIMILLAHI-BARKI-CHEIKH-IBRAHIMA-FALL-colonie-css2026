import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { calculateAge } from '@/data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';

type ParentFinaleRow = {
  position: number;
  demande_id: number;
  liste_code: string;
  date_inscription: string;
  parent_matricule: string;
  parent_prenom: string;
  parent_nom: string;
  parent_service: string;
  enfant_prenom: string;
  enfant_nom: string;
  enfant_date_naissance: string;
  enfant_sexe: string;
};

export default function ListeFinaleParent() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<ParentFinaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<ParentFinaleRow[]>('/parent/liste-finale', { token });
        setRows(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Impossible de charger la liste finale.');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const listeFinale = rows;

  const filtered = listeFinale.filter(e => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      e.parent_matricule.toLowerCase().includes(s) ||
      e.enfant_nom.toLowerCase().includes(s) ||
      e.enfant_prenom.toLowerCase().includes(s) ||
      e.parent_nom.toLowerCase().includes(s) ||
      e.parent_prenom.toLowerCase().includes(s)
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
            <p className="text-muted-foreground mt-1">{listeFinale.length} enfant(s) retenus pour la Colonie de Vacances (liste globale)</p>
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
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Chargement...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-destructive">{error}</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Aucun résultat</TableCell></TableRow>
              ) : (
                filtered.map((e, idx) => {
                  return (
                    <TableRow key={e.demande_id}>
                      <TableCell className="font-bold text-foreground text-center">{idx + 1}</TableCell>
                      <TableCell className="font-mono tabular-nums text-sm">{e.parent_matricule}</TableCell>
                      <TableCell>{e.parent_nom || '—'}</TableCell>
                      <TableCell>{e.parent_prenom || '—'}</TableCell>
                      <TableCell className="text-sm">{e.parent_service || '—'}</TableCell>
                      <TableCell>{e.enfant_prenom}</TableCell>
                      <TableCell className="font-medium">{e.enfant_nom}</TableCell>
                      <TableCell>{calculateAge(e.enfant_date_naissance)} ans</TableCell>
                      <TableCell>{String(e.enfant_sexe).toUpperCase() === 'M' ? 'M' : 'F'}</TableCell>
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
