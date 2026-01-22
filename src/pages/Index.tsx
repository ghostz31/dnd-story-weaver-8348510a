import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Sword, Users, Book, History, CreditCard, Check, PenTool } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import PageTransition from '@/components/layout/PageTransition';
import { motion } from 'framer-motion';

const IndexPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>

      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Section héros */}
        <section className="text-center py-10 md:py-20 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0]
              }}
              transition={{
                rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="inline-block relative"
            >
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full" />
              <PenTool className="h-24 w-24 text-primary relative z-10 mx-auto mb-6 drop-shadow-glow" />
            </motion.div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 font-cinzel text-center text-foreground drop-shadow-sm">
              Trame
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-6 md:mb-10 text-center max-w-2xl mx-auto font-light leading-relaxed px-4">
              Tissez des <span className="text-primary font-medium">légendes inoubliables</span>. Créez des rencontres épiques et équilibrées pour vos aventures D&D.
            </p>

            {!isAuthenticated ? (
              <div className="flex flex-col gap-3 sm:flex-row justify-center sm:gap-6 px-4">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-8 text-base sm:text-lg font-cinzel shadow-glow hover:shadow-glow-lg transition-all touch-target" asChild>
                  <Link to="/auth?mode=register">Commencer l'Aventure</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-6 sm:px-8 text-base sm:text-lg border-primary/50 hover:bg-primary/5 backdrop-blur-sm touch-target" asChild>
                  <Link to="/auth?mode=login">Se connecter</Link>
                </Button>
              </div>
            ) : (
              <div className="flex justify-center px-4">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-10 py-6 sm:py-8 text-lg sm:text-xl shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all font-cinzel touch-target" asChild>
                  <Link to="/encounters">
                    <Sword className="mr-2 h-6 w-6" />
                    Créer une Rencontre
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        </section>

        {/* Section des fonctionnalités */}
        <section className="py-10 md:py-16 mx-2 md:mx-4 lg:mx-8 mb-8 md:mb-12 relative z-10">
          <div className="container mx-auto px-2 md:px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-16 text-center font-cinzel text-foreground">Fonctionnalités Magiques</h2>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <motion.div variants={item}>
                <div className="glass-card h-full p-4 sm:p-6 md:p-8 rounded-xl hover:shadow-glow transition-all duration-300 border border-glass-border/30 group flex flex-col interactive-tap">
                  <div className="p-3 md:p-4 bg-primary/10 w-fit rounded-2xl mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                    <Sword className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-2 md:mb-3">Générateur de Rencontres</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 flex-grow">
                    Choisissez parmi des centaines de monstres du SRD 5e, ajustez automatiquement la difficulté, et obtenez des statistiques détaillées.
                  </p>
                  <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 group-hover:text-primary transition-colors mt-auto" asChild>
                    <Link to="/encounters">
                      Créer une rencontre
                      <Sword className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <div className="glass-card h-full p-4 sm:p-6 md:p-8 rounded-xl hover:shadow-glow transition-all duration-300 border border-glass-border/30 group flex flex-col interactive-tap">
                  <div className="p-3 md:p-4 bg-primary/10 w-fit rounded-2xl mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-2 md:mb-3">Gestion de Groupe</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 flex-grow">
                    Créez et gérez plusieurs groupes d'aventuriers. Suivez leurs niveaux, classes et progression pour des défis toujours adaptés.
                  </p>
                  <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 group-hover:text-primary transition-colors mt-auto" asChild>
                    <Link to="/parties">
                      Gérer mes groupes
                      <Users className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <div className="glass-card h-full p-4 sm:p-6 md:p-8 rounded-xl hover:shadow-glow transition-all duration-300 border border-glass-border/30 group flex flex-col interactive-tap">
                  <div className="p-3 md:p-4 bg-primary/10 w-fit rounded-2xl mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                    <History className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-2 md:mb-3">Grimoire d'Histoire</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 flex-grow">
                    Un registre éternel de vos batailles passées. Dupliquez, modifiez et revivez vos plus grands moments.
                  </p>
                  <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 group-hover:text-primary transition-colors mt-auto" asChild>
                    <Link to="/history">
                      Voir l'historique
                      <History className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section Premium */}
        <section className="py-16 mb-12 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4 text-center font-cinzel">L'Ascension Héroïque</h2>
            <p className="text-xl text-muted-foreground mb-12 text-center font-light">Débloquez le potentiel ultime de votre table</p>

            <motion.div
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card p-8 rounded-2xl border-2 border-primary/30 shadow-2xl relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 bg-gradient-to-bl from-primary to-primary/80 text-white rounded-bl-3xl text-sm font-bold uppercase tracking-widest shadow-lg">
                  Légendaire
                </div>

                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-cinzel font-bold">Premium</h3>
                      <p className="text-muted-foreground">L'expérience complète</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <span className="text-4xl font-bold font-cinzel">4,99€</span>
                    <span className="text-muted-foreground"> / mois</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Groupes et personnages illimités",
                      "Rencontres illimitées",
                      "Créer et sauvegarder des monstres",
                      "Exportation PDF des rencontres",
                      "Aucune publicité"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="bg-green-500/10 p-1 rounded-full">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                        </div>
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full py-6 text-lg font-cinzel shadow-glow hover:shadow-glow-lg transition-all" asChild>
                    <Link to="/subscription">S'abonner Maintenant</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default IndexPage;
