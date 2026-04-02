-- Seed data migrated from legacy static dataset in lib/data.ts

TRUNCATE TABLE
  public.offer_redemptions,
  public.favorites,
  public.partner_reviews,
  public.offers,
  public.partners,
  public.features,
  public.steps,
  public.testimonials
RESTART IDENTITY CASCADE;

-- =========================================================
-- Partners
-- =========================================================

INSERT INTO public.partners (
  id,
  brand_name,
  branch_name,
  display_name,
  category,
  address,
  city,
  latitude,
  longitude,
  logo_url,
  cover_image_url,
  why_subscribe_text,
  how_to_use_text,
  is_active
)
VALUES
('11111111-1111-1111-1111-111111111001', 'KFC', 'Villiers-sur-Marne', 'KFC Villiers-sur-Marne', 'restaurant', '12 Av. du Général de Gaulle, 94350 Villiers-sur-Marne', 'Villiers-sur-Marne', 48.8284, 2.5423, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111002', 'Pizza Palace', 'Paris 1', 'Pizza Palace', 'restaurant', '5 Rue de la Paix, 75001 Paris', 'Paris', 48.8694, 2.3314, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111003', 'Phở Saïgon', 'Paris 4', 'Phở Saïgon', 'restaurant', '22 Rue du Temple, 75004 Paris', 'Paris', 48.8575, 2.3523, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111004', 'Sushi Corner', 'Paris 9', 'Sushi Corner', 'restaurant', '8 Bd Haussmann, 75009 Paris', 'Paris', 48.8740, 2.3389, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111005', 'Burger King', 'La Marne', 'Burger King La Marne', 'restaurant', '3 Centre Commercial, 94100 Saint-Maur-des-Fossés', 'Saint-Maur-des-Fossés', 48.7987, 2.4986, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111006', 'Le Petit Bistrot', 'Mouffetard', 'Le Petit Bistrot', 'restaurant', '14 Rue Mouffetard, 75005 Paris', 'Paris', 48.8423, 2.3503, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111007', 'Escape Game Paris', 'Paris 11', 'Escape Game Paris', 'activite', '18 Rue du Faubourg Saint-Antoine, 75011 Paris', 'Paris', 48.8531, 2.3731, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111008', 'Bowling Show', 'Paris 17', 'Bowling Show', 'activite', '45 Av. de Clichy, 75017 Paris', 'Paris', 48.8862, 2.3195, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111009', 'Laser Game Évasion', 'Paris 1', 'Laser Game Évasion', 'activite', '77 Rue de Rivoli, 75001 Paris', 'Paris', 48.8600, 2.3422, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111010', 'Paintball Xtreme', 'Montreuil', 'Paintball Xtreme', 'activite', '2 Allée des Sports, 93100 Montreuil', 'Montreuil', 48.8639, 2.4403, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111011', 'Forest Adventure', 'Vincennes', 'Forest Adventure', 'activite', 'Forêt de Vincennes, 75012 Paris', 'Paris', 48.8374, 2.4288, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111012', 'Speed Karting', 'Saint-Denis', 'Speed Karting', 'activite', '25 Rue de l''Industrie, 93200 Saint-Denis', 'Saint-Denis', 48.9362, 2.3557, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111013', 'Le Comedy Club', 'Paris 9', 'Le Comedy Club', 'activite', '42 Rue des Martyrs, 75009 Paris', 'Paris', 48.8809, 2.3397, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111014', 'Yoga Studio Zen', 'Paris 11', 'Yoga Studio Zen', 'activite', '9 Rue de la Roquette, 75011 Paris', 'Paris', 48.8531, 2.3713, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111015', 'Box Surprise Insolit', 'Online', 'Box Surprise Insolit', 'cadeau', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111016', 'Bon d''achat Premium', 'Online', 'Bon d''achat Premium', 'cadeau', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111017', 'Coffret Bien-être', 'France', 'Coffret Bien-être', 'cadeau', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111018', 'Gaming Night VIP', 'Online', 'Gaming Night VIP', 'cadeau', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111019', 'Livre Photo Personnalisé', 'Online', 'Livre Photo Personnalisé', 'cadeau', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111020', 'Atelier Cuisine Chef', 'Paris 7', 'Atelier Cuisine Chef', 'cadeau', '30 Rue du Bac, 75007 Paris', 'Paris', 48.8566, 2.3274, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111021', 'Basic Fit Fitness', 'Paris 13', 'Basic Fit Fitness', 'sport', '55 Av. d''Italie, 75013 Paris', 'Paris', 48.8275, 2.3564, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111022', 'Padel Club Paris', 'Paris 19', 'Padel Club Paris', 'sport', '18 Rue du Stade, 75019 Paris', 'Paris', 48.8789, 2.3986, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111023', 'Aquacentre Marne', 'Créteil', 'Aquacentre Marne', 'sport', '2 Rue du Lac, 94000 Créteil', 'Créteil', 48.7898, 2.4596, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111024', 'Cinéma Gaumont', 'Champs-Élysées', 'Cinéma Gaumont', 'cinema', '74 Av. des Champs-Élysées, 75008 Paris', 'Paris', 48.8706, 2.3071, NULL, NULL, NULL, NULL, TRUE),
('11111111-1111-1111-1111-111111111025', 'MK2', 'Quai de Seine', 'MK2 Quai de Seine', 'cinema', '14 Quai de la Seine, 75019 Paris', 'Paris', 48.8842, 2.3697, NULL, NULL, NULL, NULL, TRUE)
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  branch_name = EXCLUDED.branch_name,
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Offers
-- =========================================================

INSERT INTO public.offers (
  id,
  partner_id,
  sort_order,
  title,
  description,
  offer_type,
  category,
  category_label,
  emoji,
  gradient,
  rating,
  badge,
  price,
  details,
  is_limited,
  is_active
)
VALUES
('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111001', 1, 'KFC Villiers-sur-Marne', '1 burger Colonel acheté + 1 offert', 'promotion', 'restaurant', 'Restaurant', 'KFC', 'from-red-700 to-orange-500', 4, 'Gratuit', NULL, ARRAY['1 burger Colonel acheté + 1 burger Colonel offert', 'Valable du lundi au vendredi, hors jours fériés', 'Non cumulable avec d''autres offres', 'Sur présentation du bon Insolit']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111002', 2, 'Pizza Palace', 'Pizza XL au prix d''une Medium', 'promotion', 'restaurant', 'Restaurant', '🍕', 'from-orange-500 to-yellow-400', 4, '-40%', NULL, ARRAY['Pizza XL au prix d''une Medium', 'Sur toute la carte hors promotions', 'Valable 7j/7', 'Sur présentation du bon Insolit']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111003', 3, 'Phở Saïgon', 'Menu complet à -30%', 'promotion', 'restaurant', 'Restaurant', '🍜', 'from-blue-700 to-blue-400', 5, NULL, NULL, ARRAY['-30% sur le menu entrée + plat + dessert', 'Valable du mardi au dimanche', 'Hors boissons alcoolisées']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111004', 4, 'Sushi Corner', 'Plateau 32 pièces à 15€', 'promotion', 'restaurant', 'Restaurant', '🍣', 'from-teal-500 to-blue-600', 4, '-50%', NULL, ARRAY['Plateau 32 pièces mixtes à 15€ au lieu de 30€', 'Valable le midi uniquement', 'Sur réservation ou sur place']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222005', '11111111-1111-1111-1111-111111111005', 5, 'Burger King La Marne', 'Menu King au prix du menu Simple', 'promotion', 'restaurant', 'Restaurant', '🍔', 'from-yellow-500 to-red-500', 4, '-20%', NULL, ARRAY['Menu King Deluxe au prix du menu Classic', 'Boisson + dessert inclus', 'Valable du lundi au vendredi']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222006', '11111111-1111-1111-1111-111111111006', 6, 'Le Petit Bistrot', 'Plat du jour + café offert', 'promotion', 'restaurant', 'Restaurant', '🥘', 'from-amber-600 to-orange-400', 5, NULL, NULL, ARRAY['Plat du jour + café ou dessert offert', 'Carte changeant chaque semaine', 'Réservation recommandée le week-end']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222007', '11111111-1111-1111-1111-111111111007', 7, 'Escape Game Paris', '1h d''Escape Game à 2 pour 20€', 'promotion', 'activite', 'Activité', '🎯', 'from-purple-600 to-pink-500', 5, NULL, NULL, ARRAY['1h d''Escape Game à 2 personnes pour 20€', '10 scénarios au choix', 'Sur réservation uniquement', 'Valable tous les jours de 10h à 22h']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222008', '11111111-1111-1111-1111-111111111008', 8, 'Bowling Show', '1h de bowling + location chaussures incluse', 'promotion', 'activite', 'Activité', '🎳', 'from-yellow-400 to-orange-500', 3, NULL, NULL, ARRAY['1h de bowling pour 2 personnes', 'Location de chaussures incluse', 'Valable en semaine avant 18h']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222009', '11111111-1111-1111-1111-111111111009', 9, 'Laser Game Évasion', '2 parties de Laser Game pour le prix d''1', 'promotion', 'activite', 'Activité', '🔫', 'from-cyan-500 to-blue-600', 4, '-50%', NULL, ARRAY['2 parties de Laser Game pour le prix d''1', 'Équipement fourni', 'Pour groupes de 4 personnes minimum', 'Sur réservation']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222010', '11111111-1111-1111-1111-111111111010', 10, 'Paintball Xtreme', '100 billes offertes pour toute session', 'promotion', 'activite', 'Activité', '🎪', 'from-green-600 to-teal-500', 4, 'Bonus', NULL, ARRAY['100 billes offertes en plus par joueur', 'Équipement complet fourni', 'Minimum 6 joueurs', 'Réservation 48h à l''avance']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222011', '11111111-1111-1111-1111-111111111011', 11, 'Forest Adventure', 'Accrobranche : enfant gratuit pour 1 adulte payant', 'promotion', 'activite', 'Activité', '🌲', 'from-green-500 to-emerald-700', 5, '1 offert', NULL, ARRAY['1 enfant gratuit pour 1 adulte payant', 'Parcours adapté à tous niveaux', 'Casques et équipements fournis', 'Ouvert le week-end et vacances scolaires']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222012', '11111111-1111-1111-1111-111111111012', 12, 'Speed Karting', '10 minutes de karting offertes', 'promotion', 'activite', 'Activité', '🏎️', 'from-red-500 to-yellow-400', 4, 'Bonus', NULL, ARRAY['10 min offertes pour toute session de 20 min', 'Obligatoire : avoir 16 ans ou plus', 'Combinaisons et casques fournis']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222013', '11111111-1111-1111-1111-111111111013', 13, 'Le Comedy Club', '1 place achetée = 1 place offerte', 'promotion', 'activite', 'Activité', '🎤', 'from-violet-600 to-purple-400', 5, '2 pour 1', NULL, ARRAY['1 place achetée = 1 place offerte', 'Valable sur tous les spectacles hors premium', 'Sur réservation en ligne avec code INSOLIT']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222014', '11111111-1111-1111-1111-111111111014', 14, 'Yoga Studio Zen', '3 séances découverte à 15€', 'promotion', 'activite', 'Activité', '🧘', 'from-pink-400 to-purple-500', 5, 'Promo', NULL, ARRAY['3 séances de yoga au choix pour 15€', 'Hatha, Vinyasa ou Yin yoga', 'Tapis et accessoires fournis', 'Valable pour nouveaux membres uniquement']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222015', '11111111-1111-1111-1111-111111111015', 15, 'Box Surprise Insolit', 'Box cadeau mystère à 9.99€', 'cadeau', 'cadeau', 'Cadeau', '🎁', 'from-pink-500 to-orange-400', 5, 'Exclusif', NULL, ARRAY['Box mystère avec 5 cadeaux surprises', 'Valeur garantie minimum 30€', 'Livraison offerte en France métropolitaine', 'Personnalisable selon tes centres d''intérêt']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222016', '11111111-1111-1111-1111-111111111016', 16, 'Bon d''achat Premium', '50€ d''achat pour 25€', 'cadeau', 'cadeau', 'Cadeau', '💎', 'from-purple-600 to-blue-400', 4, '-50%', NULL, ARRAY['50€ d''achat chez nos partenaires pour 25€', 'Valable dans + de 200 enseignes', 'Utilisable en 1 ou plusieurs fois', 'Validité 12 mois']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222017', '11111111-1111-1111-1111-111111111017', 17, 'Coffret Bien-être', 'Spa & massage 1h offert', 'cadeau', 'cadeau', 'Cadeau', '🌟', 'from-teal-400 to-yellow-300', 5, 'Offert', NULL, ARRAY['1h de massage suédois ou californien', 'Accès au spa inclus (piscine, sauna, hammam)', 'Valable dans 15 spas partenaires en France', 'Sur réservation, sous 6 mois']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222018', '11111111-1111-1111-1111-111111111018', 18, 'Gaming Night VIP', 'Soirée jeux vidéo privatisée', 'cadeau', 'cadeau', 'Cadeau', '🎮', 'from-indigo-600 to-purple-500', 4, 'VIP', NULL, ARRAY['3h de gaming en salle privée pour 4 personnes', 'Accès aux dernières consoles (PS5, Xbox, VR)', 'Boissons et snacks inclus', 'Réservation 72h à l''avance']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222019', '11111111-1111-1111-1111-111111111019', 19, 'Livre Photo Personnalisé', 'Album photo 40 pages à -60%', 'cadeau', 'cadeau', 'Cadeau', '📚', 'from-amber-400 to-rose-400', 4, '-60%', NULL, ARRAY['Album photo 20x20cm, 40 pages', 'Couverture rigide personnalisée', '-60% sur le tarif standard', 'Livraison en 5 à 7 jours ouvrés']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222020', '11111111-1111-1111-1111-111111111020', 20, 'Atelier Cuisine Chef', 'Cours de cuisine gastronomique à 2', 'cadeau', 'cadeau', 'Cadeau', '👨‍🍳', 'from-orange-400 to-red-400', 5, 'Promo', NULL, ARRAY['2h de cours de cuisine avec un chef étoilé', 'Repas dégusté à la fin de l''atelier', 'Pour 2 personnes', 'Sur réservation avec code INSOLIT']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222021', '11111111-1111-1111-1111-111111111021', 21, 'Basic Fit Fitness', 'Séance découverte gratuite', 'promotion', 'sport', 'Sport', '🏋️', 'from-green-500 to-purple-600', 4, 'Gratuit', NULL, ARRAY['1 séance découverte gratuite sans engagement', 'Accès à toutes les machines', 'Cours collectifs inclus', 'Valable pour les nouveaux membres uniquement']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222022', '11111111-1111-1111-1111-111111111022', 22, 'Padel Club Paris', '1h de padel à 2 pour 10€', 'promotion', 'sport', 'Sport', '🎾', 'from-yellow-400 to-green-500', 4, '-50%', NULL, ARRAY['1h de terrain de padel pour 2 joueurs à 10€', 'Raquettes disponibles à la location', 'Valable en semaine avant 17h']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222023', '11111111-1111-1111-1111-111111111023', 23, 'Aquacentre Marne', 'Entrée piscine + accès aquagym', 'promotion', 'sport', 'Sport', '🏊', 'from-blue-400 to-cyan-400', 3, '-30%', NULL, ARRAY['Entrée piscine Olympic + cours d''aquagym', '-30% sur le tarif plein', 'Casier et serviette inclus', 'Valable le week-end uniquement']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222024', '11111111-1111-1111-1111-111111111024', 24, 'Cinéma Gaumont', 'Place de cinéma à 5€', 'promotion', 'cinema', 'Cinéma', '🎬', 'from-pink-600 to-purple-600', 4, '-50%', NULL, ARRAY['Place de cinéma à 5€ toutes séances', 'Valable en semaine avant 17h', 'Hors avant-premières et films 3D']::text[], FALSE, TRUE),
('22222222-2222-2222-2222-222222222025', '11111111-1111-1111-1111-111111111025', 25, 'MK2 Quai de Seine', 'Soirée ciné : 2 places + 2 boissons', 'promotion', 'cinema', 'Cinéma', '🍿', 'from-red-500 to-pink-400', 5, 'Pack', NULL, ARRAY['2 places de cinéma + 2 boissons au choix', 'Valable tous les jours', 'Hors avant-premières et événements spéciaux']::text[], FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  partner_id = EXCLUDED.partner_id,
  sort_order = EXCLUDED.sort_order,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  offer_type = EXCLUDED.offer_type,
  category = EXCLUDED.category,
  category_label = EXCLUDED.category_label,
  emoji = EXCLUDED.emoji,
  gradient = EXCLUDED.gradient,
  rating = EXCLUDED.rating,
  badge = EXCLUDED.badge,
  price = EXCLUDED.price,
  details = EXCLUDED.details,
  is_limited = EXCLUDED.is_limited,
  is_active = EXCLUDED.is_active;

-- =========================================================
-- Features
-- =========================================================

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

-- =========================================================
-- Steps
-- =========================================================

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

-- =========================================================
-- Testimonials
-- =========================================================

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