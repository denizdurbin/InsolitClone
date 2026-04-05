-- Seed data generated from legacy static dataset in lib/data.ts

TRUNCATE TABLE
  public.favorites,
  public.offers,
  public.partners,
  public.features,
  public.steps,
  public.testimonials
RESTART IDENTITY CASCADE;

INSERT INTO public.partners (
  id,
  name,
  emoji,
  address,
  latitude,
  longitude,
  google_maps_link
)
VALUES
('kfc-villiers', 'KFC Villiers-sur-Marne', 'KFC', '12 Av. du Général de Gaulle, 94350 Villiers-sur-Marne', 48.8284, 2.5423, 'https://www.google.com/maps/search/?api=1&query=48.8284,2.5423'),
('pizza-palace', 'Pizza Palace', '🍕', '5 Rue de la Paix, 75001 Paris', 48.8694, 2.3314, 'https://www.google.com/maps/search/?api=1&query=48.8694,2.3314'),
('pho-saigon', 'Phở Saïgon', '🍜', '22 Rue du Temple, 75004 Paris', 48.8575, 2.3523, 'https://www.google.com/maps/search/?api=1&query=48.8575,2.3523'),
('sushi-corner', 'Sushi Corner', '🍣', '8 Bd Haussmann, 75009 Paris', 48.874, 2.3389, 'https://www.google.com/maps/search/?api=1&query=48.874,2.3389'),
('burger-king-marne', 'Burger King La Marne', '🍔', '3 Centre Commercial, 94100 Saint-Maur-des-Fossés', 48.7987, 2.4986, 'https://www.google.com/maps/search/?api=1&query=48.7987,2.4986'),
('le-petit-bistrot', 'Le Petit Bistrot', '🥘', '14 Rue Mouffetard, 75005 Paris', 48.8423, 2.3503, 'https://www.google.com/maps/search/?api=1&query=48.8423,2.3503'),
('escape-game', 'Escape Game Paris', '🎯', '18 Rue du Faubourg Saint-Antoine, 75011 Paris', 48.8531, 2.3731, 'https://www.google.com/maps/search/?api=1&query=48.8531,2.3731'),
('bowling-show', 'Bowling Show', '🎳', '45 Av. de Clichy, 75017 Paris', 48.8862, 2.3195, 'https://www.google.com/maps/search/?api=1&query=48.8862,2.3195'),
('laser-game', 'Laser Game Évasion', '🔫', '77 Rue de Rivoli, 75001 Paris', 48.86, 2.3422, 'https://www.google.com/maps/search/?api=1&query=48.86,2.3422'),
('paintball', 'Paintball Xtreme', '🎪', '2 Allée des Sports, 93100 Montreuil', 48.8639, 2.4403, 'https://www.google.com/maps/search/?api=1&query=48.8639,2.4403'),
('accrobranche', 'Forest Adventure', '🌲', 'Forêt de Vincennes, 75012 Paris', 48.8374, 2.4288, 'https://www.google.com/maps/search/?api=1&query=48.8374,2.4288'),
('karting', 'Speed Karting', '🏎️', '25 Rue de l''Industrie, 93200 Saint-Denis', 48.9362, 2.3557, 'https://www.google.com/maps/search/?api=1&query=48.9362,2.3557'),
('stand-up', 'Le Comedy Club', '🎤', '42 Rue des Martyrs, 75009 Paris', 48.8809, 2.3397, 'https://www.google.com/maps/search/?api=1&query=48.8809,2.3397'),
('yoga', 'Yoga Studio Zen', '🧘', '9 Rue de la Roquette, 75011 Paris', 48.8531, 2.3713, 'https://www.google.com/maps/search/?api=1&query=48.8531,2.3713'),
('box-surprise', 'Box Surprise Insolit', '🎁', NULL, NULL, NULL, NULL),
('bon-achat', 'Bon d''achat Premium', '💎', NULL, NULL, NULL, NULL),
('coffret-bienetre', 'Coffret Bien-être', '🌟', NULL, NULL, NULL, NULL),
('gaming-night', 'Gaming Night VIP', '🎮', NULL, NULL, NULL, NULL),
('livre-personnalise', 'Livre Photo Personnalisé', '📚', NULL, NULL, NULL, NULL),
('cours-cuisine', 'Atelier Cuisine Chef', '👨‍🍳', '30 Rue du Bac, 75007 Paris', 48.8566, 2.3274, 'https://www.google.com/maps/search/?api=1&query=48.8566,2.3274'),
('basic-fit', 'Basic Fit Fitness', '🏋️', '55 Av. d''Italie, 75013 Paris', 48.8275, 2.3564, 'https://www.google.com/maps/search/?api=1&query=48.8275,2.3564'),
('padel', 'Padel Club Paris', '🎾', '18 Rue du Stade, 75019 Paris', 48.8789, 2.3986, 'https://www.google.com/maps/search/?api=1&query=48.8789,2.3986'),
('piscine', 'Aquacentre Marne', '🏊', '2 Rue du Lac, 94000 Créteil', 48.7898, 2.4596, 'https://www.google.com/maps/search/?api=1&query=48.7898,2.4596'),
('cinema-gaumont', 'Cinéma Gaumont', '🎬', '74 Av. des Champs-Élysées, 75008 Paris', 48.8706, 2.3071, 'https://www.google.com/maps/search/?api=1&query=48.8706,2.3071'),
('mk2', 'MK2 Quai de Seine', '🍿', '14 Quai de la Seine, 75019 Paris', 48.8842, 2.3697, 'https://www.google.com/maps/search/?api=1&query=48.8842,2.3697')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  google_maps_link = EXCLUDED.google_maps_link;

