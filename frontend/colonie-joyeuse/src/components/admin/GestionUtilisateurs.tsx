import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AdminUser, Parent } from '@/data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Pencil, Trash2, Shield, Users, Upload, KeyRound, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import ImportExcel from './ImportExcel';
import type { ImportResult } from './ImportExcel';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function GestionUtilisateurs() {
  const { token } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  type ParentRow = Parent & { userId: string };
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [sites, setSites] = useState<Array<{ id: number; nom: string; code: string }>>([]);
  const [services, setServices] = useState<Array<{ id: number; nom: string }>>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newNom, setNewNom] = useState('');
  const [newPrenom, setNewPrenom] = useState('');
  const [newRole, setNewRole] = useState<'gestionnaire' | 'super_admin'>('gestionnaire');
  const [newTelephone, setNewTelephone] = useState('');

  // Parent creation
  const [createParentOpen, setCreateParentOpen] = useState(false);
  const [newParentMatricule, setNewParentMatricule] = useState('');
  const [newParentPrenom, setNewParentPrenom] = useState('');
  const [newParentNom, setNewParentNom] = useState('');
  const [newParentService, setNewParentService] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentTelephone, setNewParentTelephone] = useState('');
  const [newParentSite, setNewParentSite] = useState('');

  // Edit parent
  const [editParentOpen, setEditParentOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentRow | null>(null);

  // Reset password
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [resetPwdTarget, setResetPwdTarget] = useState<{ type: 'admin' | 'parent'; id: string; name: string } | null>(null);
  const [resetNewPwd, setResetNewPwd] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importExcelOpen, setImportExcelOpen] = useState(false);

  const splitName = (name: string) => {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return { prenom: parts[0] || '', nom: '' };
    return { prenom: parts[0], nom: parts.slice(1).join(' ') };
  };

  const roleToUi = (role: string): 'gestionnaire' | 'super_admin' => (
    String(role).toUpperCase() === 'SUPER_ADMIN' ? 'super_admin' : 'gestionnaire'
  );

  const roleToApi = (role: 'gestionnaire' | 'super_admin') => (
    role === 'super_admin' ? 'SUPER_ADMIN' : 'GESTIONNAIRE'
  );

  const refreshUsers = async () => {
    if (!token) return;
    const rows = await apiRequest<Array<any>>('/admin/users', { token });
    const adminRows = rows.filter((u) => {
      const r = String(u.role || '').toUpperCase();
      return r === 'GESTIONNAIRE' || r === 'SUPER_ADMIN';
    });
    const parentRows = rows.filter((u) => String(u.role || '').toUpperCase() === 'PARENT');

    setAdmins(adminRows.map((u) => {
      const parsed = splitName(String(u.name || ''));
      return {
        id: String(u.id),
        email: String(u.email || ''),
        nom: parsed.nom || String(u.name || ''),
        prenom: parsed.prenom,
        role: roleToUi(String(u.role || 'GESTIONNAIRE')),
        actif: Boolean(u.is_active),
        dateCreation: '',
        motDePasse: '',
        telephone: '',
      } as AdminUser;
    }));

    setParents(parentRows.map((u) => ({
      userId: String(u.id),
      matricule: String(u.matricule || ''),
      prenom: String(u.parent_prenom || ''),
      nom: String(u.parent_nom || ''),
      service: String(u.parent_service || ''),
      site: String(u.parent_site_code || ''),
      site_code: String(u.parent_site_code || ''),
      email: String(u.email || ''),
      telephone: String(u.parent_telephone || ''),
      motDePasse: '',
    })));
  };

  const refreshSites = async () => {
    if (!token) return;
    const rows = await apiRequest<Array<{ id: number; nom: string; code: string | number }>>('/admin/sites', { token });
    setSites(rows.map((s) => ({ id: s.id, nom: s.nom, code: String(s.code) })));
  };

  const refreshServices = async () => {
    if (!token) return;
    const rows = await apiRequest<Array<{ id: number; nom: string }>>('/admin/services', { token });
    setServices(rows.map((s) => ({ id: s.id, nom: s.nom })));
  };

  useEffect(() => {
    if (!token) return;
    Promise.all([refreshUsers(), refreshSites(), refreshServices()]).catch(() => {
      toast({ title: 'Erreur de chargement des utilisateurs', variant: 'destructive' });
    });
  }, [token]);

  const handleImportParents = async (data: any[]): Promise<ImportResult> => {
    if (!token) return { success: 0, errors: [{ ligne: 1, message: 'Session expirée' }] };
    let success = 0;
    const errors: { ligne: number; message: string }[] = [];
    for (let i = 0; i < data.length; i += 1) {
      const row = data[i];
      if (!row.matricule || !row.prenom || !row.nom || !row.service) {
        errors.push({ ligne: i + 2, message: 'Champs obligatoires manquants (matricule, prenom, nom, service)' });
        continue;
      }
      try {
        await apiRequest('/admin/users', {
          method: 'POST',
          token,
          body: JSON.stringify({
            role: 'PARENT',
            name: `${String(row.prenom).trim()} ${String(row.nom).trim()}`.trim(),
            matricule: String(row.matricule).trim(),
            prenom: String(row.prenom).trim(),
            nom: String(row.nom).trim(),
            service: String(row.service).trim(),
            site_code: row.site ? String(row.site).trim() : undefined,
            email: row.email ? String(row.email).trim() : undefined,
            telephone: row.telephone ? String(row.telephone).trim() : undefined,
          }),
        });
        success++;
      } catch (e) {
        errors.push({ ligne: i + 2, message: e instanceof Error ? e.message : 'Erreur API' });
      }
    }
    await refreshUsers();
    return { success, errors };
  };

  const handleImportAdmins = async (data: any[]): Promise<ImportResult> => {
    if (!token) return { success: 0, errors: [{ ligne: 1, message: 'Session expirée' }] };
    let success = 0;
    const errors: { ligne: number; message: string }[] = [];
    for (let i = 0; i < data.length; i += 1) {
      const row = data[i];
      if (!row.email || !row.prenom || !row.nom || !row.role) {
        errors.push({ ligne: i + 2, message: 'Champs obligatoires manquants (email, prenom, nom, role)' });
        continue;
      }
      const role = String(row.role).toLowerCase().trim();
      if (role !== 'gestionnaire' && role !== 'super_admin') {
        errors.push({ ligne: i + 2, message: `Rôle invalide "${row.role}" (gestionnaire ou super_admin)` });
        continue;
      }
      try {
        await apiRequest('/admin/users', {
          method: 'POST',
          token,
          body: JSON.stringify({
            role: role === 'super_admin' ? 'SUPER_ADMIN' : 'GESTIONNAIRE',
            name: `${String(row.prenom).trim()} ${String(row.nom).trim()}`.trim(),
            email: String(row.email).trim(),
          }),
        });
        success++;
      } catch (e) {
        errors.push({ ligne: i + 2, message: e instanceof Error ? e.message : 'Erreur API' });
      }
    }
    await refreshUsers();
    return { success, errors };
  };

  const handleCreate = async () => {
    if (!token || !newEmail || !newNom || !newPrenom) return;
    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        token,
        body: JSON.stringify({
          role: roleToApi(newRole),
          name: `${newPrenom.trim()} ${newNom.trim()}`.trim(),
          email: newEmail.trim(),
        }),
      });
      await refreshUsers();
      setCreateOpen(false);
      setNewEmail(''); setNewNom(''); setNewPrenom(''); setNewTelephone('');
      toast({ title: '✅ Administrateur créé' });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Erreur création admin', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`/admin/users/${Number(id)}`, { method: 'DELETE', token });
      await refreshUsers();
      toast({ title: '🗑️ Utilisateur supprimé', variant: 'destructive' });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Erreur suppression', variant: 'destructive' });
    }
  };

  const handleToggleActif = async (id: string) => {
    if (!token) return;
    const current = admins.find((a) => a.id === id);
    if (!current) return;
    try {
      await apiRequest(`/admin/users/${Number(id)}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ is_active: !current.actif }),
      });
      await refreshUsers();
      toast({ title: !current.actif ? '✅ Activé' : '⚠️ Désactivé' });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Erreur mise à jour statut', variant: 'destructive' });
    }
  };

  const openEdit = (admin: AdminUser) => { setEditingAdmin({ ...admin }); setEditOpen(true); };

  const handleEdit = async () => {
    if (!token || !editingAdmin) return;
    try {
      await apiRequest(`/admin/users/${Number(editingAdmin.id)}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          name: `${editingAdmin.prenom} ${editingAdmin.nom}`.trim(),
          email: editingAdmin.email,
          role: roleToApi(editingAdmin.role),
          is_active: editingAdmin.actif,
        }),
      });
      await refreshUsers();
      setEditOpen(false);
      toast({ title: '✅ Modifié' });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Erreur modification', variant: 'destructive' });
    }
  };

  const handleCreateParent = async () => {
    if (!token || !newParentMatricule || !newParentPrenom || !newParentNom || !newParentService) return;
    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        token,
        body: JSON.stringify({
          role: 'PARENT',
          name: `${newParentPrenom.trim()} ${newParentNom.trim()}`.trim(),
          matricule: newParentMatricule.trim(),
          prenom: newParentPrenom.trim(),
          nom: newParentNom.trim(),
          service: newParentService.trim(),
          site_code: newParentSite || undefined,
          email: newParentEmail || undefined,
          telephone: newParentTelephone || undefined,
        }),
      });
      await refreshUsers();
      setCreateParentOpen(false);
      setNewParentMatricule(''); setNewParentPrenom(''); setNewParentNom(''); setNewParentService(''); setNewParentEmail(''); setNewParentTelephone(''); setNewParentSite('');
      toast({ title: '✅ Parent créé' });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Erreur création parent', variant: 'destructive' });
    }
  };

  const handleEditParent = async () => {
    if (!token || !editingParent) return;
    try {
      await apiRequest(`/admin/users/${Number(editingParent.userId)}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          name: `${editingParent.prenom} ${editingParent.nom}`.trim(),
          parent_prenom: editingParent.prenom,
          parent_nom: editingParent.nom,
          parent_service: editingParent.service,
          parent_site_code: editingParent.site || editingParent.site_code || undefined,
          parent_telephone: editingParent.telephone || undefined,
          email: editingParent.email || undefined,
        }),
      });
      await refreshUsers();
      setEditParentOpen(false);
      toast({ title: '✅ Parent modifié' });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Erreur modification parent', variant: 'destructive' });
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').slice(1);
      let count = 0;
      const run = async () => {
        for (const line of lines) {
        const [matricule, prenom, nom, service] = line.split(',').map(s => s.trim());
        if (matricule && prenom && nom && service) {
          await apiRequest('/admin/users', {
            method: 'POST',
            token,
            body: JSON.stringify({
              role: 'PARENT',
              name: `${prenom} ${nom}`.trim(),
              matricule,
              prenom,
              nom,
              service,
            }),
          });
          count++;
        }
        }
      };
      run()
        .then(async () => {
          await refreshUsers();
          toast({ title: `✅ ${count} parent(s) importé(s)` });
        })
        .catch((err) => toast({ title: err instanceof Error ? err.message : 'Erreur import CSV', variant: 'destructive' }));
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetPassword = async () => {
    if (!token || !resetPwdTarget) return;
    try {
      if (resetPwdTarget.type === 'admin') {
        await apiRequest(`/admin/users/${Number(resetPwdTarget.id)}/reset-password-auto`, {
          method: 'POST',
          token,
        });
      } else {
        if (!resetNewPwd) return;
        await apiRequest(`/admin/users/${Number(resetPwdTarget.id)}/reset-password`, {
          method: 'POST',
          token,
          body: JSON.stringify({ new_password: resetNewPwd }),
        });
      }
      setResetPwdOpen(false);
      setResetNewPwd('');
      toast({
        title: resetPwdTarget.type === 'admin'
          ? '✅ Mot de passe temporaire généré et envoyé'
          : '✅ Mot de passe réinitialisé',
      });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Erreur réinitialisation', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez les administrateurs et les agents CSS</p>
        </div>
        <Button onClick={() => setImportExcelOpen(true)} variant="outline" className="gap-2 rounded-lg">
          <FileSpreadsheet className="w-4 h-4" />Import Excel
        </Button>
      </motion.div>

      <Tabs defaultValue="admins">
        <TabsList className="rounded-lg">
          <TabsTrigger value="admins" className="gap-2 rounded-lg"><Shield className="w-4 h-4" />Administrateurs</TabsTrigger>
          <TabsTrigger value="parents" className="gap-2 rounded-lg"><Users className="w-4 h-4" />Agents CSS / Parents</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-lg bg-primary text-primary-foreground">
              <UserPlus className="w-4 h-4" />Nouvel administrateur
            </Button>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Nom</TableHead>
                  <TableHead className="font-semibold">Prénom</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Rôle</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.nom}</TableCell>
                    <TableCell>{a.prenom}</TableCell>
                    <TableCell className="text-sm">{a.email}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${a.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                        {a.role === 'super_admin' ? 'Super Admin' : 'Gestionnaire'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={a.actif} onCheckedChange={() => handleToggleActif(a.id)} className="data-[state=checked]:bg-emerald-500" />
                        <span className={`text-xs font-medium ${a.actif ? 'text-emerald-600' : 'text-muted-foreground'}`}>{a.actif ? 'Actif' : 'Inactif'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(a)} className="h-8 w-8 p-0"><Pencil className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setResetPwdTarget({ type: 'admin', id: a.id, name: `${a.prenom} ${a.nom}` }); setResetPwdOpen(true); }} className="h-8 w-8 p-0"><KeyRound className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="parents" className="mt-6 space-y-4">
          <div className="flex justify-end gap-2">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 rounded-lg">
              <Upload className="w-4 h-4" />Importer CSV
            </Button>
            <Button onClick={() => setCreateParentOpen(true)} className="gap-2 rounded-lg bg-primary text-primary-foreground">
              <UserPlus className="w-4 h-4" />Nouveau parent
            </Button>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Matricule</TableHead>
                  <TableHead className="font-semibold">Nom</TableHead>
                  <TableHead className="font-semibold">Prénom</TableHead>
                  <TableHead className="font-semibold">Service</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.map(p => (
                  <TableRow key={p.matricule}>
                    <TableCell className="font-mono tabular-nums text-sm">{p.matricule}</TableCell>
                    <TableCell className="font-medium">{p.nom}</TableCell>
                    <TableCell>{p.prenom}</TableCell>
                    <TableCell className="text-sm">{p.service}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingParent({ ...p }); setEditParentOpen(true); }} className="h-8 w-8 p-0"><Pencil className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setResetPwdTarget({ type: 'parent', id: p.userId, name: `${p.prenom} ${p.nom}` }); setResetPwdOpen(true); }} className="h-8 w-8 p-0"><KeyRound className="w-3 h-3" /></Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            if (!token) return;
                            try {
                              await apiRequest(`/admin/users/${Number(p.userId)}`, { method: 'DELETE', token });
                              await refreshUsers();
                              toast({ title: '🗑️ Parent supprimé', variant: 'destructive' });
                            } catch (e) {
                              toast({ title: e instanceof Error ? e.message : 'Erreur suppression', variant: 'destructive' });
                            }
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        ><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-accent">📄 Format CSV :</strong> matricule, prenom, nom, service (une ligne par parent, avec en-tête).
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Admin */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader><DialogTitle>Nouvel administrateur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Prénom</Label><Input value={newPrenom} onChange={e => setNewPrenom(e.target.value)} className="rounded-lg" /></div>
              <div className="space-y-2"><Label>Nom</Label><Input value={newNom} onChange={e => setNewNom(e.target.value)} className="rounded-lg" /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" className="rounded-lg" /></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input value={newTelephone} onChange={e => setNewTelephone(e.target.value)} placeholder="77 123 45 67" className="rounded-lg" /></div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                  <SelectItem value="super_admin">Super Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Le mot de passe temporaire est généré automatiquement et envoyé par email.
              Le changement est obligatoire à la première connexion.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-lg">Annuler</Button>
            <Button onClick={handleCreate} className="rounded-lg bg-primary text-primary-foreground">Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader><DialogTitle>Modifier l'administrateur</DialogTitle></DialogHeader>
          {editingAdmin && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Prénom</Label><Input value={editingAdmin.prenom} onChange={e => setEditingAdmin({ ...editingAdmin, prenom: e.target.value })} className="rounded-lg" /></div>
                <div className="space-y-2"><Label>Nom</Label><Input value={editingAdmin.nom} onChange={e => setEditingAdmin({ ...editingAdmin, nom: e.target.value })} className="rounded-lg" /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input value={editingAdmin.email} onChange={e => setEditingAdmin({ ...editingAdmin, email: e.target.value })} className="rounded-lg" /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={editingAdmin.telephone || ''} onChange={e => setEditingAdmin({ ...editingAdmin, telephone: e.target.value })} className="rounded-lg" /></div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={editingAdmin.role} onValueChange={(v: any) => setEditingAdmin({ ...editingAdmin, role: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                    <SelectItem value="super_admin">Super Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-lg">Annuler</Button>
            <Button onClick={handleEdit} className="rounded-lg bg-primary text-primary-foreground">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Parent */}
      <Dialog open={createParentOpen} onOpenChange={setCreateParentOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader><DialogTitle>Nouveau parent / Agent CSS</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Matricule</Label><Input value={newParentMatricule} onChange={e => setNewParentMatricule(e.target.value)} placeholder="CSS-2024-XXX" className="rounded-lg" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Prénom</Label><Input value={newParentPrenom} onChange={e => setNewParentPrenom(e.target.value)} className="rounded-lg" /></div>
              <div className="space-y-2"><Label>Nom</Label><Input value={newParentNom} onChange={e => setNewParentNom(e.target.value)} className="rounded-lg" /></div>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={newParentService} onValueChange={setNewParentService}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Sélectionner un service" /></SelectTrigger>
                <SelectContent className="max-h-56 overflow-y-auto">
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.nom}>{s.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Site</Label>
              <Select value={newParentSite} onValueChange={setNewParentSite}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Sélectionner un site" /></SelectTrigger>
                <SelectContent className="max-h-56 overflow-y-auto">
                  {sites.map(s => (
                    <SelectItem key={s.id} value={s.code}>{s.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input value={newParentEmail} onChange={e => setNewParentEmail(e.target.value)} type="email" className="rounded-lg" /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={newParentTelephone} onChange={e => setNewParentTelephone(e.target.value)} className="rounded-lg" /></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Le mot de passe par défaut est Passer123. Le parent devra le changer à sa première connexion.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateParentOpen(false)} className="rounded-lg">Annuler</Button>
            <Button onClick={handleCreateParent} className="rounded-lg bg-primary text-primary-foreground">Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Parent */}
      <Dialog open={editParentOpen} onOpenChange={setEditParentOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader><DialogTitle>Modifier le parent</DialogTitle></DialogHeader>
          {editingParent && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Matricule</Label><Input value={editingParent.matricule} disabled className="rounded-lg bg-muted/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Prénom</Label><Input value={editingParent.prenom} onChange={e => setEditingParent({ ...editingParent, prenom: e.target.value })} className="rounded-lg" /></div>
                <div className="space-y-2"><Label>Nom</Label><Input value={editingParent.nom} onChange={e => setEditingParent({ ...editingParent, nom: e.target.value })} className="rounded-lg" /></div>
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Select value={editingParent.service || ''} onValueChange={v => setEditingParent({ ...editingParent, service: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Sélectionner un service" /></SelectTrigger>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.nom}>{s.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Site</Label>
                <Select value={editingParent.site || ''} onValueChange={v => setEditingParent({ ...editingParent, site: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Sélectionner un site" /></SelectTrigger>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {sites.map(s => (
                      <SelectItem key={s.id} value={s.code}>{s.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input value={editingParent.email || ''} onChange={e => setEditingParent({ ...editingParent, email: e.target.value })} className="rounded-lg" /></div>
                <div className="space-y-2"><Label>Téléphone</Label><Input value={editingParent.telephone || ''} onChange={e => setEditingParent({ ...editingParent, telephone: e.target.value })} className="rounded-lg" /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditParentOpen(false)} className="rounded-lg">Annuler</Button>
            <Button onClick={handleEditParent} className="rounded-lg bg-primary text-primary-foreground">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password */}
      <Dialog open={resetPwdOpen} onOpenChange={setResetPwdOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          </DialogHeader>
          {resetPwdTarget?.type === 'admin' ? (
            <p className="text-sm text-muted-foreground">
              Un mot de passe temporaire aléatoire sera généré, appliqué au compte
              <strong> {resetPwdTarget?.name}</strong> et envoyé automatiquement par email.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Nouveau mot de passe pour <strong>{resetPwdTarget?.name}</strong></p>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input type="password" value={resetNewPwd} onChange={e => setResetNewPwd(e.target.value)} className="rounded-lg" />
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwdOpen(false)} className="rounded-lg">Annuler</Button>
            <Button onClick={handleResetPassword} className="rounded-lg bg-primary text-primary-foreground">
              {resetPwdTarget?.type === 'admin' ? 'Générer et envoyer' : 'Réinitialiser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportExcel
        open={importExcelOpen}
        onOpenChange={setImportExcelOpen}
        entities={[
          { value: 'parents', config: { label: 'Parents / Agents CSS', colonnes: ['matricule', 'prenom', 'nom', 'service', 'site', 'email', 'telephone'], description: 'Colonnes requises : matricule, prenom, nom, service. Optionnelles : site, email, telephone.' }, onImport: handleImportParents },
          { value: 'admins', config: { label: 'Administrateurs', colonnes: ['email', 'prenom', 'nom', 'role', 'telephone'], description: 'Colonnes requises : email, prenom, nom, role (gestionnaire ou super_admin). Optionnelle : telephone.' }, onImport: handleImportAdmins },
        ]}
      />
    </div>
  );
}
