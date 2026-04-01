-- Seed data generated from legacy static dataset in lib/data.ts

TRUNCATE TABLE public.offers, public.features, public.steps, public.testimonials RESTART IDENTITY;

INSERT INTO public.offers (
  id,
  sort_order,
  title,
  description,
  category,
  category_label,
  emoji,
  gradient,
  rating,
  distance,
  badge,
  price,
  address,
  details,
  latitude,
  longitude
)
VALUES
('kfc-villiers', 1, 'KFC Villiers-sur-Marne', '1 burger Colonel acheté + 1 offert', 'restaurant', 'Restaurant', 'KFC', 'from-red-700 to-orange-500', 4, '0.3 km', 'Gratuit', NULL, '12 Av. du Général de Gaulle, 94350 Villiers-sur-Marne', ARRAY['1 burger Colonel acheté + 1 burger Colonel offert', 'Valable du lundi au vendredi, hors jours fériés', 'Non cumulable avec d''autres offres', 'Sur présentation du bon Insolit']::text[], 48.8284, 2.5423),
('pizza-palace', 2, 'Pizza Palace', 'Pizza XL au prix d''une Medium', 'restaurant', 'Restaurant', '🍕', 'from-orange-500 to-yellow-400', 4, '0.6 km', '-40%', NULL, '5 Rue de la Paix, 75001 Paris', ARRAY['Pizza XL au prix d''une Medium', 'Sur toute la carte hors promotions', 'Valable 7j/7', 'Sur présentation du bon Insolit']::text[], 48.8694, 2.3314),
('pho-saigon', 3, 'Phở Saïgon', 'Menu complet à -30%', 'restaurant', 'Restaurant', '🍜', 'from-blue-700 to-blue-400', 5, '1.1 km', NULL, NULL, '22 Rue du Temple, 75004 Paris', ARRAY['-30% sur le menu entrée + plat + dessert', 'Valable du mardi au dimanche', 'Hors boissons alcoolisées']::text[], 48.8575, 2.3523),
('sushi-corner', 4, 'Sushi Corner', 'Plateau 32 pièces à 15€', 'restaurant', 'Restaurant', '🍣', 'from-teal-500 to-blue-600', 4, '1.4 km', '-50%', NULL, '8 Bd Haussmann, 75009 Paris', ARRAY['Plateau 32 pièces mixtes à 15€ au lieu de 30€', 'Valable le midi uniquement', 'Sur réservation ou sur place']::text[], 48.874, 2.3389),
('burger-king-marne', 5, 'Burger King La Marne', 'Menu King au prix du menu Simple', 'restaurant', 'Restaurant', '🍔', 'from-yellow-500 to-red-500', 4, '1.8 km', '-20%', NULL, '3 Centre Commercial, 94100 Saint-Maur-des-Fossés', ARRAY['Menu King Deluxe au prix du menu Classic', 'Boisson + dessert inclus', 'Valable du lundi au vendredi']::text[], 48.7987, 2.4986),
('le-petit-bistrot', 6, 'Le Petit Bistrot', 'Plat du jour + café offert', 'restaurant', 'Restaurant', '🥘', 'from-amber-600 to-orange-400', 5, '0.9 km', NULL, NULL, '14 Rue Mouffetard, 75005 Paris', ARRAY['Plat du jour + café ou dessert offert', 'Carte changeant chaque semaine', 'Réservation recommandée le week-end']::text[], 48.8423, 2.3503),
('escape-game', 7, 'Escape Game Paris', '1h d''Escape Game à 2 pour 20€', 'activite', 'Activité', '🎯', 'from-purple-600 to-pink-500', 5, '2.1 km', NULL, NULL, '18 Rue du Faubourg Saint-Antoine, 75011 Paris', ARRAY['1h d''Escape Game à 2 personnes pour 20€', '10 scénarios au choix', 'Sur réservation uniquement', 'Valable tous les jours de 10h à 22h']::text[], 48.8531, 2.3731),
('bowling-show', 8, 'Bowling Show', '1h de bowling + location chaussures incluse', 'activite', 'Activité', '🎳', 'from-yellow-400 to-orange-500', 3, '3.2 km', NULL, NULL, '45 Av. de Clichy, 75017 Paris', ARRAY['1h de bowling pour 2 personnes', 'Location de chaussures incluse', 'Valable en semaine avant 18h']::text[], 48.8862, 2.3195),
('laser-game', 9, 'Laser Game Évasion', '2 parties de Laser Game pour le prix d''1', 'activite', 'Activité', '🔫', 'from-cyan-500 to-blue-600', 4, '1.6 km', '-50%', NULL, '77 Rue de Rivoli, 75001 Paris', ARRAY['2 parties de Laser Game pour le prix d''1', 'Équipement fourni', 'Pour groupes de 4 personnes minimum', 'Sur réservation']::text[], 48.86, 2.3422),
('paintball', 10, 'Paintball Xtreme', '100 billes offertes pour toute session', 'activite', 'Activité', '🎪', 'from-green-600 to-teal-500', 4, '5.4 km', 'Bonus', NULL, '2 Allée des Sports, 93100 Montreuil', ARRAY['100 billes offertes en plus par joueur', 'Équipement complet fourni', 'Minimum 6 joueurs', 'Réservation 48h à l''avance']::text[], 48.8639, 2.4403),
('accrobranche', 11, 'Forest Adventure', 'Accrobranche : enfant gratuit pour 1 adulte payant', 'activite', 'Activité', '🌲', 'from-green-500 to-emerald-700', 5, '8.2 km', '1 offert', NULL, 'Forêt de Vincennes, 75012 Paris', ARRAY['1 enfant gratuit pour 1 adulte payant', 'Parcours adapté à tous niveaux', 'Casques et équipements fournis', 'Ouvert le week-end et vacances scolaires']::text[], 48.8374, 2.4288),
('karting', 12, 'Speed Karting', '10 minutes de karting offertes', 'activite', 'Activité', '🏎️', 'from-red-500 to-yellow-400', 4, '12 km', 'Bonus', NULL, '25 Rue de l''Industrie, 93200 Saint-Denis', ARRAY['10 min offertes pour toute session de 20 min', 'Obligatoire : avoir 16 ans ou plus', 'Combinaisons et casques fournis']::text[], 48.9362, 2.3557),
('stand-up', 13, 'Le Comedy Club', '1 place achetée = 1 place offerte', 'activite', 'Activité', '🎤', 'from-violet-600 to-purple-400', 5, '3.7 km', '2 pour 1', NULL, '42 Rue des Martyrs, 75009 Paris', ARRAY['1 place achetée = 1 place offerte', 'Valable sur tous les spectacles hors premium', 'Sur réservation en ligne avec code INSOLIT']::text[], 48.8809, 2.3397),
('yoga', 14, 'Yoga Studio Zen', '3 séances découverte à 15€', 'activite', 'Activité', '🧘', 'from-pink-400 to-purple-500', 5, '0.7 km', 'Promo', NULL, '9 Rue de la Roquette, 75011 Paris', ARRAY['3 séances de yoga au choix pour 15€', 'Hatha, Vinyasa ou Yin yoga', 'Tapis et accessoires fournis', 'Valable pour nouveaux membres uniquement']::text[], 48.8531, 2.3713),
('box-surprise', 15, 'Box Surprise Insolit', 'Box cadeau mystère à 9.99€', 'cadeau', 'Cadeau', '🎁', 'from-pink-500 to-orange-400', 5, '—', 'Exclusif', NULL, NULL, ARRAY['Box mystère avec 5 cadeaux surprises', 'Valeur garantie minimum 30€', 'Livraison offerte en France métropolitaine', 'Personnalisable selon tes centres d''intérêt']::text[], NULL, NULL),
('bon-achat', 16, 'Bon d''achat Premium', '50€ d''achat pour 25€', 'cadeau', 'Cadeau', '💎', 'from-purple-600 to-blue-400', 4, '—', '-50%', NULL, NULL, ARRAY['50€ d''achat chez nos partenaires pour 25€', 'Valable dans + de 200 enseignes', 'Utilisable en 1 ou plusieurs fois', 'Validité 12 mois']::text[], NULL, NULL),
('coffret-bienetre', 17, 'Coffret Bien-être', 'Spa & massage 1h offert', 'cadeau', 'Cadeau', '🌟', 'from-teal-400 to-yellow-300', 5, '—', 'Offert', NULL, NULL, ARRAY['1h de massage suédois ou californien', 'Accès au spa inclus (piscine, sauna, hammam)', 'Valable dans 15 spas partenaires en France', 'Sur réservation, sous 6 mois']::text[], NULL, NULL),
('gaming-night', 18, 'Gaming Night VIP', 'Soirée jeux vidéo privatisée', 'cadeau', 'Cadeau', '🎮', 'from-indigo-600 to-purple-500', 4, '—', 'VIP', NULL, NULL, ARRAY['3h de gaming en salle privée pour 4 personnes', 'Accès aux dernières consoles (PS5, Xbox, VR)', 'Boissons et snacks inclus', 'Réservation 72h à l''avance']::text[], NULL, NULL),
('livre-personnalise', 19, 'Livre Photo Personnalisé', 'Album photo 40 pages à -60%', 'cadeau', 'Cadeau', '📚', 'from-amber-400 to-rose-400', 4, '—', '-60%', NULL, NULL, ARRAY['Album photo 20x20cm, 40 pages', 'Couverture rigide personnalisée', '-60% sur le tarif standard', 'Livraison en 5 à 7 jours ouvrés']::text[], NULL, NULL),
('cours-cuisine', 20, 'Atelier Cuisine Chef', 'Cours de cuisine gastronomique à 2', 'cadeau', 'Cadeau', '👨‍🍳', 'from-orange-400 to-red-400', 5, '—', 'Promo', NULL, '30 Rue du Bac, 75007 Paris', ARRAY['2h de cours de cuisine avec un chef étoilé', 'Repas dégusté à la fin de l''atelier', 'Pour 2 personnes', 'Sur réservation avec code INSOLIT']::text[], 48.8566, 2.3274),
('basic-fit', 21, 'Basic Fit Fitness', 'Séance découverte gratuite', 'sport', 'Sport', '🏋️', 'from-green-500 to-purple-600', 4, '0.5 km', 'Gratuit', NULL, '55 Av. d''Italie, 75013 Paris', ARRAY['1 séance découverte gratuite sans engagement', 'Accès à toutes les machines', 'Cours collectifs inclus', 'Valable pour les nouveaux membres uniquement']::text[], 48.8275, 2.3564),
('padel', 22, 'Padel Club Paris', '1h de padel à 2 pour 10€', 'sport', 'Sport', '🎾', 'from-yellow-400 to-green-500', 4, '2.3 km', '-50%', NULL, '18 Rue du Stade, 75019 Paris', ARRAY['1h de terrain de padel pour 2 joueurs à 10€', 'Raquettes disponibles à la location', 'Valable en semaine avant 17h']::text[], 48.8789, 2.3986),
('piscine', 23, 'Aquacentre Marne', 'Entrée piscine + accès aquagym', 'sport', 'Sport', '🏊', 'from-blue-400 to-cyan-400', 3, '1.2 km', '-30%', NULL, '2 Rue du Lac, 94000 Créteil', ARRAY['Entrée piscine Olympic + cours d''aquagym', '-30% sur le tarif plein', 'Casier et serviette inclus', 'Valable le week-end uniquement']::text[], 48.7898, 2.4596),
('cinema-gaumont', 24, 'Cinéma Gaumont', 'Place de cinéma à 5€', 'cinema', 'Cinéma', '🎬', 'from-pink-600 to-purple-600', 4, '0.8 km', '-50%', NULL, '74 Av. des Champs-Élysées, 75008 Paris', ARRAY['Place de cinéma à 5€ toutes séances', 'Valable en semaine avant 17h', 'Hors avant-premières et films 3D']::text[], 48.8706, 2.3071),
('mk2', 25, 'MK2 Quai de Seine', 'Soirée ciné : 2 places + 2 boissons', 'cinema', 'Cinéma', '🍿', 'from-red-500 to-pink-400', 5, '3.1 km', 'Pack', NULL, '14 Quai de la Seine, 75019 Paris', ARRAY['2 places de cinéma + 2 boissons au choix', 'Valable tous les jours', 'Hors avant-premières et événements spéciaux']::text[], 48.8842, 2.3697)
ON CONFLICT (id) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  category_label = EXCLUDED.category_label,
  emoji = EXCLUDED.emoji,
  gradient = EXCLUDED.gradient,
  rating = EXCLUDED.rating,
  distance = EXCLUDED.distance,
  badge = EXCLUDED.badge,
  price = EXCLUDED.price,
  address = EXCLUDED.address,
  details = EXCLUDED.details,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

