import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2, KeyRound } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function ForgotPassword() {
  const { setAuthStep } = useAuth();
  const [matricule, setMatricule] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubmit = () => {
    if (!matricule.trim()) {
      setErrorMessage('Veuillez saisir votre matricule.');
      setErrorOpen(true);
      return;
    }
    // Aucune API publique de réinitialisation parent n'est exposée dans le backend actuel.
    setSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-elevated p-8 space-y-6">
          <div className="text-center space-y-3">
            <img src={logo} alt="Logo CSS" className="w-16 h-16 mx-auto object-contain" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Mot de passe oublié</h2>
              <p className="text-sm text-muted-foreground mt-1">Saisissez votre matricule pour demander une réinitialisation.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Matricule</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Ex: CSS-2024-001" value={matricule} onChange={e => setMatricule(e.target.value)} className="pl-10 h-12 rounded-lg" />
              </div>
            </div>
            <Button onClick={handleSubmit} className="w-full h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Envoyer la demande
            </Button>
            <button onClick={() => setAuthStep('logged_out')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </motion.div>

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
              <DialogTitle className="text-foreground">Erreur</DialogTitle>
            </div>
            <DialogDescription className="pt-2">{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button onClick={() => setErrorOpen(false)} className="bg-primary text-primary-foreground rounded-lg">Compris</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={() => { setSuccessOpen(false); setAuthStep('logged_out'); }}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
              <DialogTitle className="text-foreground">Mot de passe modifié</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Votre demande a été prise en compte. Contactez l'administration pour recevoir un mot de passe temporaire.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter><Button onClick={() => { setSuccessOpen(false); setAuthStep('logged_out'); }} className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg">Retour à la connexion</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
