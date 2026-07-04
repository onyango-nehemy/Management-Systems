import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedOwner = await bcrypt.hash('admin123', 10)
  const hashedAdmin = await bcrypt.hash('admin123', 10)
  const hashedStaff = await bcrypt.hash('staff123', 10)

  await prisma.user.createMany({
    data: [
      { name: 'Brightone Mbani', email: 'admin@biggiechillspot.co.ke', password: hashedOwner, role: 'owner' },
      { name: 'Grace Wanjiku',   email: 'grace@biggiechillspot.co.ke', password: hashedAdmin, role: 'admin' },
      { name: 'Faith Muthoni',   email: 'faith@biggiechillspot.co.ke', password: hashedStaff, role: 'staff' },
      { name: 'John Kamau',      email: 'john@biggiechillspot.co.ke',  password: hashedStaff, role: 'staff' },
      { name: 'Mary Atieno',     email: 'mary@biggiechillspot.co.ke',  password: hashedStaff, role: 'staff', active: false },
    ],
    skipDuplicates: true,
  })

  await prisma.product.createMany({
    data: [
      { name: 'Johnnie Walker Black Label', sku: 'JW-BL-750',    barcode: '5000267023852', category: 'Whiskey', price: 3200, wholesalePrice: 2800, wholesaleMinQty: 6,  cost: 2100, stock: 24,  threshold: 5,  unit: '750ml', emoji: '🥃' },
      { name: 'Jameson Irish Whiskey',       sku: 'JAM-750',      barcode: '5011007003544', category: 'Whiskey', price: 2800, wholesalePrice: 2400, wholesaleMinQty: 6,  cost: 1900, stock: 3,   threshold: 5,  unit: '750ml', emoji: '🥃' },
      { name: 'Jack Daniels No.7',           sku: 'JD-750',       barcode: '5099873011674', category: 'Whiskey', price: 3000, wholesalePrice: 2600, wholesaleMinQty: 6,  cost: 2000, stock: 18,  threshold: 6,  unit: '750ml', emoji: '🥃' },
      { name: 'Hennessy VS Cognac',          sku: 'HEN-VS-700',   barcode: '3245994001127', category: 'Brandy',  price: 4500, wholesalePrice: 4000, wholesaleMinQty: 4,  cost: 3100, stock: 9,   threshold: 4,  unit: '700ml', emoji: '🍾' },
      { name: 'Konyagi Spirit',              sku: 'KON-750',      barcode: '6161100440014', category: 'Gin',     price: 650,  wholesalePrice: 550,  wholesaleMinQty: 12, cost: 420,  stock: 2,   threshold: 10, unit: '750ml', emoji: '🍸' },
      { name: 'Smirnoff Vodka Red',          sku: 'SMI-750',      barcode: '5410316711104', category: 'Vodka',   price: 1400, wholesalePrice: 1200, wholesaleMinQty: 6,  cost: 950,  stock: 31,  threshold: 8,  unit: '750ml', emoji: '🫙' },
      { name: 'Captain Morgan Spiced',       sku: 'CAP-700',      barcode: '5000299210019', category: 'Rum',     price: 2200, wholesalePrice: 1900, wholesaleMinQty: 6,  cost: 1500, stock: 14,  threshold: 5,  unit: '700ml', emoji: '🍹' },
      { name: 'Tanqueray London Dry Gin',    sku: 'TAN-700',      barcode: '5000281004013', category: 'Gin',     price: 2600, wholesalePrice: 2200, wholesaleMinQty: 6,  cost: 1750, stock: 7,   threshold: 4,  unit: '700ml', emoji: '🍸' },
      { name: 'Tusker Lager',                sku: 'TUS-500',      barcode: '6161100110011', category: 'Beer',    price: 200,  wholesalePrice: 170,  wholesaleMinQty: 24, cost: 140,  stock: 144, threshold: 24, unit: '500ml', emoji: '🍺' },
      { name: 'Guinness Extra Stout',        sku: 'GUI-500',      barcode: '5000213007014', category: 'Beer',    price: 250,  wholesalePrice: 210,  wholesaleMinQty: 24, cost: 170,  stock: 72,  threshold: 24, unit: '500ml', emoji: '🍺' },
      { name: 'Nederburg Pinotage',          sku: 'NED-PIN-750',  barcode: '6001070031018', category: 'Wine',    price: 1800, wholesalePrice: 1500, wholesaleMinQty: 6,  cost: 1200, stock: 12,  threshold: 4,  unit: '750ml', emoji: '🍷' },
      { name: 'Drostdy Hof Cabernet',        sku: 'DRO-CAB-750',  barcode: '6001070120019', category: 'Wine',    price: 900,  wholesalePrice: 750,  wholesaleMinQty: 6,  cost: 580,  stock: 4,   threshold: 4,  unit: '750ml', emoji: '🍷' },
      { name: 'Glenfiddich 12yr',            sku: 'GLEN-12-700',  barcode: '5010327310011', category: 'Whiskey', price: 5800, wholesalePrice: 5200, wholesaleMinQty: 3,  cost: 4000, stock: 6,   threshold: 3,  unit: '700ml', emoji: '🥃' },
      { name: "Gordon's Pink Gin",           sku: 'GOR-PINK-700', barcode: '5000289931017', category: 'Gin',     price: 1900, wholesalePrice: 1600, wholesaleMinQty: 6,  cost: 1300, stock: 0,   threshold: 4,  unit: '700ml', emoji: '🍸' },
      { name: 'Coca-Cola',                   sku: 'CC-500',       barcode: '5449000000996', category: 'Mixers',  price: 80,   wholesalePrice: 65,   wholesaleMinQty: 24, cost: 55,   stock: 96,  threshold: 24, unit: '500ml', emoji: '🥤' },
      { name: 'Schweppes Tonic Water',       sku: 'SCH-TON-300',  barcode: '5410013106019', category: 'Mixers',  price: 80,   wholesalePrice: 65,   wholesaleMinQty: 24, cost: 55,   stock: 48,  threshold: 12, unit: '300ml', emoji: '🥤' },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Database seeded successfully')
  console.log('')
  console.log('📧 Login credentials:')
  console.log('   Owner:  admin@biggiechillspot.co.ke  / admin123')
  console.log('   Admin:  grace@biggiechillspot.co.ke  / admin123')
  console.log('   Staff:  faith@biggiechillspot.co.ke  / staff123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