INSERT INTO public.offers (
  id,
  partner_id,
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
  details
)
VALUES
('kfc-villiers', 'kfc-villiers', 1, 'KFC Villiers-sur-Marne', '1 burger Colonel acheté + 1 offert', 'restaurant', 'Restaurant', 'KFC', 'from-red-700 to-orange-500', 4, '0.3 km', 'Gratuit', NULL, ARRAY['1 burger Colonel acheté + 1 burger Colonel offert', 'Valable du lundi au vendredi, hors jours fériés', 'Non cumulable avec d''autres offres', 'Sur présentation du bon Insolit']::text[]),
('pizza-palace', 'pizza-palace', 2, 'Pizza Palace', 'Pizza XL au prix d''une Medium', 'restaurant', 'Restaurant', '🍕', 'from-orange-500 to-yellow-400', 4, '0.6 km', '-40%', NULL, ARRAY['Pizza XL au prix d''une Medium', 'Sur toute la carte hors promotions', 'Valable 7j/7', 'Sur présentation du bon Insolit']::text[]),
('pho-saigon', 'pho-saigon', 3, 'Phở Saïgon', 'Menu complet à -30%', 'restaurant', 'Restaurant', '🍜', 'from-blue-700 to-blue-400', 5, '1.1 km', NULL, NULL, ARRAY['-30% sur le menu entrée + plat + dessert', 'Valable du mardi au dimanche', 'Hors boissons alcoolisées']::text[]),
('sushi-corner', 'sushi-corner', 4, 'Sushi Corner', 'Plateau 32 pièces à 15€', 'restaurant', 'Restaurant', '🍣', 'from-teal-500 to-blue-600', 4, '1.4 km', '-50%', NULL, ARRAY['Plateau 32 pièces mixtes à 15€ au lieu de 30€', 'Valable le midi uniquement', 'Sur réservation ou sur place']::text[]),
('burger-king-marne', 'burger-king-marne', 5, 'Burger King La Marne', 'Menu King au prix du menu Simple', 'restaurant', 'Restaurant', '🍔', 'from-yellow-500 to-red-500', 4, '1.8 km', '-20%', NULL, ARRAY['Menu King Deluxe au prix du menu Classic', 'Boisson + dessert inclus', 'Valable du lundi au vendredi']::text[]),
('le-petit-bistrot', 'le-petit-bistrot', 6, 'Le Petit Bistrot', 'Plat du jour + café offert', 'restaurant', 'Restaurant', '🥘', 'from-amber-600 to-orange-400', 5, '0.9 km', NULL, NULL, ARRAY['Plat du jour + café ou dessert offert', 'Carte changeant chaque semaine', 'Réservation recommandée le week-end']::text[]),
('escape-game', 'escape-game', 7, 'Escape Game Paris', '1h d''Escape Game à 2 pour 20€', 'activite', 'Activité', '🎯', 'from-purple-600 to-pink-500', 5, '2.1 km', NULL, NULL, ARRAY['1h d''Escape Game à 2 personnes pour 20€', '10 scénarios au choix', 'Sur réservation uniquement', 'Valable tous les jours de 10h à 22h']::text[]),
('bowling-show', 'bowling-show', 8, 'Bowling Show', '1h de bowling + location chaussures incluse', 'activite', 'Activité', '🎳', 'from-yellow-400 to-orange-500', 3, '3.2 km', NULL, NULL, ARRAY['1h de bowling pour 2 personnes', 'Location de chaussures incluse', 'Valable en semaine avant 18h']::text[]),
('laser-game', 'laser-game', 9, 'Laser Game Évasion', '2 parties de Laser Game pour le prix d''1', 'activite', 'Activité', '🔫', 'from-cyan-500 to-blue-600', 4, '1.6 km', '-50%', NULL, ARRAY['2 parties de Laser Game pour le prix d''1', 'Équipement fourni', 'Pour groupes de 4 personnes minimum', 'Sur réservation']::text[]),
('paintball', 'paintball', 10, 'Paintball Xtreme', '100 billes offertes pour toute session', 'activite', 'Activité', '🎪', 'from-green-600 to-teal-500', 4, '5.4 km', 'Bonus', NULL, ARRAY['100 billes offertes en plus par joueur', 'Équipement complet fourni', 'Minimum 6 joueurs', 'Réservation 48h à l''avance']::text[]),
('accrobranche', 'accrobranche', 11, 'Forest Adventure', 'Accrobranche : enfant gratuit pour 1 adulte payant', 'activite', 'Activité', '🌲', 'from-green-500 to-emerald-700', 5, '8.2 km', '1 offert', NULL, ARRAY['1 enfant gratuit pour 1 adulte payant', 'Parcours adapté à tous niveaux', 'Casques et équipements fournis', 'Ouvert le week-end et vacances scolaires']::text[]),
('karting', 'karting', 12, 'Speed Karting', '10 minutes de karting offertes', 'activite', 'Activité', '🏎️', 'from-red-500 to-yellow-400', 4, '12 km', 'Bonus', NULL, ARRAY['10 min offertes pour toute session de 20 min', 'Obligatoire : avoir 16 ans ou plus', 'Combinaisons et casques fournis']::text[]),
('stand-up', 'stand-up', 13, 'Le Comedy Club', '1 place achetée = 1 place offerte', 'activite', 'Activité', '🎤', 'from-violet-600 to-purple-400', 5, '3.7 km', '2 pour 1', NULL, ARRAY['1 place achetée = 1 place offerte', 'Valable sur tous les spectacles hors premium', 'Sur réservation en ligne avec code INSOLIT']::text[]),
('yoga', 'yoga', 14, 'Yoga Studio Zen', '3 séances découverte à 15€', 'activite', 'Activité', '🧘', 'from-pink-400 to-purple-500', 5, '0.7 km', 'Promo', NULL, ARRAY['3 séances de yoga au choix pour 15€', 'Hatha, Vinyasa ou Yin yoga', 'Tapis et accessoires fournis', 'Valable pour nouveaux membres uniquement']::text[]),
('box-surprise', 'box-surprise', 15, 'Box Surprise Insolit', 'Box cadeau mystère à 9.99€', 'cadeau', 'Cadeau', '🎁', 'from-pink-500 to-orange-400', 5, '—', 'Exclusif', NULL, ARRAY['Box mystère avec 5 cadeaux surprises', 'Valeur garantie minimum 30€', 'Livraison offerte en France métropolitaine', 'Personnalisable selon tes centres d''intérêt']::text[]),
('bon-achat', 'bon-achat', 16, 'Bon d''achat Premium', '50€ d''achat pour 25€', 'cadeau', 'Cadeau', '💎', 'from-purple-600 to-blue-400', 4, '—', '-50%', NULL, ARRAY['50€ d''achat chez nos partenaires pour 25€', 'Valable dans + de 200 enseignes', 'Utilisable en 1 ou plusieurs fois', 'Validité 12 mois']::text[]),
('coffret-bienetre', 'coffret-bienetre', 17, 'Coffret Bien-être', 'Spa & massage 1h offert', 'cadeau', 'Cadeau', '🌟', 'from-teal-400 to-yellow-300', 5, '—', 'Offert', NULL, ARRAY['1h de massage suédois ou californien', 'Accès au spa inclus (piscine, sauna, hammam)', 'Valable dans 15 spas partenaires en France', 'Sur réservation, sous 6 mois']::text[]),
('gaming-night', 'gaming-night', 18, 'Gaming Night VIP', 'Soirée jeux vidéo privatisée', 'cadeau', 'Cadeau', '🎮', 'from-indigo-600 to-purple-500', 4, '—', 'VIP', NULL, ARRAY['3h de gaming en salle privée pour 4 personnes', 'Accès aux dernières consoles (PS5, Xbox, VR)', 'Boissons et snacks inclus', 'Réservation 72h à l''avance']::text[]),
('livre-personnalise', 'livre-personnalise', 19, 'Livre Photo Personnalisé', 'Album photo 40 pages à -60%', 'cadeau', 'Cadeau', '📚', 'from-amber-400 to-rose-400', 4, '—', '-60%', NULL, ARRAY['Album photo 20x20cm, 40 pages', 'Couverture rigide personnalisée', '-60% sur le tarif standard', 'Livraison en 5 à 7 jours ouvrés']::text[]),
('cours-cuisine', 'cours-cuisine', 20, 'Atelier Cuisine Chef', 'Cours de cuisine gastronomique à 2', 'cadeau', 'Cadeau', '👨‍🍳', 'from-orange-400 to-red-400', 5, '—', 'Promo', NULL, ARRAY['2h de cours de cuisine avec un chef étoilé', 'Repas dégusté à la fin de l''atelier', 'Pour 2 personnes', 'Sur réservation avec code INSOLIT']::text[]),
('basic-fit', 'basic-fit', 21, 'Basic Fit Fitness', 'Séance découverte gratuite', 'sport', 'Sport', '🏋️', 'from-green-500 to-purple-600', 4, '0.5 km', 'Gratuit', NULL, ARRAY['1 séance découverte gratuite sans engagement', 'Accès à toutes les machines', 'Cours collectifs inclus', 'Valable pour les nouveaux membres uniquement']::text[]),
('padel', 'padel', 22, 'Padel Club Paris', '1h de padel à 2 pour 10€', 'sport', 'Sport', '🎾', 'from-yellow-400 to-green-500', 4, '2.3 km', '-50%', NULL, ARRAY['1h de terrain de padel pour 2 joueurs à 10€', 'Raquettes disponibles à la location', 'Valable en semaine avant 17h']::text[]),
('piscine', 'piscine', 23, 'Aquacentre Marne', 'Entrée piscine + accès aquagym', 'sport', 'Sport', '🏊', 'from-blue-400 to-cyan-400', 3, '1.2 km', '-30%', NULL, ARRAY['Entrée piscine Olympic + cours d''aquagym', '-30% sur le tarif plein', 'Casier et serviette inclus', 'Valable le week-end uniquement']::text[]),
('cinema-gaumont', 'cinema-gaumont', 24, 'Cinéma Gaumont', 'Place de cinéma à 5€', 'cinema', 'Cinéma', '🎬', 'from-pink-600 to-purple-600', 4, '0.8 km', '-50%', NULL, ARRAY['Place de cinéma à 5€ toutes séances', 'Valable en semaine avant 17h', 'Hors avant-premières et films 3D']::text[]),
('mk2', 'mk2', 25, 'MK2 Quai de Seine', 'Soirée ciné : 2 places + 2 boissons', 'cinema', 'Cinéma', '🍿', 'from-red-500 to-pink-400', 5, '3.1 km', 'Pack', NULL, ARRAY['2 places de cinéma + 2 boissons au choix', 'Valable tous les jours', 'Hors avant-premières et événements spéciaux']::text[])
ON CONFLICT (id) DO UPDATE SET
  partner_id = EXCLUDED.partner_id,
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
  details = EXCLUDED.details;

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
INSERT INTO public.users (
  id,
  prenom,
  nom,
  email,
  password_hash,
  location,
  birth_date,
  savings_cents,
  offers_used,
  reviews_count
)
VALUES
('11111111-1111-1111-1111-111111111111', 'Sophie', 'Lemoine', 'sophie.demo@insolit.dev', NULL, 'Paris, France', '2006-04-12', 12850, 6, 2),
('22222222-2222-2222-2222-222222222222', 'Thomas', 'Martin', 'thomas.demo@insolit.dev', NULL, 'Lyon, France', '2005-11-03', 8420, 4, 1),
('33333333-3333-3333-3333-333333333333', 'Amina', 'Benali', 'amina.demo@insolit.dev', NULL, 'Marseille, France', '2007-02-18', 19000, 8, 3)
ON CONFLICT (id) DO UPDATE SET
  prenom = EXCLUDED.prenom,
  nom = EXCLUDED.nom,
  email = EXCLUDED.email,
  location = EXCLUDED.location,
  birth_date = EXCLUDED.birth_date,
  savings_cents = EXCLUDED.savings_cents,
  offers_used = EXCLUDED.offers_used,
  reviews_count = EXCLUDED.reviews_count;

