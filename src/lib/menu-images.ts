/**
 * Mapa de imágenes por nombre de producto (compartido entre el menú público
 * y el editor del dashboard). Mantiene una sola fuente de verdad para que
 * el editor muestre exactamente las mismas imágenes que el cliente final.
 */
export const quinchosItemImages: Record<string, string> = {
  // — Batidos —
  'Batido de Sandía (Agua)': '/resto%20de%20menu/sand%C3%ADa.png',
  'Batido de Sandía (Leche)': '/resto%20de%20menu/sand%C3%ADa.png',
  'Batido de Sandía': '/resto%20de%20menu/sand%C3%ADa.png',
  'Batido de Melón (Agua)': '/resto%20de%20menu/mel%C3%B3n.png',
  'Batido de Melón (Leche)': '/resto%20de%20menu/mel%C3%B3n.png',
  'Batido de Melón': '/resto%20de%20menu/mel%C3%B3n.png',
  'Batido de Fresa (Agua)': '/resto%20de%20menu/fresa.png',
  'Batido de Fresa (Leche)': '/resto%20de%20menu/fresa.png',
  'Batido de Fresa': '/resto%20de%20menu/fresa.png',
  // — Malteadas —
  'Malteada de Chicle': '/resto%20de%20menu/CHICLE.png',
  'Malteada de Taro': '/resto%20de%20menu/taro.png',
  'Malteada de Caramelo': '/resto%20de%20menu/caramelo.png',
  'Malteada de Algodón de Azúcar': '/resto%20de%20menu/ALGOD%C3%93N%20DE%20AZ%C3%9ACAR.png',
  'Malteada Algodón de Azúcar': '/resto%20de%20menu/ALGOD%C3%93N%20DE%20AZ%C3%9ACAR.png',
  'Malteada de Melón Verde': '/resto%20de%20menu/MELON%20VERDE.png',
  'Malteada de Crema': '/resto%20de%20menu/crema.png',
  // — Entradas / Snacks —
  'Palitos de Queso': '/menu/PALITOS%20DE%20QUESO.png',
  'Aros de Cebolla': '/menu/AROS%20DE%20CEBOLLA.png',
  'Bolitas de Yuca': '/menu/BOLITAS%20DE%20YUCA.png',
  // — Desayunos —
  'Quesopinto': '/menu/QUESOPINTO.png',
  'Pinto Económico': '/menu/pinto%20econ%C3%B3mico.png',
  'Burripinto': '/menu/BURRIPINTO.png',
  'Pinto de la Casa': '/menu/PINTO%20DE%20LA%20CASA.png',
  // — Casados —
  'Casado de Pescado': '/resto%20de%20menu/CASADO%20CON%20PESCADO.png',
  'Casado de Pollo': '/resto%20de%20menu/CASADO%20CON%20POLLO.png',
  'Casado de Mechada': '/resto%20de%20menu/CASADO%20CON%20CARNE.png',
  'Casado de Fajitas': '/resto%20de%20menu/CASADO%20CON%20FAJITAS.png',
  'Casado Carne Mechada': '/resto%20de%20menu/CASADO%20CON%20CARNE.png',
  'Casado Fajitas de Lomo': '/resto%20de%20menu/CASADO%20CON%20FAJITAS.png',
  'Casado Pescado': '/resto%20de%20menu/CASADO%20CON%20PESCADO.png',
  'Casado Pollo': '/resto%20de%20menu/CASADO%20CON%20POLLO.png',
  // — Classic Burgers —
  'Cheeseburger': '/menu/CHEESEBURGUER.png',
  'Bacon Cheeseburger': '/menu/bacon%20cheeseburguer.png',
  'Bacon Cheese': '/menu/bacon%20cheeseburguer.png',
  'Cheeseburger Bacon': '/menu/bacon%20cheeseburguer.png',
  'Doble Cheeseburger': '/menu/double%20cheeseburguer.png',
  'Doble Cheese': '/menu/double%20cheeseburguer.png',
  'Doble Bacon': '/menu/double%20bacon.png',
  'Triple Bacon': '/menu/triple%20bacon.png',
  'Oklahoma': '/menu/oklahoma.png',
  // — Premium Burgers —
  'Maradona': '/menu/maradona.png',
  'Portobello': '/menu/portobello.png',
  'Mar y Tierra': '/menu/mar%20y%20tierra.png',
  'Trufada': '/menu/trufada.png',
  'Tropical': '/menu/tropical.png',
  'Pork Belly': '/menu/pork%20belly.png',
  // — BBQ —
  'BBQ Burger': '/menu/oklahoma.png',
  'BBQ Bacon': '/menu/double%20bacon.png',
  'BBQ Pulled Pork': '/menu/PULLED%20PORK.png',
  'Pulled Pork': '/menu/PULLED%20PORK.png',
  'Pulled Pork Small': '/menu/PULLED%20PORK.png',
  'Pulled Pork Large': '/menu/PULLED%20PORK.png',
  'Onion BBQ': '/menu/ONION%20BBQ.png',
  'Cheeselover': '/menu/CHEESELOVER.png',
  'Cheeselover BBQ': '/menu/CHEESELOVER.png',
  // — Chicken Burgers —
  'Crispy Chicken': '/menu/CHICKEN%20CHIPOTLE.png',
  'Buffalo Chicken': '/menu/CHICKEN%20BBQ.png',
  'Chicken Bacon': '/menu/bacon%20cheeseburguer.png',
  'Chipotle Chicken': '/menu/CHICKEN%20CHIPOTLE.png',
  'Chicken Chipotle': '/menu/CHICKEN%20CHIPOTLE.png',
  'Chicken Jalapeña': '/menu/CHICKEN%20JALAPE%C3%91A.png',
  'Maple Fire Chicken': '/menu/MAPLE%20FIRE%20CHICKEN.png',
  'Chicken BBQ': '/menu/CHICKEN%20BBQ.png',
  // — Papas Orotina (Classic / Premium Fries con tallas) —
  'Classic Fries Small': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Classic Fries Medium': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Classic Fries Large': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Classic Fries XL': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Premium Fries Small': '/papas/PAPAS%20ESPECIALES.png',
  'Premium Fries Medium': '/papas/PAPAS%20ESPECIALES.png',
  'Premium Fries Large': '/papas/PAPAS%20ESPECIALES.png',
  'Premium Fries XL': '/papas/PAPAS%20ESPECIALES.png',
  // — Papas Jacó (Smash / Bacon Fries con tallas) —
  'Smash Fries Small': '/papas/PAPAS%20SMASH.png',
  'Smash Fries Medium': '/papas/PAPAS%20SMASH.png',
  'Smash Fries Large': '/papas/PAPAS%20SMASH.png',
  'Smash Fries XL': '/papas/PAPAS%20SMASH.png',
  'Bacon Fries Small': '/papas/PAPAS%20BACON.png',
  'Bacon Fries Medium': '/papas/PAPAS%20BACON.png',
  'Bacon Fries Large': '/papas/PAPAS%20BACON.png',
  // — Papas Esparza (con tallas) —
  'Francesas Small': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Francesas Large': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Gajo Small': '/papas/ORDEN%20DE%20GAJO.png',
  'Gajo Large': '/papas/ORDEN%20DE%20GAJO.png',
  'Salchipapas Small': '/papas/SALCHIPAPAS.png',
  'Salchipapas Large': '/papas/SALCHIPAPAS.png',
  'Papicarne Small': '/papas/PAPICARNE.png',
  'Papicarne Large': '/papas/PAPICARNE.png',
  'Gajo Mechada Small': '/papas/GAJO%20MECHADA.png',
  'Gajo Mechada Large': '/papas/GAJO%20MECHADA.png',
  'Salchipapicarne Small': '/papas/SALCHIPAPICARNE.png',
  'Salchipapicarne Large': '/papas/SALCHIPAPICARNE.png',
  'Papas Bacon Small': '/papas/PAPAS%20BACON.png',
  'Papas Bacon Large': '/papas/PAPAS%20BACON.png',
  'Papas Especiales Small': '/papas/PAPAS%20ESPECIALES.png',
  'Papas Especiales Large': '/papas/PAPAS%20ESPECIALES.png',
  'Papas Quincho Small': '/papas/PAPAS%20QUINCHO.png',
  'Papas Quincho Large': '/papas/PAPAS%20QUINCHO.png',
  'Smash Monster Small': '/papas/PAPAS%20SMASH.png',
  'Smash Monster Large': '/papas/PAPAS%20SMASH.png',
  'Monster Papas Small': '/papas/MONSTER%20PAPAS.png',
  'Monster Papas Large': '/papas/MONSTER%20PAPAS.png',
  'Papas Smash Small': '/papas/PAPAS%20SMASH.png',
  'Papas Smash Large': '/papas/PAPAS%20SMASH.png',
  // — Papas genéricas (sin talla) —
  'Papas Francesas': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Papas Gajo': '/papas/ORDEN%20DE%20GAJO.png',
  'Salchipapas': '/papas/SALCHIPAPAS.png',
  'Papicarne': '/papas/PAPICARNE.png',
  'Gajo Mechada': '/papas/GAJO%20MECHADA.png',
  'Salchipapicarne': '/papas/SALCHIPAPICARNE.png',
  'Bacon Fries': '/papas/PAPAS%20BACON.png',
  'Bacon Fries XL': '/papas/PAPAS%20BACON.png',
  'Papas Especiales': '/papas/PAPAS%20ESPECIALES.png',
  'Papas Quincho': '/papas/PAPAS%20QUINCHO.png',
  'Smash Fries': '/papas/PAPAS%20SMASH.png',
  'Monster Fries': '/papas/MONSTER%20PAPAS.png',
  'Monster Papas': '/papas/MONSTER%20PAPAS.png',
  'Papas Smash': '/papas/PAPAS%20SMASH.png',
  // — Menú Infantil —
  'Papas Jr': '/papas/ORDEN%20DE%20FRANCESAS.png',
  'Salchipapas Jr': '/papas/SALCHIPAPAS.png',
  // — Sin imagen local → fallback —
  'Nachos Mix': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos de Pollo': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Pulled Pork': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Mechada': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos de Mechada': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Camarón': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos de Camarón': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Mar y Tierra': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Mixto': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos Trozos de Res': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Nachos de Res': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Platinacho': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop&q=80',
  'Quesadilla': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Queso': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Pollo': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Pollo': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Pulled Pork': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Mechada': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Mixta': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Trozos de Res': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Camarón': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Mechada': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Fajitas': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla de Camarón': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Quesadilla Mar y Tierra': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=500&fit=crop&q=80',
  'Burrito': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Queso': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Pollo': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Pollo': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Pulled Pork': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Mechada': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Mixto': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Chicharrón': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Trozos de Res': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Camarón': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Mechada': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Fajitas': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito de Camarón': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Burrito Mar y Tierra': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=500&fit=crop&q=80',
  'Deditos de Queso': 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=500&h=500&fit=crop&q=80',
  'Hamburguesa Jr': '/menu/CHEESEBURGUER.png',
  'Dedos de Pollo': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=500&fit=crop&q=80',
}

