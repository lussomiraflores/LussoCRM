/**
 * LUSSO BEAUTY SALÓN — CONTROLADOR DEL CATÁLOGO VIRTUAL
 * Miraflores, Lima — WhatsApp: +51 971 988 386
 */

const LUSSO_PHONE = '51971988386';
const SALON_ADDRESS = 'Calle Berlín 481, Miraflores, Lima';

// Catálogo Enriquecido con Imágenes Profesionales 100% Exclusivas y Ficha Técnica
const LUSSO_SERVICES_CATALOG = [
  // --- 💅 MANICURE ---
  {
    id: 'srv-3',
    name: 'Manicure Gel UV (Esmaltado)',
    category: 'manicure',
    specialist: 'Cielo',
    price: 60,
    isFrom: false,
    duration: 60,
    bestSeller: true,
    badge: '⭐ Best Seller',
    image: './images/manicure_gel_uv.jpg',
    description: 'El servicio estrella de LUSSO. Esmaltado en gel con acabado nude o color a elección, curado bajo lámpara UV LED. Máximo brillo espejo que no se descascara durante 2 a 3 semanas.',
    includes: 'Limpieza de cutículas, limado anatómico, retiro de gel anterior y ritual con aceite nutritivo de cutícula.',
    recommendedFor: 'Ideal para quienes buscan uñas impecables por semanas sin preocuparse por retoques diarios.',
    aftercare: 'Evitar usar las uñas como herramientas y aplicar aceite de cutícula por las noches.'
  },
  {
    id: 'srv-4',
    name: 'Rubber Gel (Refuerzo)',
    category: 'manicure',
    specialist: 'Cielo',
    price: 80,
    isFrom: true,
    duration: 75,
    bestSeller: false,
    badge: '💎 Máxima Resistencia',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    description: 'Base de caucho (rubber base) densa y elástica con nivelación de ápice que aporta volumen y blindaje a las uñas naturales quebradizas sin necesidad de extensión.',
    includes: 'Manicure completa, nivelación con Rubber Gel, esmaltado al gusto y aceite de cutícula.',
    recommendedFor: 'Perfecto para clientas con uñas finas, estriadas o débiles que desean dejarlas crecer con fuerza.',
    aftercare: 'Mantenimiento recomendado cada 21 a 25 días.'
  },
  {
    id: 'srv-5',
    name: 'Uñas Acrílicas (Full Set)',
    category: 'manicure',
    specialist: 'Cielo',
    price: 100,
    isFrom: true,
    duration: 120,
    bestSeller: false,
    badge: '✨ Extensión & Largo',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    description: 'Extensión completa esculpida con polímero acrílico y monómero de alta gama. Esculpido arquitectónico en forma almendrada, cuadrada, coffin o stiletto con acabado impecable.',
    includes: 'Preparación profunda, extensión en tips o molde, limado de precisión y aceite nutritivo.',
    recommendedFor: 'Para lucir uñas largas, uniformes y súper estilizadas con total libertad de diseño.',
    aftercare: 'Realizar retoque de crecimiento cada 3 a 4 semanas.'
  },
  {
    id: 'srv-6',
    name: 'Uñas Polygel',
    category: 'manicure',
    specialist: 'Cielo',
    price: 100,
    isFrom: true,
    duration: 120,
    bestSeller: false,
    badge: '🌿 Ultra Ligero & Flexible',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    description: 'Lo mejor del acrílico y del gel en un solo producto. Extensión inodora, ultra ligera y flexible con acabado translúcido baby boomer o tono uniforme natural.',
    includes: 'Manicure previa, modelado con polygel hipoalergénico, acabado glossy y aceite de argán en cutículas.',
    recommendedFor: 'Clientas sensibles a los olores químicos que buscan ligereza y naturalidad extrema.',
    aftercare: 'Evitar agua excesivamente caliente en las primeras 24 horas.'
  },
  {
    id: 'srv-7',
    name: 'Manicure Tradicional (OPI)',
    category: 'manicure',
    specialist: 'Cielo',
    price: 45,
    isFrom: false,
    duration: 40,
    bestSeller: false,
    badge: '💅 Clásico OPI',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
    description: 'Cuidado clásico de manos y uñas con la prestigiosa línea de esmaltes profesionales OPI. Secado al aire sin exposición a lámpara UV.',
    includes: 'Limpieza de cutículas, limado anatómico, masaje hidratante con crema de manos y esmaltado OPI.',
    recommendedFor: 'Quienes prefieren cambiar de tono semanalmente desde la comodidad de su hogar.',
    aftercare: 'Dejar secar 20 minutos completos antes de manipular bolsos o llaves.'
  },
  {
    id: 'srv-2',
    name: 'Manicure Infinite Shine (OPI)',
    category: 'manicure',
    specialist: 'Cielo',
    price: 50,
    isFrom: false,
    duration: 45,
    bestSeller: false,
    badge: '✨ Efecto Gel Sin Lámpara',
    image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
    description: 'Sistema híbrido de esmaltado tradicional con tecnología ProStay de OPI. Proporciona hasta 11 días de brillo efecto gel con secado al aire y fácil remoción.',
    includes: 'Limpieza profunda, exfoliación suave, masaje de manos y top coat Infinite Shine de alto brillo.',
    recommendedFor: 'Clientas que desean duración prolongada sin necesidad de remoción con acetona pura.',
    aftercare: 'Usar guantes para tareas domésticas pesadas.'
  },
  {
    id: 'srv-1',
    name: 'Limpieza Manicure Express',
    category: 'manicure',
    specialist: 'Cielo',
    price: 35,
    isFrom: false,
    duration: 30,
    bestSeller: false,
    badge: '🌿 Higiene & Mantenimiento',
    image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=800&q=80',
    description: 'Protocolo higiénico para manos limpias, pulcras y cuidadas. Uñas naturales pulidas con brillo natural sin aplicación de esmalte.',
    includes: 'Desinfección, limado anatómico de forma y largo, retiro de cutículas, pulido y crema emoliente.',
    recommendedFor: 'Hombres, profesionales de la salud o clientas en descanso de esmalte.',
    aftercare: 'Mantener hidratadas las cutículas.'
  },

  // --- 🦶 PEDICURE ---
  {
    id: 'srv-8',
    name: 'Pedicure Premium (OPI ProSpa)',
    category: 'pedicure',
    specialist: 'Cielo',
    price: 70,
    isFrom: false,
    duration: 60,
    bestSeller: true,
    badge: '⭐ Best Seller Spa',
    image: './images/pedicure_spa.jpg',
    description: 'Experiencia relajante y restauradora para los pies con la gama de lujo OPI ProSpa. Suaviza talones agrietados en una tina tibia con pétalos y sales aromáticas.',
    includes: 'Baño de sales, gel removedor de callosidades OPI, exfoliación con cristales de azúcar, masaje relajante y esmaltado a elección.',
    recommendedFor: 'Pies cansados o talones resecos que necesitan recuperación total y suavidad aterciopelada.',
    aftercare: 'Aplicar crema humectante podológica antes de dormir.'
  },
  {
    id: 'srv-9',
    name: 'Pedicure Gel UV',
    category: 'pedicure',
    specialist: 'Cielo',
    price: 60,
    isFrom: false,
    duration: 50,
    bestSeller: false,
    badge: '💅 Brillo Duradero',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    description: 'Esmaltado en gel curado en lámpara en las uñas de los pies. Sal del salón lista con calzado cerrado sin riesgo de mancharte ni arruinar el esmalte.',
    includes: 'Limpieza de cutículas, limado podológico, esmaltado en gel de alta resistencia e hidratación profunda.',
    recommendedFor: 'Imprescindible para viajes, vacaciones o si usas calzado cerrado inmediatamente.',
    aftercare: 'Duración óptima de 3 a 5 semanas.'
  },
  {
    id: 'srv-10',
    name: 'Pedicure Tradicional (OPI)',
    category: 'pedicure',
    specialist: 'Cielo',
    price: 50,
    isFrom: false,
    duration: 45,
    bestSeller: false,
    badge: '🌿 Spa Clásico',
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80',
    description: 'Protocolo de belleza y frescura para los pies con sales minerales relajantes, exfoliación suave y esmaltado clásico OPI.',
    includes: 'Tina tibia con sales relajantes, limpieza de durezas leves, corte higiénico y esmaltado tradicional.',
    recommendedFor: 'Mantenimiento quincenal de pies sanos.',
    aftercare: 'Asistir con sandalias abiertas para el secado completo.'
  },

  // --- ✂️ CORTE & STYLING ---
  {
    id: 'srv-12',
    name: 'Corte Tradicional + Lavado & Masaje',
    category: 'corte',
    specialist: 'Kiara',
    price: 70,
    isFrom: false,
    duration: 45,
    bestSeller: true,
    badge: '⭐ Best Seller Capilar',
    image: './images/corte_cabello.jpg',
    description: 'Transformación o diseño de corte completo (bob, mariposa, capas largas, flequillos, desfilados). Diseñado por Kiara con tijeras profesionales según el movimiento de tu cabello.',
    includes: 'Lavado con champú orgánico, masaje capilar relajante, cepillado profesional y sellado con aceite de argán.',
    recommendedFor: 'Para renovar estilo, dar volumen, ligereza o eliminar cabello dañado manteniendo forma estética.',
    aftercare: 'Despuntar cada 2 a 3 meses para conservar la línea del corte.'
  },
  {
    id: 'srv-13',
    name: 'Corte Lusso (Asesoría de Imagen Visagística)',
    category: 'corte',
    specialist: 'Kiara',
    price: 80,
    isFrom: false,
    duration: 60,
    bestSeller: false,
    badge: '✨ Asesoría Personalizada',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
    description: 'Servicio exclusivo de diagnóstico capilar y asesoría visagística. Kiara analiza la morfología de tu rostro, textura del cabello y estilo de vida para diseñar el corte que más te favorece.',
    includes: 'Diagnóstico visagístico previo, lavado botánico, masaje capilar, corte de autor, brushing y ritual de argán.',
    recommendedFor: 'Quienes buscan un cambio de look acertado y asesorado por una especialista con criterio estético.',
    aftercare: 'Recomendaciones personalizadas de peinado para el día a día.'
  },
  {
    id: 'srv-11',
    name: 'Corte de Puntas Higiénico',
    category: 'corte',
    specialist: 'Kiara',
    price: 50,
    isFrom: false,
    duration: 30,
    bestSeller: false,
    badge: '🌿 Mantén tu Largo',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    description: 'Despunte técnico milimétrico con tijeras de precisión que elimina horquillas y puntas abiertas sin sacrificar el largo que tanto te costó hacer crecer.',
    includes: 'Lavado relajante, despunte de precisión, cepillado y gotas de aceite de argán puro.',
    recommendedFor: 'Cabellos largos en proceso de crecimiento o post-verano.',
    aftercare: 'Usar protector térmico antes de planchar o secar.'
  },
  {
    id: 'srv-23',
    name: 'Peinado Ondas / Trenzas Glam',
    category: 'corte',
    specialist: 'Kiara',
    price: 80,
    isFrom: false,
    duration: 50,
    bestSeller: false,
    badge: '✨ Eventos & Fiestas',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
    description: 'Peinados de gala, ondas al agua, sirena, ondas Hollywood o trenzas estilizadas para bodas, graduaciones, cócteles y sesiones de fotos.',
    includes: 'Texturizado térmico, fijadores profesionales invisibles (sin residuos pegajosos ni acartonados) y toque de brillo.',
    recommendedFor: 'Invitadas, novias, cumpleaños y celebraciones.',
    aftercare: 'Dura intacto durante toda la noche de evento.'
  },
  {
    id: 'srv-27',
    name: 'Cepillado / Brushing con Movimiento',
    category: 'corte',
    specialist: 'Kiara',
    price: 50,
    isFrom: true,
    duration: 40,
    bestSeller: false,
    badge: '💨 Volumen & Brillo',
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80',
    description: 'Brushing con secador profesional y cepillo redondo para dejar el cabello pulido, con volumen en la raíz, movimiento natural y cero frizz.',
    includes: 'Lavado con champú orgánico, protector térmico, secado con cepillo y acabado de argán.',
    recommendedFor: 'Reuniones de trabajo, salidas de fin de semana o mantenimiento semanal.',
    aftercare: 'Proteger de la humedad exterior.'
  },
  {
    id: 'srv-29',
    name: 'Planchado Liso Espejo',
    category: 'corte',
    specialist: 'Kiara',
    price: 60,
    isFrom: true,
    duration: 45,
    bestSeller: false,
    badge: '✨ Liso Impecable',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    description: 'Alisado térmico temporal con plancha de placas de titanio que sella la cutícula, dejando un efecto ultra lacio, reflectivo y suave como la seda.',
    includes: 'Lavado botánico, secado previo, termoprotección de alta gama y sérum antifrizz.',
    recommendedFor: 'Eventos o días en que quieras lucir un cabello impecablemente lacio y suave.',
    aftercare: 'Evitar atar con ligas que marquen el cabello.'
  },
  {
    id: 'srv-28',
    name: 'Lavado y Secado Express',
    category: 'corte',
    specialist: 'Kiara',
    price: 30,
    isFrom: false,
    duration: 25,
    bestSeller: false,
    badge: '🌿 Frescura Rápida',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    description: 'Lavado higiénico y relajante en bacha con champú purificante, acondicionador desenredante y secado manual.',
    includes: 'Champú botánico, acondicionador, masaje capilar y secado manual con aire tibio.',
    recommendedFor: 'Días apresurados después del gimnasio o antes de una salida casual.',
    aftercare: 'No requiere cuidados especiales.'
  },

  // --- 🎨 COLORIMETRÍA ---
  {
    id: 'srv-15',
    name: 'Mechas Morena Iluminada',
    category: 'color',
    specialist: 'Kiara',
    price: 199,
    isFrom: true,
    duration: 180,
    bestSeller: true,
    badge: '⭐ Tendencia 2026',
    image: './images/morena_iluminada.jpg',
    description: 'La técnica insignia para morenas y castañas. Aporta luz y dimensión con matices miel, avellana, chocolate cálido o caramelo sin el mantenimiento demandante de un rubio total.',
    includes: 'Diseño de mechas difuminadas, matiz gloss, mascarilla reestructurante, corte de puntas de cortesía y aceite de argán.',
    recommendedFor: 'Ideal para quienes quieren iluminar su rostro con naturalidad y sofisticación manteniendo una raíz baja en retoques.',
    aftercare: 'Usar champú libre de sulfatos y mascarilla nutritiva semanal.'
  },
  {
    id: 'srv-16',
    name: 'Mechas o Rubios Balayage / Babylights',
    category: 'color',
    specialist: 'Kiara',
    price: 299,
    isFrom: true,
    duration: 240,
    bestSeller: false,
    badge: '💎 Alta Especialización',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    description: 'Técnica de alta precisión y arte capilar para lograr rubios dorados, vainilla, perla o beige sin líneas marcadas y con transición perfecta desde la raíz.',
    includes: 'Decoloración con plex protector, diseño babylights/balayage, matiz neutralizador, tratamiento de nutrición profunda, corte de puntas y styling con ondas.',
    recommendedFor: 'Amantes del rubio luminoso y elegante con efecto degradé natural.',
    aftercare: 'Utilizar champú matizador violeta/azul 1 vez por semana y aceite nutritivo.'
  },
  {
    id: 'srv-14',
    name: 'Full Color (Tintes Alfaparf Milano)',
    category: 'color',
    specialist: 'Kiara',
    price: 180,
    isFrom: false,
    duration: 90,
    bestSeller: false,
    badge: '🎨 Brillo Italiano',
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
    description: 'Coloración global uniforme de raíz a puntas utilizando la prestigiosa línea italiana Alfaparf Evolution of the Color, rica en ácido hialurónico y aceites nutritivos.',
    includes: 'Aplicación técnica completa, lavado protector de color, masaje sellador, cepillado y acabado con ondas waves.',
    recommendedFor: 'Cambios de tono completo, intensificación de reflejos o unificación de tonos dispares.',
    aftercare: 'Lavar con agua templada a fría para prolongar la vivacidad del color.'
  },
  {
    id: 'srv-17',
    name: 'Retoque de Raíz (100% Cobertura)',
    category: 'color',
    specialist: 'Kiara',
    price: 80,
    isFrom: true,
    duration: 60,
    bestSeller: false,
    badge: '🌿 Cobertura de Canas',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    description: 'Aplicación localizada en la zona de crecimiento con brocha técnica para cubrir el 100% de canas o igualar el color base del cabello sin sobreprocesar las puntas.',
    includes: 'Tinte italiano Alfaparf en raíces, lavado con champú ácido sellador y peinado secado.',
    recommendedFor: 'Mantenimiento mensual para clientas con canas o raíz visible.',
    aftercare: 'Frecuencia sugerida: cada 3 a 4 semanas.'
  },
  {
    id: 'srv-18',
    name: 'Baño de Color / Matiz Express',
    category: 'color',
    specialist: 'Kiara',
    price: 100,
    isFrom: true,
    duration: 45,
    bestSeller: false,
    badge: '✨ Brillo & Revitalización',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
    description: 'Refresca el tono de mechas anteriores, elimina visos anaranjados o amarillentos y devuélvele un brillo de espejo al cabello sin decoloración agresiva.',
    includes: 'Matización en bacha con tóner sin amoníaco, lavado nutritivo y cepillado profesional.',
    recommendedFor: 'Revitalizar mechas entre coloraciones completas.',
    aftercare: 'Uso de protectores solares capilares en verano.'
  },
  {
    id: 'srv-24',
    name: 'Aplicación de Tinte (Cliente trae producto)',
    category: 'color',
    specialist: 'Kiara',
    price: 40,
    isFrom: true,
    duration: 45,
    bestSeller: false,
    badge: '🧴 Aplicación Pro',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    description: '¿Tienes tu tinte o fórmula dermatológica preferida? Kiara lo aplica con técnica profesional de salón, asegurando distribución homogénea y limpia.',
    includes: 'Seccionamiento técnico, aplicación uniforme con brocha, emulsión, lavado y aceite de argán.',
    recommendedFor: 'Clientas que compran fórmulas médicas o marcas exclusivas por su cuenta.',
    aftercare: 'Seguir instrucciones del fabricante de tu producto.'
  },

  // --- ✨ TRATAMIENTOS & ALISADOS ---
  {
    id: 'srv-19',
    name: 'Bótox Capilar / Bioplastía Profunda',
    category: 'tratamientos',
    specialist: 'Kiara',
    price: 150,
    isFrom: true,
    duration: 90,
    bestSeller: true,
    badge: '⭐ Restauración Total',
    image: './images/botox_capilar.jpg',
    description: 'Tratamiento intensivo con colágeno, aminoácidos y ácido hialurónico aplicado con brocha y vapor. Rellena las fisuras de la hebra porosa, elimina el frizz y devuelve la sedosidad perdida.',
    includes: 'Lavado anti-residuos, infusión de bioplastía con calor, sellado térmico y cepillado.',
    recommendedFor: 'Cabellos decolorados, quebradizos, opacos o con frizz rebelde que necesitan reparación inmediata.',
    aftercare: 'Lavar con champú libre de sal y sulfatos.'
  },
  {
    id: 'srv-22',
    name: 'Alisado Orgánico / Marroquí (Libre de Formol)',
    category: 'tratamientos',
    specialist: 'Kiara',
    price: 200,
    isFrom: true,
    duration: 180,
    bestSeller: true,
    badge: '🌿 100% Libre de Formol',
    image: './images/alisado_organico.jpg',
    description: 'Lacio natural, disciplinado y ultra sedoso sin químicos tóxicos, sin vapores irritantes ni olores molestos. Respeta la salud capilar y reduce el volumen hasta un 90%.',
    includes: 'Diagnóstico de hebra, aplicación de activos botánicos, sellado térmico con placas de titanio, corte de puntas de regalo y ritual de argán.',
    recommendedFor: 'Quienes quieren levantarse todos los días peinadas y olvidarse de la plancha por 3 a 5 meses.',
    aftercare: 'No atar el cabello con elásticos apretados las primeras 48 horas. Usar línea de mantenimiento post-alisado.'
  },
  {
    id: 'srv-20',
    name: 'Nutrición, Reestructuración o Hidratación Capilar',
    category: 'tratamientos',
    specialist: 'Kiara',
    price: 150,
    isFrom: true,
    duration: 75,
    bestSeller: false,
    badge: '💧 Terapia Anti-Age',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    description: 'Cóctel vitamínico personalizado según las necesidades del cabello (deshidratación, falta de lípidos o pérdida de proteínas) evaluado por Kiara.',
    includes: 'Diagnóstico capilar en salón, mascarilla de alta nutrición, vaporizador sellador y cepillado final.',
    recommendedFor: 'Cabellos secos por exposición al sol, tintes continuos o uso diario de calor.',
    aftercare: 'Mantener con acondicionador humectante en casa.'
  },
  {
    id: 'srv-21',
    name: 'Shot de Keratina de Sellado Express',
    category: 'tratamientos',
    specialist: 'Kiara',
    price: 100,
    isFrom: false,
    duration: 60,
    bestSeller: false,
    badge: '⚡ Dosis Express Antifrizz',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    description: 'Dosis concentrada de keratina pura hidrolizada para sellar cutículas abiertas, alinear el cabello y aportar suavidad instantánea.',
    includes: 'Lavado suave, shot concentrado de queratina con calor térmico y brushing sellador.',
    recommendedFor: 'Cabellos con frizz moderado que no desean un alisado químico completo pero buscan peinabilidad rápida.',
    aftercare: 'Dura aproximadamente 3 a 4 semanas.'
  },

  // --- 👁️ MIRADA & CEJAS ---
  {
    id: 'srv-25',
    name: 'Lifting de Pestañas + Tinte (Regalo: Perfilado de Cejas)',
    category: 'tradicionales',
    specialist: 'Cielo',
    price: 100,
    isFrom: false,
    duration: 60,
    bestSeller: true,
    badge: '🎁 Incluye Perfilado Gratis',
    image: './images/lifting_pestanas.jpg',
    description: 'Curvatura natural elegante desde la raíz que alarga visualmente tus pestañas naturales + tinte negro carbón efecto rímel permanente.',
    includes: 'Lifting con siliconas anatómicas, tinte intensificador, suero nutritivo de queratina y DE REGALO un perfilado y diseño de cejas con Cielo.',
    recommendedFor: 'Mirada abierta, descansada y expresiva sin necesidad de extensiones ni maquillaje diario.',
    aftercare: 'No mojar ni aplicar vapor en los ojos durante las primeras 24 horas.'
  },
  {
    id: 'srv-25-b',
    name: 'Lifting de Pestañas (Solo Curvatura)',
    category: 'tradicionales',
    specialist: 'Cielo',
    price: 80,
    isFrom: false,
    duration: 50,
    bestSeller: false,
    badge: '👁️ Mirada Natural',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    description: 'Rizado semipermanente para quienes ya tienen pestañas oscuras y solo buscan apertura y curvatura duradera.',
    includes: 'Curvado profesional con moldes anatómicos y sérum botánico sellador.',
    recommendedFor: 'Pestañas rectas o caídas.',
    aftercare: 'Cepillar con goupillon seco diariamente.'
  },
  {
    id: 'srv-26',
    name: 'Planchado / Pigmento de Cejas',
    category: 'tradicionales',
    specialist: 'Cielo',
    price: 40,
    isFrom: false,
    duration: 30,
    bestSeller: false,
    badge: '✨ Cejas Definidas',
    image: 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?auto=format&fit=crop&w=800&q=80',
    description: 'Diseño morfológico, fijación de vellos rebeldes (laminado) o sombreado semipermanente con pigmento hipoalergénico para rellenar espacios claros.',
    includes: 'Diseño y visagismo de cejas, alisado de vello o pigmentación y gel fijador.',
    recommendedFor: 'Cejas con remolinos, poco pobladas o asimétricas.',
    aftercare: 'Evitar exfoliantes en la zona de las cejas.'
  },
  {
    id: 'srv-31',
    name: 'Depilación con Hilo — Cejas con Diseño',
    category: 'tradicionales',
    specialist: 'Cielo',
    price: 25,
    isFrom: false,
    duration: 20,
    bestSeller: false,
    badge: '🌿 Hipoalergénico',
    image: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=800&q=80',
    description: 'Técnica milenaria higiénica con hilo de algodón 100% orgánico. Extrae el vello desde la raíz sin quemar la piel ni provocar flacidez en el párpado.',
    includes: 'Diseño de arco según tu rostro, depilación precisa con hilo y aplicación de gel calmante post-depilatorio.',
    recommendedFor: 'Pieles sensibles, con rosácea o que usan ácidos/retinol y no pueden usar cera.',
    aftercare: 'No exponerse directamente al sol en las horas inmediatas.'
  },
  {
    id: 'srv-30',
    name: 'Depilación con Hilo — Bozo',
    category: 'tradicionales',
    specialist: 'Cielo',
    price: 25,
    isFrom: false,
    duration: 15,
    bestSeller: false,
    badge: '🌿 Suavidad Total',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    description: 'Depilación rápida y limpia del labio superior con hilo orgánico. Deja la zona ultrasuave y libre de vello fino.',
    includes: 'Extracción folicular con hilo y loción calmante de aloe vera.',
    recommendedFor: 'Eliminar vellos finos sin manchar la piel.',
    aftercare: 'Usar protector solar en el rostro.'
  },
  {
    id: 'srv-32',
    name: 'Depilación con Hilo — Rostro Completo',
    category: 'tradicionales',
    specialist: 'Cielo',
    price: 50,
    isFrom: false,
    duration: 40,
    bestSeller: false,
    badge: '✨ Piel de Porcelana',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    description: 'Depilación integral con hilo en frente, sienes, mejillas, patillas, bozo y mentón. Efecto peeling que mejora la fijación del maquillaje.',
    includes: 'Depilación facial completa con hilo y mascarilla fría descongestiva de cortesía.',
    recommendedFor: 'Clientas que desean una tez limpia y luminosa para sesiones de fotos o eventos.',
    aftercare: 'Evitar maquillaje pesado las primeras 12 horas.'
  },

  // --- 🧴 RETIROS & CUIDADOS ---
  {
    id: 'srv-33',
    name: 'Retiro de Gel UV Profesional',
    category: 'retiros',
    specialist: 'Cielo',
    price: 20,
    isFrom: false,
    duration: 20,
    bestSeller: false,
    badge: '💅 Cuidado de la Uña',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80',
    description: 'Retiro seguro del esmalte en gel con envolturas humectantes sin limar la placa ungueal ni raspar la queratina natural de la uña.',
    includes: 'Compresas con removedor humectante, retiro suave y aceite vitamínico.',
    recommendedFor: 'Cuando quieres retirar tu gel sin dañar tus uñas naturales.',
    aftercare: 'Aplicar aceite de cutícula para nutrir.'
  },
  {
    id: 'srv-37',
    name: 'Retiro de Rubber Gel',
    category: 'retiros',
    specialist: 'Cielo',
    price: 30,
    isFrom: false,
    duration: 30,
    bestSeller: false,
    badge: '🌿 Sin Daño',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    description: 'Disolución y rebaje controlado del refuerzo rubber preservando el grosor y fuerza natural de la uña con pulido restaurador.',
    includes: 'Rebaje controlado, envoltura removedora, pulido hidratante y aceite nutritivo.',
    recommendedFor: 'Quienes pausan el refuerzo o cambiarán de técnica.',
    aftercare: 'Mantener con base fortalecedora.'
  },
  {
    id: 'srv-36',
    name: 'Retiro de Acrílicas o Polygel',
    category: 'retiros',
    specialist: 'Cielo',
    price: 40,
    isFrom: false,
    duration: 40,
    bestSeller: false,
    badge: '🛡️ Retiro Protegido',
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80',
    description: 'Desprendimiento suave de extensiones acrílicas o polygel con solvente especializado y baño nutritivo de cutícula sin arrancar la uña.',
    includes: 'Desbaste con fresa suave, remojo hidratante, limado suave y endurecedor.',
    recommendedFor: 'Descanso de extensiones sin debilitar la uña.',
    aftercare: 'Tratamiento fortalecedor recomendado.'
  },
  {
    id: 'srv-35',
    name: 'Cambio de Color Tradicional (OPI)',
    category: 'retiros',
    specialist: 'Cielo',
    price: 25,
    isFrom: false,
    duration: 25,
    bestSeller: false,
    badge: '🎨 Color Express',
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=80',
    description: 'Retiro del esmalte anterior tradicional y aplicación de una nueva capa de color de la carta de tonos OPI de secado normal.',
    includes: 'Desesmaltado humectante, nueva base protectora, dos capas de color y top coat.',
    recommendedFor: 'Cambio rápido de look.',
    aftercare: 'Dejar secar 15 minutos.'
  },
  {
    id: 'srv-34',
    name: 'Retiro de Esmalte Tradicional',
    category: 'retiros',
    specialist: 'Cielo',
    price: 5,
    isFrom: false,
    duration: 10,
    bestSeller: false,
    badge: '🌿 Express',
    image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=800&q=80',
    description: 'Retiro simple y limpio de esmalte común con algodón y removedor hidratante libre de acetona abrasiva.',
    includes: 'Desesmaltado limpio y crema rápida de manos.',
    recommendedFor: 'Limpieza antes de cualquier servicio.',
    aftercare: 'Hidratar con regularidad.'
  }
];

