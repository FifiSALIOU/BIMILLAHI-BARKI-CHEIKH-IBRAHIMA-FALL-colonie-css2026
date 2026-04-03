import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminLoginPage() {
  const { loginAsAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorTitle("Champs requis");
      setErrorMessage("Veuillez renseigner votre adresse e-mail et votre mot de passe.");
      setErrorOpen(true);
      return;
    }
    try {
      await loginAsAdmin(email, password);
    } catch (e) {
      setErrorTitle("Erreur d'authentification");
      setErrorMessage(e instanceof Error ? e.message : "Les identifiants saisis sont incorrects.");
      setErrorOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card rounded-xl shadow-elevated p-8 space-y-6">
          <div className="text-center space-y-3">
            <motion.img
              src={logo}
              alt="Logo CSS"
              className="w-20 h-20 mx-auto object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            />
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Administration</h1>
              </div>
              <p className="text-muted-foreground text-sm">Portail de gestion — Colonie de Vacances 2026</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Adresse e-mail</Label>
              <Input id="email" type="email" placeholder="admin@css.sn" value={email} onChange={e => setEmail(e.target.value)} className="h-11 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Mot de passe</Label>
              <div className="relative">
                <Input id="password" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="pr-10 h-11 rounded-lg" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full h-11 rounded-lg bg-brand-navy text-primary-foreground hover:bg-brand-navy/90 font-semibold">
              Se connecter
            </Button>

            <Link to="/" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Retour à l'espace parent
            </Link>

            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <strong className="text-primary">Test :</strong> admin@css.sn / admin123 (Gestionnaire) — superadmin@css.sn / admin123 (Super Admin)
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <DialogTitle className="text-foreground">{errorTitle}</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground pt-2">{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorOpen(false)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">Compris</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
