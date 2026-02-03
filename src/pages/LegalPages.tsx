import React from 'react';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LegalPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const navigate = useNavigate();
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                <ChevronLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <h1 className="text-3xl font-bold mb-8">{title}</h1>
            <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    );
};

export const PrivacyPage = () => (
    <LegalPage
        title="Politique de confidentialité"
        content={`Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}

Bienvenue sur Trame. Nous attachons une importance capitale à la confidentialité de vos données et à la transparence de nos processus. Cette politique de confidentialité explique comment vos informations sont collectées, utilisées et protégées lorsque vous utilisez notre application.

1. Identité du Responsable de Traitement
Trame est un outil indépendant destiné aux passionnés de jeux de rôle. Pour toute question concernant vos données, vous pouvez nous contacter à l'adresse : contact@trame.app.

2. Nature des Données Collectées
Nous limitons la collecte aux données strictement nécessaires à la fourniture de nos services :
- Données d'identification : Lorsque vous créez un compte via Firebase Authentication, nous stockons votre adresse e-mail et votre nom d'affichage (ou pseudonyme).
- Données Applicatives : Vos créations (monstres personnalisés, rencontres, groupes de joueurs, journaux de combat) sont stockées dans nos bases de données pour vous permettre d'y accéder sur tous vos appareils.
- Données de Connexion D&D Beyond : Si vous utilisez la synchronisation, nous stockons uniquement les identifiants techniques nécessaires pour interroger leur API en votre nom. Nous ne stockons jamais vos mots de passe de tiers.

3. Finalités du Traitement
Vos données sont traitées pour les raisons suivantes :
- Fonctionnement du Service : Permettre la sauvegarde, la synchronisation et la gestion de vos campagnes.
- Partage Communautaire : Permettre la génération de liens de partage pour vos monstres et rencontres.
- Support Technique : Vous aider en cas de problème avec votre compte.
- Communication : Vous informer des mises à jour majeures via l'application.

4. Base Légale du Traitement
Le traitement de vos données est basé sur :
- L'exécution du contrat : Pour vous fournir les services auxquels vous souscrivez en créant un compte.
- Votre consentement : Notamment pour l'utilisation de certaines fonctionnalités optionnelles (comme la synchronisation tierce).
- L'intérêt légitime : Pour sécuriser l'application et prévenir les abus.

5. Destinataires des Données
Vos données ne sont jamais vendues à des tiers. Elles ne sont partagées que de manière limitée :
- Prestataires de services 기술 (Cloud) : Google Firebase (hébergement et authentification), Netlify (hébergement web).
- Autres utilisateurs : Uniquement les données que vous choisissez explicitement de partager via un lien public.

6. Durée de Conservation
- Données de compte : Conservées tant que votre compte est actif.
- Données applicatives : Conservées tant que vous ne les supprimez pas manuellement.
- Suppression : En cas de suppression de compte, toutes vos données personnelles et applicatives sont définitivement effacées de nos serveurs sous 30 jours (délais de sauvegarde inclus).

7. Sécurité
Nous mettons en œuvre des mesures de sécurité rigoureuses pour protéger vos données contre tout accès non autorisé :
- Chiffrement des communications via HTTPS/TLS.
- Utilisation des règles de sécurité de Firebase (Firestore Rules) pour restreindre l'accès de vos données à vous seul.
- Surveillance constante des vulnérabilités.

8. Cookies et Technologies de Stockage
- Storage Local : Nous utilisons le LocalStorage et SessionStorage du navigateur pour mémoriser votre session, vos préférences d'affichage (thème sombre/clair) et vos brouillons de création.
- Cookies techniques : Indispensables à l'authentification Firebase.
- Aucun traçage publicitaire : Nous n'utilisons aucun cookie publicitaire ou outil d'analyse tiers intrusif (type Google Analytics).

9. Vos Droits
Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
- Droit d'accès et de portabilité.
- Droit de rectification des données inexactes.
- Droit à l'effacement ("droit à l'oubli").
- Droit d'opposition ou de limitation du traitement.
Vous pouvez exercer ces droits directement depuis votre interface utilisateur ou en nous écrivant.

10. Contact
Pour toute interrogation sur cette politique ou pour exercer vos droits, contactez-nous par e-mail : contact@trame.app.`}
    />
);

