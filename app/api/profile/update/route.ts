import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, avatar, username, twitterHandle, email } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.walletAddress, walletAddress.toLowerCase()),
    })

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (avatar !== undefined) updateData.customAvatar = avatar
    if (username !== undefined) {
      // Check if username is already taken by another user
      if (username) {
        const userWithSameUsername = await db.query.users.findFirst({
          where: eq(users.username, username),
        })

        if (userWithSameUsername && userWithSameUsername.walletAddress !== walletAddress.toLowerCase()) {
          return NextResponse.json(
            { error: 'Username already taken' },
            { status: 400 }
          )
        }
      }
      updateData.username = username
    }
    if (twitterHandle !== undefined) updateData.twitterHandle = twitterHandle
    if (email !== undefined) {
      updateData.email = email
      // Reset email verification if email changed
      if (existingUser && existingUser.email !== email) {
        updateData.emailVerified = false
      }
    }

    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.walletAddress, walletAddress.toLowerCase()))
        .returning()

      return NextResponse.json(updatedUser)
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          walletAddress: walletAddress.toLowerCase(),
          ...updateData,
        })
        .returning()

      return NextResponse.json(newUser)
    }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, walletAddress.toLowerCase()),
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
