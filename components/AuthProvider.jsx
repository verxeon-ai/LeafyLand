'use client'
import { SessionProvider } from 'next-auth/react'

export default function AuthProvider({ children, session }) {
    return (
        <SessionProvider
            session={session}
            refetchOnWindowFocus={false}
            refetchOnMount={false}
            refetchInterval={0}
            refetchWhenOffline={false}
        >
            {children}
        </SessionProvider>
    )
}
