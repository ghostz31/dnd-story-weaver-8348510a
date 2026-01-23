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
              <span className="text-primary font-medium">Préparez moins. Jouez plus.</span> L'écran du MJ numérique qui vous permet d'orchestrer des affrontements épiques et de tisser des légendes autour de votre table.
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-16 text-center font-cinzel text-foreground">L'Arsenal du Maître du Jeu</h2>

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
                  <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-2 md:mb-3">Orchestrateur de Rencontres</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 flex-grow">
                    Piochez dans un bestiaire de plus de 400 créatures, équilibrez vos affrontements en un clic, et gardez tous les blocs de stats à portée de main.
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
                  <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-2 md:mb-3">Suivi de votre Table</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 flex-grow">
                    Gérez vos groupes de PJ, suivez leur progression et adaptez automatiquement la difficulté à leur niveau. Fini les calculs manuels !
                  </p>
                  <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 group-hover:text-primary transition-colors mt-auto" asChild>
                    <Link to="/parties">
                      Gérer ma table
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
                  <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-2 md:mb-3">Chroniques de Campagne</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 flex-grow">
                    Gardez une trace de chaque session. Retrouvez, dupliquez et réutilisez vos rencontres passées pour tisser la continuité de votre campagne.
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


      </div>
    </PageTransition>
  );
};

export default IndexPage;