INSERT INTO public.reviews (
  id,
  user_id,
  user_name_snapshot,
  user_email_snapshot,
  offer_id,
  offer_title_snapshot,
  rating,
  title,
  text
)
VALUES
(1, '11111111-1111-1111-1111-111111111111', 'Sophie Lemoine', 'sophie.demo@insolit.dev', 'kfc-villiers', 'KFC Villiers-sur-Marne', 5, 'Très bon plan', 'Super offre, le burger était délicieux et le service rapide.'),
(2, '22222222-2222-2222-2222-222222222222', 'Thomas Martin', 'thomas.demo@insolit.dev', 'escape-game', 'Escape Game Paris', 4, 'Expérience top', 'Très bonne expérience, je recommande pour une sortie entre amis.'),
(3, '33333333-3333-3333-3333-333333333333', 'Amina Benali', 'amina.demo@insolit.dev', 'cinema-gaumont', 'Cinéma Gaumont', 4, 'Parfait pour le prix', 'La place à 5€ est vraiment intéressante, facile à utiliser.')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  user_name_snapshot = EXCLUDED.user_name_snapshot,
  user_email_snapshot = EXCLUDED.user_email_snapshot,
  offer_id = EXCLUDED.offer_id,
  offer_title_snapshot = EXCLUDED.offer_title_snapshot,
  rating = EXCLUDED.rating,
  title = EXCLUDED.title,
  text = EXCLUDED.text;