INSERT INTO public.features (
  sort_order,
  icon,
  gradient,
  title,
  description
)
VALUES
(1, '🎯', 'from-pink-500 to-orange-400', 'Des réductions et certains prix adulte', 'Profite de tarifs préférentiels dans des centaines d''enseignes partenaires près de chez toi.'),
(2, '⚡', 'from-orange-500 to-yellow-400', 'Des activités Insolites faire maintenant', 'Réserve des expériences uniques et mémorables disponibles immédiatement autour de toi.'),
(3, '🎁', 'from-purple-600 to-pink-500', 'Des cadeaux et offres exclusives', 'Découvre des cadeaux personnalisés et des offres exclusives réservées aux membres Insolit.'),
(4, '🗺️', 'from-teal-400 to-blue-400', 'Explore et découvre autour de toi', 'Visualise toutes les offres sur une carte interactive et repère les bons plans du quartier.')
ON CONFLICT (sort_order) DO UPDATE SET
  icon = EXCLUDED.icon,
  gradient = EXCLUDED.gradient,
  title = EXCLUDED.title,
  description = EXCLUDED.description;

INSERT INTO public.steps (
  id,
  sort_order,
  emoji,
  title,
  description
)
VALUES
(1, 1, '📲', 'Trouve ton offre', 'Parcours les centaines d''offres disponibles près de chez toi par catégorie ou sur la carte.'),
(2, 2, '🔍', 'Sélectionne un bon plan', 'Choisis l''offre qui te correspond parmi restaurants, activités, cadeaux et bien plus.'),
(3, 3, '✅', 'Réclame ton offre', 'Active ton bon plan directement depuis l''app et présente-le au partenaire en quelques secondes.'),
(4, 4, '🎉', 'Profite et partage', 'Vis l''expérience, partage ton avis et accumule des badges pour débloquer encore plus d''avantages.')
ON CONFLICT (id) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  emoji = EXCLUDED.emoji,
  title = EXCLUDED.title,
  description = EXCLUDED.description;

INSERT INTO public.testimonials (
  id,
  sort_order,
  name,
  role,
  avatar,
  gradient,
  rating,
  text
)
VALUES
(1, 1, 'Sophie L.', 'Étudiante, Paris', 'SL', 'from-pink-500 to-orange-400', 5, '"Insolit a changé ma façon de sortir. Je découvre des endroits incroyables à des prix imbattables !"'),
(2, 2, 'Thomas M.', 'Développeur, Lyon', 'TM', 'from-purple-600 to-blue-400', 5, '"J''utilise Insolit chaque semaine. Les offres restaurants sont juste top, ça m''économise un max !"'),
(3, 3, 'Amina B.', 'Designer, Marseille', 'AB', 'from-teal-400 to-yellow-300', 4, '"Super pratique, l''interface est intuitive et les offres sont vraiment intéressantes. Je recommande !"')
ON CONFLICT (id) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  avatar = EXCLUDED.avatar,
  gradient = EXCLUDED.gradient,
  rating = EXCLUDED.rating,
  text = EXCLUDED.text;
