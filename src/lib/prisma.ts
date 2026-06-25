import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function ensureDatabaseNameInMongoUrl(rawUrl: string): string {
	try {
		const url = new URL(rawUrl)
		if (url.protocol !== 'mongodb:' && url.protocol !== 'mongodb+srv:') {
			return rawUrl
		}

		if (!url.pathname || url.pathname === '/') {
			url.pathname = '/swapture'
		}

		return url.toString()
	} catch {
		return rawUrl
	}
}

function getDatabaseUrl(): string {
	const rawDatabaseUrl = process.env.DATABASE_URL || process.env.MONGODB_URI

	if (!rawDatabaseUrl) {
		throw new Error('DATABASE_URL or MONGODB_URI is missing. Configure one of them in your environment variables.')
	}

	const databaseUrl = ensureDatabaseNameInMongoUrl(rawDatabaseUrl)

	const isVercelRuntime = process.env.VERCEL === '1'
	if (process.env.NODE_ENV === 'production' && isVercelRuntime) {
		const isLocalDatabase = /localhost|127\.0\.0\.1/i.test(databaseUrl)
		if (isLocalDatabase) {
			throw new Error('DATABASE_URL points to localhost in production. Use a cloud MongoDB URI (for example, MongoDB Atlas).')
		}
	}

	return databaseUrl
}

function createPrismaClient(): PrismaClient {
	const databaseUrl = getDatabaseUrl()
	return new PrismaClient({
		datasources: {
			db: { url: databaseUrl },
		},
	})
}

/* Lazy initialization — PrismaClient is only created on first access,
   not at module import time. This prevents build-time failures when
   DATABASE_URL is not available during page data collection. */
let _client: PrismaClient | null = null

function getClient(): PrismaClient {
	if (!_client) {
		_client = globalForPrisma.prisma || createPrismaClient()
		if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _client
	}
	return _client
}

export const prisma = new Proxy({} as PrismaClient, {
	get(_, prop) {
		const client = getClient()
		const value = Reflect.get(client, prop)
		return typeof value === 'function' ? value.bind(client) : value
	},
})

export default prisma