class LussoCatalogApp {
  constructor() {
    this.services = [...LUSSO_SERVICES_CATALOG];
    this.selectedServices = new Set();
    this.activeCategory = 'all';
    this.activeSpecialist = 'all';
    this.searchQuery = '';
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateCategoryCounts();
    this.renderCatalog();
    this.updateCartUI();
  }

  bindEvents() {
    // Category pills
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeCategory = e.currentTarget.getAttribute('data-cat');
        this.renderCatalog();
      });
    });

    // Specialist filter chips
    document.querySelectorAll('.chip-specialist').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.chip-specialist').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeSpecialist = e.currentTarget.getAttribute('data-specialist');
        this.renderCatalog();
      });
    });

    // Search Input
    const searchInput = document.getElementById('catalog-search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (clearBtn) {
          clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
        }
        this.renderCatalog();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          clearBtn.classList.remove('visible');
          searchInput.focus();
          this.renderCatalog();
        }
      });
    }

    // Drawer triggers
    const cartTrigger = document.getElementById('cart-pill-trigger');
    const drawerOverlay = document.getElementById('selection-drawer-overlay');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const btnClearSelection = document.getElementById('btn-clear-selection');

    if (cartTrigger) {
      cartTrigger.addEventListener('click', () => this.openDrawer());
    }
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) this.closeDrawer();
      });
    }
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => this.closeDrawer());
    }
    if (btnClearSelection) {
      btnClearSelection.addEventListener('click', () => this.clearSelection());
    }

    // Modal Close
    const modalOverlay = document.getElementById('detail-modal-overlay');
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeModal();
      });
    }
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => this.closeModal());
    }

    // QR Modal
    const btnShare = document.getElementById('btn-header-share');
    const btnQr = document.getElementById('btn-header-qr');
    const qrOverlay = document.getElementById('qr-modal-overlay');
    const btnCloseQr = document.getElementById('btn-close-qr');
    const btnCopyLink = document.getElementById('btn-copy-link');

    if (btnQr) btnQr.addEventListener('click', () => this.openQrModal());
    if (btnShare) btnShare.addEventListener('click', () => this.handleNativeShare());
    if (qrOverlay) {
      qrOverlay.addEventListener('click', (e) => {
        if (e.target === qrOverlay) this.closeQrModal();
      });
    }
    if (btnCloseQr) btnCloseQr.addEventListener('click', () => this.closeQrModal());
    if (btnCopyLink) btnCopyLink.addEventListener('click', () => this.copyCatalogLink());
  }

  updateCategoryCounts() {
    const counts = { all: this.services.length };
    this.services.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });

    document.querySelectorAll('.cat-btn').forEach(btn => {
      const cat = btn.getAttribute('data-cat');
      const countEl = btn.querySelector('.cat-count');
      if (countEl) {
        countEl.textContent = counts[cat] || 0;
      }
    });
  }

  getFilteredServices() {
    return this.services.filter(s => {
      const matchCategory = this.activeCategory === 'all' || s.category === this.activeCategory;
      const matchSpecialist = this.activeSpecialist === 'all' || s.specialist === this.activeSpecialist;
      const matchSearch = !this.searchQuery || 
        s.name.toLowerCase().includes(this.searchQuery) ||
        s.description.toLowerCase().includes(this.searchQuery) ||
        (s.includes && s.includes.toLowerCase().includes(this.searchQuery)) ||
        (s.badge && s.badge.toLowerCase().includes(this.searchQuery)) ||
        s.category.toLowerCase().includes(this.searchQuery);

      return matchCategory && matchSpecialist && matchSearch;
    });
  }

  renderCatalog() {
    const grid = document.getElementById('services-catalog-grid');
    const counterBadge = document.getElementById('section-counter-badge');
    if (!grid) return;

    const filtered = this.getFilteredServices();

    if (counterBadge) {
      counterBadge.textContent = `${filtered.length} servicio${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-catalog-box">
          <span class="empty-icon">🔍</span>
          <h3 class="empty-title">No encontramos servicios con esos criterios</h3>
          <p class="empty-desc">Prueba cambiando los filtros de categoría, estilista o limpiando el buscador.</p>
          <button class="btn-select-service" onclick="window.lussoCatalog.resetFilters()">
            ✨ Ver todos los 38 servicios
          </button>
        </div>
      `;
      return;
    }

    const categoryNames = {
      manicure: '💅 Manicure & Uñas',
      pedicure: '🦶 Pedicure Spa',
      corte: '✂️ Corte & Styling',
      color: '🎨 Colorimetría & Mechas',
      tratamientos: '✨ Tratamientos & Alisados',
      tradicionales: '👁️ Mirada & Depilación',
      retiros: '🧴 Retiros & Cuidados'
    };

    let html = '';
    filtered.forEach(s => {
      const isSelected = this.selectedServices.has(s.id);
      const isCielo = s.specialist === 'Cielo';
      const specialistBadgeClass = isCielo ? 'badge-specialist cielo' : 'badge-specialist kiara';
      const specialistIcon = isCielo ? '💅' : '✂️';
      const priceFormatted = s.isFrom ? `Desde S/ ${s.price}` : `S/ ${s.price}`;

      html += `
        <article class="service-visual-card ${s.bestSeller ? 'bestseller-highlight' : ''}" data-id="${s.id}">
          <div class="card-media-wrapper">
            <img src="${s.image}" alt="${s.name}" class="card-img" loading="lazy" onerror="this.src='./images/manicure_gel_uv.jpg'">
            <div class="card-img-gradient-overlay"></div>
            
            <div class="card-top-badges">
              ${s.bestSeller ? `<span class="badge-bestseller">⭐ Best Seller</span>` : `<span></span>`}
              <span class="${specialistBadgeClass}">
                ${specialistIcon} ${s.specialist}
              </span>
            </div>

            <div class="card-bottom-tags">
              <span class="card-duration-tag">⏱️ ${s.duration} min</span>
              ${s.badge && !s.bestSeller ? `<span class="card-freebie-tag">${s.badge}</span>` : ''}
              ${s.bestSeller && s.id === 'srv-25' ? `<span class="card-freebie-tag">🎁 Cejas de Regalo</span>` : ''}
            </div>
          </div>

          <div class="card-body">
            <span class="card-category-label">${categoryNames[s.category] || s.category}</span>
            <h3 class="card-service-title">${s.name}</h3>
            <p class="card-service-desc">${s.description}</p>

            ${s.includes ? `
              <div class="card-includes-box">
                <span class="includes-header">✨ Incluye / Valor Agregado:</span>
                <p class="includes-text">${s.includes}</p>
              </div>
            ` : ''}

            <div class="card-footer">
              <div class="card-price-block">
                <span class="price-prefix">${s.isFrom ? 'Inversión desde' : 'Precio del servicio'}</span>
                <div class="price-amount">
                  <span class="currency">S/</span>${s.price}
                </div>
              </div>

              <div class="card-actions-group">
                <button class="btn-card-detail" title="Ver ficha detallada" onclick="window.lussoCatalog.openModal('${s.id}')">
                  👁️
                </button>
                <button 
                  class="btn-select-service ${isSelected ? 'selected' : ''}" 
                  onclick="window.lussoCatalog.toggleSelectService('${s.id}')"
                  title="${isSelected ? 'Quitar de mi selección' : 'Añadir a mi selección'}"
                >
                  ${isSelected ? '✓ Seleccionado' : '+ Seleccionar'}
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    });

    grid.innerHTML = html;
  }

  resetFilters() {
    this.activeCategory = 'all';
    this.activeSpecialist = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('catalog-search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.classList.remove('visible');

    document.querySelectorAll('.cat-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cat') === 'all');
    });
    document.querySelectorAll('.chip-specialist').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-specialist') === 'all');
    });

    this.renderCatalog();
  }

  toggleSelectService(id) {
    if (this.selectedServices.has(id)) {
      this.selectedServices.delete(id);
    } else {
      this.selectedServices.add(id);
    }
    this.updateCartUI();
    this.renderCatalog();
  }

  updateCartUI() {
    const cartTrigger = document.getElementById('cart-pill-trigger');
    const badgeCount = document.getElementById('cart-badge-count');
    const pillTotal = document.getElementById('cart-pill-total');
    const count = this.selectedServices.size;

    let totalPrice = 0;
    let totalMinutes = 0;
    let hasFrom = false;

    this.selectedServices.forEach(id => {
      const s = this.services.find(srv => srv.id === id);
      if (s) {
        totalPrice += s.price;
        totalMinutes += s.duration || 45;
        if (s.isFrom) hasFrom = true;
      }
    });

    if (badgeCount) badgeCount.textContent = count;
    if (pillTotal) {
      pillTotal.textContent = count === 0 ? 'S/ 0' : (hasFrom ? `Desde S/ ${totalPrice}` : `S/ ${totalPrice}`);
    }

    if (cartTrigger) {
      cartTrigger.style.display = count > 0 ? 'flex' : 'none';
    }

    this.renderDrawerItems(totalPrice, totalMinutes, hasFrom);
  }

  renderDrawerItems(totalPrice, totalMinutes, hasFrom) {
    const listEl = document.getElementById('drawer-items-list');
    const totalEl = document.getElementById('drawer-total-amount');
    const timeEl = document.getElementById('drawer-total-time');
    const btnWa = document.getElementById('btn-agendar-wa');
    if (!listEl) return;

    if (this.selectedServices.size === 0) {
      listEl.innerHTML = `
        <div class="drawer-empty-state">
          <p style="font-size: 2.5rem; margin-bottom: 8px;">✨</p>
          <p style="font-weight: 700; color: var(--burgundy); margin-bottom: 4px;">Aún no has seleccionado servicios</p>
          <p style="font-size: 0.82rem;">Explora el catálogo y presiona "+ Seleccionar" en los que te gusten para cotizar tu cita.</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = 'S/ 0';
      if (timeEl) timeEl.textContent = '0 min';
      if (btnWa) {
        btnWa.style.pointerEvents = 'none';
        btnWa.style.opacity = '0.5';
      }
      return;
    }

    let html = '';
    const selectedList = [];

    this.selectedServices.forEach(id => {
      const s = this.services.find(srv => srv.id === id);
      if (s) {
        selectedList.push(s);
        html += `
          <div class="drawer-item">
            <div class="drawer-item-info">
              <span class="drawer-item-title">${s.name}</span>
              <span class="drawer-item-meta">
                ${s.specialist === 'Cielo' ? '💅 Cielo' : '✂️ Kiara'} • ⏱️ ${s.duration} min
              </span>
            </div>
            <span class="drawer-item-price">${s.isFrom ? 'Desde ' : ''}S/ ${s.price}</span>
            <button class="btn-remove-item" onclick="window.lussoCatalog.toggleSelectService('${s.id}')" title="Quitar">
              ✕
            </button>
          </div>
        `;
      }
    });

    listEl.innerHTML = html;

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeString = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins} min`;

    if (totalEl) totalEl.textContent = hasFrom ? `Desde S/ ${totalPrice}` : `S/ ${totalPrice}`;
    if (timeEl) timeEl.textContent = `~ ${timeString}`;

    if (btnWa) {
      btnWa.style.pointerEvents = 'auto';
      btnWa.style.opacity = '1';
      
      const itemsText = selectedList.map((s, idx) => 
        `  ${idx + 1}. *${s.name}* (${s.specialist}) — ${s.isFrom ? 'Desde ' : ''}S/ ${s.price}`
      ).join('\n');

      const waMessage = 
`¡Hola Lusso Beauty Salón! ✨
Estuve viendo su *Catálogo Virtual Profesional* y me encantaría consultar disponibilidad para los siguientes servicios:

${itemsText}

💰 *Presupuesto estimado:* ${hasFrom ? 'Desde ' : ''}S/ ${totalPrice}
⏱️ *Tiempo estimado:* ~${timeString}
📍 *Sede:* Calle Berlín 481, Miraflores

¿Qué horarios tendrían disponibles esta semana con Kiara / Cielo? Muchas gracias 💕`;

      btnWa.href = `https://wa.me/${LUSSO_PHONE}?text=${encodeURIComponent(waMessage)}`;
    }
  }

  openDrawer() {
    document.getElementById('selection-drawer')?.classList.add('open');
    document.getElementById('selection-drawer-overlay')?.classList.add('active');
  }

  closeDrawer() {
    document.getElementById('selection-drawer')?.classList.remove('open');
    document.getElementById('selection-drawer-overlay')?.classList.remove('active');
  }

  clearSelection() {
    this.selectedServices.clear();
    this.updateCartUI();
    this.renderCatalog();
  }

  openModal(id) {
    const s = this.services.find(srv => srv.id === id);
    if (!s) return;

    const overlay = document.getElementById('detail-modal-overlay');
    const modalContent = document.getElementById('detail-modal-card');
    if (!overlay || !modalContent) return;

    const isSelected = this.selectedServices.has(s.id);
    const isCielo = s.specialist === 'Cielo';
    const priceFormatted = s.isFrom ? `Desde S/ ${s.price}` : `S/ ${s.price}`;

    modalContent.innerHTML = `
      <button class="btn-close-modal" id="btn-close-modal" onclick="window.lussoCatalog.closeModal()">✕</button>
      
      <div class="modal-media-header">
        <img src="${s.image}" alt="${s.name}" class="modal-header-img" onerror="this.src='./images/manicure_gel_uv.jpg'">
      </div>

      <div class="modal-content-body">
        <div class="modal-top-info">
          <div>
            <div class="modal-meta-row mb-1">
              <span class="badge-specialist ${isCielo ? 'cielo' : 'kiara'}">
                ${isCielo ? '💅 Atención: Cielo' : '✂️ Atención: Kiara'}
              </span>
              <span class="card-duration-tag" style="background: rgba(74,21,33,0.1); color: var(--burgundy);">
                ⏱️ ${s.duration} min aprox.
              </span>
              ${s.bestSeller ? '<span class="badge-bestseller">⭐ Best Seller</span>' : ''}
            </div>
            <h2 class="modal-title">${s.name}</h2>
          </div>
          <div class="modal-price-tag">
            <span style="font-size: 1.1rem; color: var(--gold); font-family: var(--font-sans);">S/</span>${s.price}
          </div>
        </div>

        <div class="modal-box-info">
          <span class="modal-section-title">✨ Descripción del Servicio</span>
          <p>${s.description}</p>
        </div>

        ${s.includes ? `
          <div class="modal-box-info" style="background: var(--primary-soft); border-color: var(--primary-border);">
            <span class="modal-section-title" style="color: var(--burgundy);">🎁 ¿Qué incluye tu sesión?</span>
            <p style="font-weight: 600; color: var(--burgundy);">${s.includes}</p>
          </div>
        ` : ''}

        ${s.recommendedFor ? `
          <div>
            <span class="modal-section-title">💡 Recomendado para:</span>
            <p style="font-size: 0.88rem; color: var(--text-muted);">${s.recommendedFor}</p>
          </div>
        ` : ''}

        ${s.aftercare ? `
          <div>
            <span class="modal-section-title">🧴 Cuidados posteriores en casa:</span>
            <p style="font-size: 0.88rem; color: var(--text-muted);">${s.aftercare}</p>
          </div>
        ` : ''}

        <div class="modal-actions-footer">
          <button 
            class="btn-select-service ${isSelected ? 'selected' : ''}"
            style="padding: 12px 24px; font-size: 0.95rem;"
            onclick="window.lussoCatalog.toggleSelectService('${s.id}'); window.lussoCatalog.closeModal();"
          >
            ${isSelected ? '✓ Quitar de mi selección' : '+ Añadir a mi selección'}
          </button>

          <a 
            class="btn-header-wa" 
            style="padding: 12px 24px; font-size: 0.95rem;"
            target="_blank"
            href="https://wa.me/${LUSSO_PHONE}?text=${encodeURIComponent(`¡Hola Lusso Beauty Salón! Me interesa agendar el servicio de *${s.name}* (${priceFormatted}) con ${s.specialist} en Calle Berlín 481, Miraflores. ¿Qué horarios tienen disponibles? ✨`)}"
          >
            📲 Agendar ahora por WhatsApp
          </a>
        </div>
      </div>
    `;

    overlay.classList.add('active');
  }

  closeModal() {
    document.getElementById('detail-modal-overlay')?.classList.remove('active');
  }

  openQrModal() {
    const overlay = document.getElementById('qr-modal-overlay');
    const container = document.getElementById('qr-code-box');
    if (!overlay) return;

    const currentUrl = window.location.href.split('#')[0];
    
    if (container) {
      container.innerHTML = `
        <img 
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&color=4a-15-21&bgcolor=ffffff" 
          alt="Código QR del Catálogo LUSSO" 
          style="width: 100%; height: 100%; object-fit: contain;"
        />
      `;
    }

    overlay.classList.add('active');
  }

  closeQrModal() {
    document.getElementById('qr-modal-overlay')?.classList.remove('active');
  }

  async handleNativeShare() {
    const shareData = {
      title: 'LUSSO Beauty Salón — Catálogo Virtual',
      text: 'Explora nuestros 38 servicios de manicure, pedicure, colorimetría, cortes y tratamientos en Calle Berlín 481, Miraflores ✨',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        this.copyCatalogLink();
      }
    } else {
      this.copyCatalogLink();
    }
  }

  copyCatalogLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('btn-copy-link');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ ¡Enlace Copiado al Portapapeles!';
        btn.style.background = '#10b981';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2500);
      }
    });
  }
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  window.lussoCatalog = new LussoCatalogApp();
});
