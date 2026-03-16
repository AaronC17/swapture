import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getDatabaseUrl(): string {
	const databaseUrl = process.env.DATABASE_URL

	if (!databaseUrl) {
		throw new Error('DATABASE_URL is missing. Configure it in your environment variables.')
	}

	const isVercelRuntime = process.env.VERCEL === '1'
	if (process.env.NODE_ENV === 'production' && isVercelRuntime) {
		const isLocalDatabase = /localhost|127\.0\.0\.1/i.test(databaseUrl)
		if (isLocalDatabase) {
			throw new Error('DATABASE_URL points to localhost in production. Use a cloud MongoDB URI (for example, MongoDB Atlas).')
		}
	}

	return databaseUrl
}

const databaseUrl = getDatabaseUrl()

const prisma = globalForPrisma.prisma || new PrismaClient({
	datasources: {
		db: { url: databaseUrl },
	},
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
export default prisma
