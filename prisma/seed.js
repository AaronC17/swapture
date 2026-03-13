const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  /* ═══════════════════════════════════════════
     ADMIN USER
     ═══════════════════════════════════════════ */
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  let adminUser = await prisma.user.findUnique({ where: { email: 'admin@swapture.com' } })
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@swapture.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      },
    })
  }

  /* ═══════════════════════════════════════════
     ESPARZA & OROTINA — categories (same menu, same prices)
     ORDER: Hamburguesas first, then sides, then other
     ═══════════════════════════════════════════ */

  // ── Classic Burgers (Esparza / Orotina) — no incluyen acompañamiento, papas crispy ₡1500 ──
  const classicBurgers = {
    name: 'Hamburguesas Clasicas', emoji: '',
    items: [
      { name: 'Cheeseburger', desc: 'Carne smash, queso cheddar, pepinillo, cebolla, salsa especial.', price: 3850 },
      { name: 'Bacon Cheeseburger', desc: 'Carne smash, queso cheddar, tocino, pepinillo, cebolla, salsa especial.', price: 4200 },
      { name: 'Doble Cheeseburger', desc: 'Doble carne smash, doble queso cheddar, pepinillo, cebolla, salsa especial.', price: 5350 },
      { name: 'Doble Bacon', desc: 'Doble carne smash, doble queso, tocino, pepinillo, cebolla, salsa especial.', price: 5950 },
      { name: 'Triple Bacon', desc: 'Triple carne smash, triple queso, tocino, pepinillo, cebolla, salsa especial.', price: 7400 },
      { name: 'Oklahoma', desc: 'Doble carne smash, queso cheddar, cebolla caramelizada smash, pepinillo, salsa BBQ.', price: 5750 },
    ],
  }

  // ── Premium Burgers (Esparza / Orotina) ──
  const premiumBurgers = {
    name: 'Hamburguesas Premium', emoji: '',
    items: [
      { name: 'Maradona', desc: 'Doble carne smash, queso cheddar, cebolla crispy, jalapeño, salsa chipotle.', price: 6000 },
      { name: 'Portobello', desc: 'Doble carne smash, queso suizo, hongos portobello salteados, rúcula, aioli trufado.', price: 6450 },
      { name: 'Mar y Tierra', desc: 'Doble carne smash, camarones salteados, queso cheddar, lechuga, tomate, salsa rosa.', price: 5600 },
      { name: 'Trufada', desc: 'Doble carne smash, queso brie, rúcula, cebolla caramelizada, aioli de trufa negra.', price: 8700 },
      { name: 'Tropical', desc: 'Doble carne smash, queso suizo, piña a la parrilla, tocino, salsa teriyaki.', price: 6600 },
      { name: 'Pork Belly', desc: 'Panceta glaseada, queso gouda ahumado, cebolla crispy, salsa BBQ.', price: 7200 },
    ],
  }

  // ── BBQ Lovers (Esparza / Orotina) ──
  const bbqLovers = {
    name: 'BBQ Lovers', emoji: '',
    items: [
      { name: 'Chicken Jalapeña', desc: 'Pechuga crispy, jalapeños, queso cheddar, tocino, salsa ranch.', price: 5900 },
      { name: 'Chicken BBQ', desc: 'Pechuga crispy, queso cheddar, tocino, aros de cebolla, salsa BBQ.', price: 6200 },
      { name: 'Onion BBQ', desc: 'Doble carne smash, queso cheddar, aros de cebolla, tocino, BBQ.', price: 6950 },
      { name: 'Pulled Pork', desc: 'Cerdo desmechado BBQ, coleslaw, pepinillos, salsa BBQ ahumada.', price: 4000 },
    ],
  }

  // ── Chicken Burgers (Esparza / Orotina) ──
  const chickenBurgers = {
    name: 'Hamburguesas de Pollo', emoji: '',
    items: [
      { name: 'Chicken Chipotle', desc: 'Pechuga crispy, salsa chipotle, queso pepper jack, lechuga, tomate.', price: 5900 },
      { name: 'Maple Fire Chicken', desc: 'Pechuga crispy bañada en salsa maple-sriracha, coleslaw, pepinillos.', price: 6750 },
      { name: 'Cheeselover', desc: 'Doble carne smash, triple queso (cheddar, suizo, americano), salsa especial.', price: 7950 },
    ],
  }

  // ── Classic Fries (Esparza / Orotina) — Small & Large ──
  const classicFries = {
    name: 'Papas Clasicas', emoji: '🍟',
    items: [
      { name: 'Francesas Small', desc: 'Papas francesas crujientes — small.', price: 1900 },
      { name: 'Francesas Large', desc: 'Papas francesas crujientes — large.', price: 2600 },
      { name: 'Gajo Small', desc: 'Papas gajo sazonadas — small.', price: 3300 },
      { name: 'Gajo Large', desc: 'Papas gajo sazonadas — large.', price: 4500 },
      { name: 'Salchipapas Small', desc: 'Papas francesas con salchicha, salsas especiales — small.', price: 2500 },
      { name: 'Salchipapas Large', desc: 'Papas francesas con salchicha, salsas especiales — large.', price: 3500 },
      { name: 'Papicarne Small', desc: 'Papas con carne desmechada y queso — small.', price: 4200 },
      { name: 'Papicarne Large', desc: 'Papas con carne desmechada y queso — large.', price: 7200 },
      { name: 'Gajo Mechada Small', desc: 'Papas gajo con carne mechada, queso cheddar, cebolla crispy — small.', price: 4900 },
      { name: 'Gajo Mechada Large', desc: 'Papas gajo con carne mechada, queso cheddar, cebolla crispy — large.', price: 7900 },
      { name: 'Salchipapicarne Small', desc: 'Papas con salchicha, carne desmechada, queso, salsas — small.', price: 4600 },
      { name: 'Salchipapicarne Large', desc: 'Papas con salchicha, carne desmechada, queso, salsas — large.', price: 7600 },
    ],
  }

  // ── Premium Fries (Esparza / Orotina) — Small & Large ──
  const premiumFries = {
    name: 'Papas Premium', emoji: '🍟',
    items: [
      { name: 'Papas Bacon Small', desc: 'Papas con tocino, queso cheddar derretido — small.', price: 2900 },
      { name: 'Papas Bacon Large', desc: 'Papas con tocino, queso cheddar derretido — large.', price: 4500 },
      { name: 'Papas Especiales Small', desc: 'Papas con carne smash, queso, tocino, cebolla crispy — small.', price: 4900 },
      { name: 'Papas Especiales Large', desc: 'Papas con carne smash, queso, tocino, cebolla crispy — large.', price: 7950 },
      { name: 'Papas Quincho Small', desc: 'Papas gajo, carne smash, queso cheddar, salsa de la casa — small.', price: 4700 },
      { name: 'Papas Quincho Large', desc: 'Papas gajo, carne smash, queso cheddar, salsa de la casa — large.', price: 6900 },
      { name: 'Papas Smash Small', desc: 'Papas smash crujientes con queso, tocino, salsas — small.', price: 4900 },
      { name: 'Papas Smash Large', desc: 'Papas smash crujientes con queso, tocino, salsas — large.', price: 7900 },
      { name: 'Monster Papas Small', desc: 'Papas con doble carne smash, doble queso, tocino — small.', price: 5500 },
      { name: 'Monster Papas Large', desc: 'Papas con doble carne smash, doble queso, tocino — large.', price: 9200 },
    ],
  }

  // ── Nachos (Esparza / Orotina) — Small & XL ──
  const nachos = {
    name: 'Nachos', emoji: '',
    items: [
      { name: 'Platinacho Small', desc: 'Nachos con plátano maduro, queso, salsas — small.', price: 4600 },
      { name: 'Platinacho XL', desc: 'Nachos con plátano maduro, queso, salsas — XL.', price: 7500 },
      { name: 'Nachos Pulled Pork Small', desc: 'Nachos con cerdo BBQ, queso cheddar, coleslaw — small.', price: 3950 },
      { name: 'Nachos Pulled Pork XL', desc: 'Nachos con cerdo BBQ, queso cheddar, coleslaw — XL.', price: 6900 },
      { name: 'Nachos de Pollo Small', desc: 'Nachos con pollo desmechado, queso, pico de gallo — small.', price: 4500 },
      { name: 'Nachos de Pollo XL', desc: 'Nachos con pollo desmechado, queso, pico de gallo — XL.', price: 7300 },
      { name: 'Nachos Mechada Small', desc: 'Nachos con carne mechada, queso, salsas — small.', price: 4600 },
      { name: 'Nachos Mechada XL', desc: 'Nachos con carne mechada, queso, salsas — XL.', price: 7500 },
      { name: 'Nachos Mixto Small', desc: 'Nachos con variedad de rellenos, queso, salsas — small.', price: 5900 },
      { name: 'Nachos Mixto XL', desc: 'Nachos con variedad de rellenos, queso, salsas — XL.', price: 9950 },
      { name: 'Nachos Trozos de Res Small', desc: 'Nachos con trozos de res, queso, salsas — small.', price: 4950 },
      { name: 'Nachos Trozos de Res XL', desc: 'Nachos con trozos de res, queso, salsas — XL.', price: 8950 },
      { name: 'Nachos Mar y Tierra Small', desc: 'Nachos con carne y camarones, queso, guacamole — small.', price: 7150 },
      { name: 'Nachos Mar y Tierra XL', desc: 'Nachos con carne y camarones, queso, guacamole — XL.', price: 13150 },
    ],
  }

  // ── Quesadillas (Esparza / Orotina) — Small & XL ──
  const quesadillas = {
    name: 'Quesadillas', emoji: '',
    items: [
      { name: 'Quesadilla Pulled Pork Small', desc: 'Tortilla con cerdo BBQ y queso gouda — small.', price: 4950 },
      { name: 'Quesadilla Pulled Pork XL', desc: 'Tortilla con cerdo BBQ y queso gouda — XL.', price: 7300 },
      { name: 'Quesadilla Pollo Small', desc: 'Tortilla con pollo desmechado y queso — small.', price: 4950 },
      { name: 'Quesadilla Pollo XL', desc: 'Tortilla con pollo desmechado y queso — XL.', price: 7300 },
      { name: 'Quesadilla Mechada Small', desc: 'Tortilla con carne mechada y queso cheddar — small.', price: 4950 },
      { name: 'Quesadilla Mechada XL', desc: 'Tortilla con carne mechada y queso cheddar — XL.', price: 7300 },
      { name: 'Quesadilla Mixta Small', desc: 'Tortilla con mezcla de rellenos y queso — small.', price: 5200 },
      { name: 'Quesadilla Mixta XL', desc: 'Tortilla con mezcla de rellenos y queso — XL.', price: 7950 },
      { name: 'Quesadilla Trozos de Res Small', desc: 'Tortilla con trozos de res y queso — small.', price: 5500 },
      { name: 'Quesadilla Trozos de Res XL', desc: 'Tortilla con trozos de res y queso — XL.', price: 8500 },
      { name: 'Quesadilla Camarón Small', desc: 'Tortilla con camarones y queso — small.', price: 5950 },
      { name: 'Quesadilla Camarón XL', desc: 'Tortilla con camarones y queso — XL.', price: 8950 },
    ],
  }

  // ── Burritos (Esparza / Orotina) — Small & XL ──
  const burritos = {
    name: 'Burritos', emoji: '',
    items: [
      { name: 'Burrito Pulled Pork Small', desc: 'Tortilla con cerdo BBQ, arroz, coleslaw, queso — small.', price: 3950 },
      { name: 'Burrito Pulled Pork XL', desc: 'Tortilla con cerdo BBQ, arroz, coleslaw, queso — XL.', price: 5950 },
      { name: 'Burrito Pollo Small', desc: 'Tortilla con pollo desmechado, arroz, queso, salsas — small.', price: 3950 },
      { name: 'Burrito Pollo XL', desc: 'Tortilla con pollo desmechado, arroz, queso, salsas — XL.', price: 5950 },
      { name: 'Burrito Mechada Small', desc: 'Tortilla con carne mechada, arroz, queso, pico de gallo — small.', price: 4300 },
      { name: 'Burrito Mechada XL', desc: 'Tortilla con carne mechada, arroz, queso, pico de gallo — XL.', price: 6300 },
      { name: 'Burrito Mixto Small', desc: 'Tortilla con mezcla de rellenos, arroz, queso — small.', price: 4600 },
      { name: 'Burrito Mixto XL', desc: 'Tortilla con mezcla de rellenos, arroz, queso — XL.', price: 6600 },
      { name: 'Burrito Chicharrón Small', desc: 'Tortilla con chicharrón, arroz, frijoles, queso — small.', price: 4750 },
      { name: 'Burrito Chicharrón XL', desc: 'Tortilla con chicharrón, arroz, frijoles, queso — XL.', price: 6950 },
      { name: 'Burrito Trozos de Res Small', desc: 'Tortilla con trozos de res, arroz, queso, salsas — small.', price: 4600 },
      { name: 'Burrito Trozos de Res XL', desc: 'Tortilla con trozos de res, arroz, queso, salsas — XL.', price: 6950 },
      { name: 'Burrito Camarón Small', desc: 'Tortilla con camarones, arroz, queso, salsa rosa — small.', price: 4950 },
      { name: 'Burrito Camarón XL', desc: 'Tortilla con camarones, arroz, queso, salsa rosa — XL.', price: 6950 },
    ],
  }

  // ── Snacks (Esparza / Orotina) — x6 & x12 ──
  const snacks = {
    name: 'Snacks', emoji: '',
    items: [
      { name: 'Bolitas de Yuca x6', desc: '6 bolitas de yuca rellenas de queso.', price: 2650 },
      { name: 'Bolitas de Yuca x12', desc: '12 bolitas de yuca rellenas de queso.', price: 4550 },
      { name: 'Palitos de Queso x6', desc: '6 palitos de queso mozzarella crujientes.', price: 3400 },
      { name: 'Palitos de Queso x12', desc: '12 palitos de queso mozzarella crujientes.', price: 5900 },
      { name: 'Aros de Cebolla x6', desc: '6 aros de cebolla empanizados.', price: 2900 },
      { name: 'Aros de Cebolla x12', desc: '12 aros de cebolla empanizados.', price: 5500 },
    ],
  }

  // ── Desayunos (Esparza / Orotina) ──
  const desayunos = {
    name: 'Desayunos', emoji: '',
    items: [
      { name: 'Pinto Económico', desc: 'Gallo pinto con huevo, natilla, tortilla.', price: 2500 },
      { name: 'Pinto de la Casa', desc: 'Gallo pinto con huevo, tocino, queso, plátano maduro, tortilla.', price: 4800 },
      { name: 'Quesopinto', desc: 'Gallo pinto con queso fundido, natilla.', price: 3500 },
      { name: 'Burripinto', desc: 'Burrito de gallo pinto con queso, huevo, natilla.', price: 2900 },
    ],
  }

  // ── Almuerzos / Casados (Esparza / Orotina) ──
  const almuerzos = {
    name: 'Almuerzos', emoji: '',
    items: [
      { name: 'Casado Carne Mechada', desc: 'Arroz, frijoles, ensalada, plátano, tortilla y carne mechada.', price: 4200 },
      { name: 'Casado Fajitas de Lomo', desc: 'Arroz, frijoles, ensalada, plátano, tortilla y fajitas de lomo.', price: 4700 },
      { name: 'Casado Pescado', desc: 'Arroz, frijoles, ensalada, plátano, tortilla y pescado.', price: 4500 },
      { name: 'Casado Pollo', desc: 'Arroz, frijoles, ensalada, plátano, tortilla y pollo.', price: 4200 },
    ],
  }

  // ── Batidos de fruta natural (Esparza / Orotina) — agua o leche ──
  const batidos = {
    name: 'Batidos', emoji: '',
    items: [
      { name: 'Batido de Sandía (Agua)', desc: 'Batido natural de sandía con agua.', price: 1700 },
      { name: 'Batido de Sandía (Leche)', desc: 'Batido cremoso de sandía con leche.', price: 2000 },
      { name: 'Batido de Melón (Agua)', desc: 'Batido natural de melón con agua.', price: 1700 },
      { name: 'Batido de Melón (Leche)', desc: 'Batido cremoso de melón con leche.', price: 2000 },
      { name: 'Batido de Fresa (Agua)', desc: 'Batido natural de fresa con agua.', price: 1700 },
      { name: 'Batido de Fresa (Leche)', desc: 'Batido cremoso de fresa con leche.', price: 2000 },
    ],
  }

  // ── Malteadas (Esparza / Orotina) ──
  const malteadas = {
    name: 'Malteadas', emoji: '',
    items: [
      { name: 'Malteada de Chicle', desc: 'Malteada cremosa sabor chicle con crema batida.', price: 2950 },
      { name: 'Malteada de Taro', desc: 'Malteada de taro púrpura con crema batida.', price: 2950 },
      { name: 'Malteada de Crema', desc: 'Malteada clásica de crema con toppings.', price: 2000 },
      { name: 'Malteada de Caramelo', desc: 'Malteada de caramelo con crema batida y topping.', price: 2950 },
      { name: 'Malteada Algodón de Azúcar', desc: 'Malteada de algodón de azúcar con crema.', price: 2950 },
      { name: 'Malteada de Melón Verde', desc: 'Malteada de melón verde con crema batida.', price: 2950 },
    ],
  }

  // ── Menú Infantil (Esparza / Orotina) ──
  const menuNinos = {
    name: 'Menu Infantil', emoji: '',
    items: [
      { name: 'Papas Jr', desc: 'Porción pequeña de papas francesas.', price: 1900 },
      { name: 'Salchipapas Jr', desc: 'Porción pequeña de salchipapas.', price: 2500 },
      { name: 'Deditos de Queso', desc: 'Palitos de queso tamaño kids.', price: 3400 },
      { name: 'Hamburguesa Jr', desc: 'Mini hamburguesa con queso para los pequeños.', price: 2950 },
      { name: 'Dedos de Pollo', desc: 'Tiras de pollo empanizado crujiente.', price: 4900 },
    ],
  }

  /* ═══════════════════════════════════════════
     JACÓ — categories (menú más corto, precios más altos)
     ═══════════════════════════════════════════ */

  // ── Classic Burgers (Jacó) ──
  const jacoClassicBurgers = {
    name: 'Hamburguesas Clasicas', emoji: '',
    items: [
      { name: 'Cheeseburger', desc: 'Carne smash, queso cheddar, pepinillo, cebolla, salsa especial.', price: 3900 },
      { name: 'Bacon Cheeseburger', desc: 'Carne smash, queso cheddar, tocino, pepinillo, cebolla, salsa especial.', price: 4900 },
      { name: 'Doble Cheeseburger', desc: 'Doble carne smash, doble queso cheddar, pepinillo, cebolla, salsa especial.', price: 5700 },
      { name: 'Doble Bacon', desc: 'Doble carne smash, doble queso, tocino, pepinillo, cebolla, salsa especial.', price: 5950 },
      { name: 'Triple Bacon', desc: 'Triple carne smash, triple queso, tocino, pepinillo, cebolla, salsa especial.', price: 7800 },
      { name: 'Oklahoma', desc: 'Doble carne smash, queso cheddar, cebolla caramelizada smash, pepinillo, salsa BBQ.', price: 5750 },
    ],
  }

  // ── Premium Burgers (Jacó) ──
  const jacoPremiumBurgers = {
    name: 'Hamburguesas Premium', emoji: '',
    items: [
      { name: 'Trufada', desc: 'Doble carne smash, queso brie, rúcula, cebolla caramelizada, aioli de trufa negra.', price: 8700 },
      { name: 'Portobello', desc: 'Doble carne smash, queso suizo, hongos portobello salteados, rúcula, aioli trufado.', price: 6750 },
      { name: 'Tropical', desc: 'Doble carne smash, queso suizo, piña a la parrilla, tocino, salsa teriyaki.', price: 6600 },
      { name: 'Cheeselover', desc: 'Doble carne smash, triple queso (cheddar, suizo, americano), salsa especial.', price: 8900 },
      { name: 'Onion BBQ', desc: 'Doble carne smash, queso cheddar, aros de cebolla, tocino, BBQ.', price: 7650 },
    ],
  }

  // ── Chicken Burgers (Jacó) ──
  const jacoChickenBurgers = {
    name: 'Hamburguesas de Pollo', emoji: '',
    items: [
      { name: 'Chicken Jalapeña', desc: 'Pechuga crispy, jalapeños, queso cheddar, tocino, salsa ranch.', price: 5900 },
      { name: 'Chicken BBQ', desc: 'Pechuga crispy, queso cheddar, tocino, aros de cebolla, salsa BBQ.', price: 6200 },
      { name: 'Chicken Chipotle', desc: 'Pechuga crispy, salsa chipotle, queso pepper jack, lechuga, tomate.', price: 5900 },
    ],
  }

  // ── Papas (Jacó) — Smash Fries & Bacon Fries ──
  const jacoPapas = {
    name: 'Papas', emoji: '🍟',
    items: [
      { name: 'Smash Fries Small', desc: 'Smash Fries crujientes — tamaño small.', price: 4900 },
      { name: 'Smash Fries XL', desc: 'Smash Fries crujientes — tamaño XL.', price: 7900 },
      { name: 'Bacon Fries Small', desc: 'Papas con tocino y queso — tamaño small.', price: 3250 },
      { name: 'Bacon Fries Large', desc: 'Papas con tocino y queso — tamaño large.', price: 4500 },
    ],
  }

  // ── Snacks (Jacó) — precios más altos ──
  const jacoSnacks = {
    name: 'Snacks', emoji: '',
    items: [
      { name: 'Bolitas de Yuca x6', desc: '6 bolitas de yuca rellenas de queso.', price: 2900 },
      { name: 'Bolitas de Yuca x12', desc: '12 bolitas de yuca rellenas de queso.', price: 4900 },
      { name: 'Palitos de Queso x6', desc: '6 palitos de queso mozzarella crujientes.', price: 3950 },
      { name: 'Palitos de Queso x12', desc: '12 palitos de queso mozzarella crujientes.', price: 7900 },
      { name: 'Aros de Cebolla x6', desc: '6 aros de cebolla empanizados.', price: 3400 },
      { name: 'Aros de Cebolla x12', desc: '12 aros de cebolla empanizados.', price: 5900 },
    ],
  }

  // ── Batidos (Jacó) — precio único, más caros ──
  const jacoBatidos = {
    name: 'Batidos', emoji: '',
    items: [
      { name: 'Batido de Sandía', desc: 'Batido natural de sandía.', price: 2700 },
      { name: 'Batido de Melón', desc: 'Batido natural de melón.', price: 2700 },
      { name: 'Batido de Fresa', desc: 'Batido natural de fresa.', price: 2700 },
    ],
  }

  /* ═══════════════════════════════════════════
     CLIENT — Quincho's Smash Burger
     ═══════════════════════════════════════════ */
  const menuJson = JSON.stringify({
    locations: {
      orotina: {
        name: 'Orotina',
        phone: '6358-0529',
        phone2: '',
        whatsapp: '+50663580529',
        hours: 'Jueves a Martes: 10:00 AM - 10:00 PM',
        categories: [
          classicBurgers,
          premiumBurgers,
          bbqLovers,
          chickenBurgers,
          classicFries,
          premiumFries,
          nachos,
          quesadillas,
          burritos,
          snacks,
          desayunos,
          almuerzos,
          batidos,
          malteadas,
          menuNinos,
        ],
      },
      jaco: {
        name: 'Jaco',
        phone: '6197-5889',
        phone2: '',
        whatsapp: '+50661975889',
        hours: 'Martes a Domingo: 10:00 AM - 2:00 AM',
        categories: [
          jacoClassicBurgers,
          jacoPremiumBurgers,
          jacoChickenBurgers,
          jacoPapas,
          jacoSnacks,
          jacoBatidos,
        ],
      },
      esparza: {
        name: 'Esparza',
        phone: '6237-2729',
        phone2: '',
        whatsapp: '+50662372729',
        hours: 'Jueves a Martes: 10:00 AM - 10:00 PM',
        categories: [
          classicBurgers,
          premiumBurgers,
          bbqLovers,
          chickenBurgers,
          classicFries,
          premiumFries,
          nachos,
          quesadillas,
          burritos,
          snacks,
          desayunos,
          almuerzos,
          batidos,
          malteadas,
          menuNinos,
        ],
      },
    },
    hours: 'Jueves a Martes: 10:00 AM - 10:00 PM',
    style: 'dark',
  })

  /* ═══════════════════════════════════════════
     QUINCHO'S CLIENT USER
     ═══════════════════════════════════════════ */
  const quinchoHashedPassword = await bcrypt.hash('quinchos2026', 10)

  let quinchoUser = await prisma.user.findUnique({ where: { email: 'quinchos@swapture.com' } })
  if (!quinchoUser) {
    quinchoUser = await prisma.user.create({
      data: {
        email: 'quinchos@swapture.com',
        password: quinchoHashedPassword,
        name: "Quincho's Smash Burger",
        role: 'client',
      },
    })
  }

  const existingClient = await prisma.client.findUnique({ where: { slug: 'quinchos-smash-burger' } })
  if (existingClient) {
    await prisma.client.update({
      where: { slug: 'quinchos-smash-burger' },
      data: { customNotes: menuJson, userId: quinchoUser.id },
    })
  } else {
    await prisma.client.create({
      data: {
        businessName: "Quincho's Smash Burger",
        slug: 'quinchos-smash-burger',
        whatsappNumber: '+50663580529',
        status: 'active',
        plan: 'premium',
        customNotes: menuJson,
        userId: quinchoUser.id,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