/** Alias de compatibilidad para componentes existentes de Quincho's. */
export const itemImages = quinchosItemImages

export const tresCuartosItemImages: Record<string, string> = {
  // — Burgers —
  'La Tres Cuartos': '/trescuartos/la-tres-cuartos.png',
  'La Doble Cheeseburger': '/trescuartos/la-doble-cheeseburger.png',
  'La Cheese Bacon': '/trescuartos/la-cheese-bacon.png',
  'La Cheese Jr': '/trescuartos/la-cheese-jr.png',
  'Combo Cheeseburgers': '/trescuartos/combo-cheeseburgers.png',
  'La Picantita': '/trescuartos/la-picantita.png',
  'La Trufada': '/trescuartos/la-trufada.png',
  'La Portobello': '/trescuartos/la-portobello.png',
  // — Sándwiches —
  'El Bien Montado': '/trescuartos/el-bien-montado.png',
  'La Tropicana': '/trescuartos/la-tropicana.png',
  'El Pepito': '/trescuartos/el-pepito.png',
  // — Aperitivos —
  'Alitas': '/trescuartos/alitas.png',
  'Alitas (10 unidades)': '/trescuartos/alitas.png',
  'Alitas (6 unidades)': '/trescuartos/alitas.png',
  'Alitas (6 pzas)': '/trescuartos/alitas.png',
  'Jalapeño Poppers': '/trescuartos/jalapeno-poppers.jpg',
  'Jalapeño Poppers (4 unidades)': '/trescuartos/jalapeno-poppers.jpg',
  'Jalapeño Poppers (6 pzas)': '/trescuartos/jalapeno-poppers.jpg',
  'Mozzarella Sticks': '/trescuartos/mozarella-sticks.png',
  'Mozzarella Sticks (4 unidades)': '/trescuartos/mozarella-sticks.png',
  'Mozzarella Sticks (6 pzas)': '/trescuartos/mozarella-sticks.png',
  'Los Doraditos': '/trescuartos/los-doraditos.png',
  'Los Doraditos (300 g de pollo con papas)': '/trescuartos/los-doraditos.png',
  'Los Doraditos (6 pzas)': '/trescuartos/los-doraditos.png',
  // — Malteadas —
  'Malteada de Fresa': '/trescuartos/malteada-fresa.png',
  'Malteada de Chocolate': '/trescuartos/malteada-chocolate.png',
  'Malteada de Crema': '/trescuartos/malteada-crema.png',
}

export const fallbackImage = 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=500&fit=crop&q=80'

/** Detecta si el negocio es Tres Cuartos por nombre o slug. */
export function isTresCuartosBrand(value?: string): boolean {
  if (!value) return false
  const v = value.toLowerCase()
  return v.includes('tres cuartos') || v.includes('tres-cuartos') || v.includes('trescuartos')
}

/**
 * Devuelve la imagen real de un producto: imagen personalizada (subida),
 * imagen del mapa estático por nombre, o fallback.
 * `businessName` se usa para elegir el mapa correcto (Quincho's vs Tres Cuartos).
 */
export function imageForItem(name: string, customImage?: string, businessName?: string): string {
  if (customImage) return customImage
  const map = isTresCuartosBrand(businessName) ? tresCuartosItemImages : quinchosItemImages
  return map[name] || fallbackImage
}