export const TermsPage = () => (
    <LegalPage
        title="Conditions d'utilisation"
        content={`Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}

Bienvenue sur Trame. En accédant à cette application ou en l'utilisant, vous acceptez d'être lié par les présentes conditions d'utilisation.

1. Description du Service
Trame est un outil compagnon destiné aux Maîtres de Jeu pour le système Dungeons & Dragons 5e (SRD). Il permet la gestion de rencontres, de monstres, de sorts et de groupes de joueurs.

2. Accès et Compte
L'accès à certaines fonctionnalités nécessite la création d'un compte utilisateur. Vous êtes responsable de :
- Maintenir la confidentialité de vos identifiants.
- Toutes les activités effectuées sous votre compte.
- Signaler immédiatement toute utilisation non autorisée.

3. Propriété Intellectuelle
- Contenu de Trame : L'interface, le code source et les logos sont la propriété exclusive de Trame.
- Données SRD : Les données de jeu (monstres, sorts) proviennent de l'Open Game License (OGL) de Wizards of the Coast, ou de contributeurs externes (AideDD). Trame ne revendique aucune propriété sur ces systèmes de jeu.
- Vos Contenus : Vous restez propriétaire des monstres personnalisés et rencontres que vous créez. En utilisant le service, vous nous accordez le droit technique de les héberger et de les afficher pour votre usage ou pour les personnes avec qui vous partagez un lien.

4. Règles de Conduite
En utilisant Trame, vous vous engagez à ne pas :
- Utiliser l'outil à des fins illégales.
- Tenter d'extraire massivement des données (scraping non autorisé) ou de perturber les serveurs.
- Partager des contenus offensants ou inappropriés via les liens publics de partage.

5. Limites de Responsabilité
Trame est fourni "en l'état", sans garantie de disponibilité ininterrompue. Nous ne pourrons être tenus responsables de :
- La perte de données (bien que des sauvegardes soient effectuées via Firebase).
- Tout bug ou erreur dans les calculs de jeu pendant vos sessions.

6. Synchronisation Tierce (D&D Beyond)
La fonctionnalité de synchronisation avec D&D Beyond est un outil communautaire indépendant. Elle dépend des APIs tierces et peut être interrompue ou modifiée sans préavis en cas de changement sur les sites sources.

7. Modification et Résiliation
Nous nous réservons le droit de modifier ces conditions à tout moment. Vous pouvez cesser d'utiliser le service et supprimer votre compte à tout moment.

8. Loi Applicable
Bien que Trame soit distribué mondialement, tout litige sera traité en priorité selon les principes du droit français et européen.

Pour toute question : contact@trame.app`}
    />
);

export const CookiesPage = () => (
    <LegalPage
        title="Politique des cookies"
        content={`Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}

Chez Trame, nous croyons en une transparence totale sur la manière dont nous traitons vos données. Cette page explique comment nous utilisons les cookies et technologies similaires sur notre site.

1. Qu'est-ce qu'un cookie ?
Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. Il permet au site de mémoriser vos actions et préférences sur une période donnée.

2. Comment utilisons-nous les cookies ?
Trame n'utilise que des cookies techniques et fonctionnels strictement nécessaires au bon fonctionnement du service.

A. Authentification (Firebase)
Nous utilisons les cookies de Google Firebase pour vous maintenir connecté à votre compte. Sans ces cookies, vous devriez vous reconnecter à chaque changement de page.
- Nom : __session, firebase-auth-token, etc.
- Finalité : Sécuriser votre accès et identifier votre session.
- Durée : Durée de la session ou persistant selon votre choix de connexion.

B. Préférences Utilisateur (Stockage Local)
Bien que ce ne soient pas des cookies au sens strict, nous utilisons le stockage local de votre navigateur pour améliorer votre expérience :
- Thème : Pour mémoriser si vous utilisez le mode sombre ou clair.
- Brouillons : Pour éviter de perdre votre travail sur un monstre ou une rencontre en cours en cas de rafraîchissement accidentel.
- Navigation : Pour mémoriser vos derniers filtres de recherche dans le bestiaire.

3. Cookies Tiers et Publicité
- Aucun traçage publicitaire : Nous ne diffusons aucune publicité sur Trame. Nous n'utilisons donc aucun cookie de ciblage publicitaire tiers (type Facebook Pixel ou régies publicitaires).
- Pas d'analyse intrusive : Nous n'utilisons pas d'outils d'analyse tiers qui traquent votre comportement à des fins de marketing.

4. Comment gérer les cookies ?
Vous pouvez contrôler et/ou supprimer des cookies comme vous le souhaitez. Vous avez la possibilité de supprimer tous les cookies déjà stockés sur votre ordinateur et de configurer la plupart des navigateurs pour qu'ils les bloquent.

Toutefois, si vous choisissez de bloquer les cookies de Trame :
- L'authentification ne fonctionnera plus (vous ne pourrez plus accéder à vos données sauvegardées).
- Vos préférences d'affichage seront réinitialisées à chaque visite.

Pour configurer votre navigateur :
- Chrome : Paramètres > Confidentialité et sécurité > Cookies et autres données de sites.
- Firefox : Options > Vie privée et sécurité > Cookies et données de sites.
- Safari : Préférences > Confidentialité > Bloquer tous les cookies.

5. Modifications
Nous pouvons mettre à jour cette politique pour refléter les changements techniques de l'application. Nous vous invitons à la consulter régulièrement.`}
    />
);

export const NewsPage = () => (
    <LegalPage
        title="Actualités"
        content="Bienvenue sur Trame ! Nos dernières mises à jour incluent :\n- Refonte du système de rencontre.\n- Synchronisation avec D&D Beyond.\n- Amélioration des performances globales.\nRestez à l'écoute pour de nouvelles fonctionnalités !"
    />
);
